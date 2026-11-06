import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, clients, payments, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      quoteToken,
      paymentOption,
      selectedInstalmentMonths,
      paymentType,
    } = body as {
      quoteToken: string;
      paymentOption?: "full_payment" | "payment_plan" | "institutional_funding";
      selectedInstalmentMonths?: number;
      paymentType?:
        | "deposit"
        | "full_payment"
        | "instalment_1"
        | "instalment_2"
        | "instalment_3"
        | "balance";
    };

    if (!quoteToken) {
      return NextResponse.json(
        { success: false, error: "Missing quote token." },
        { status: 400 }
      );
    }

    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.token, quoteToken))
      .limit(1);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found." },
        { status: 404 }
      );
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, quote.clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client record not found." },
        { status: 404 }
      );
    }

    // Update quote if client changed payment option or instalment months before first payment
    const effectiveOption = paymentOption || quote.paymentOption;
    const cappedMonths =
      effectiveOption === "payment_plan"
        ? Math.min(
            quote.maxInstalmentMonths,
            Math.max(
              2,
              selectedInstalmentMonths || quote.selectedInstalmentMonths
            )
          )
        : quote.maxInstalmentMonths;

    const depositPercentage =
      effectiveOption === "payment_plan"
        ? 50
        : effectiveOption === "institutional_funding"
          ? 0
          : 100;
    const depositRequiredCents =
      effectiveOption === "payment_plan"
        ? Math.round(quote.totalFeeCents * 0.5)
        : effectiveOption === "institutional_funding"
          ? 0
          : quote.totalFeeCents;

    const nowIso = new Date().toISOString();

    if (quote.paidToDateCents === 0) {
      const remAfterDeposit = quote.totalFeeCents - depositRequiredCents;
      const baseInst =
        cappedMonths > 0 ? Math.floor(remAfterDeposit / cappedMonths) : 0;
      const remInst = remAfterDeposit - baseInst * cappedMonths;

      await db
        .update(quotes)
        .set({
          paymentOption: effectiveOption,
          selectedInstalmentMonths: cappedMonths,
          depositPercentage,
          depositRequiredCents,
          outcome: "accepted",
          acceptedAt: quote.acceptedAt || nowIso,
          instalment1AmountCents:
            effectiveOption === "payment_plan" ? baseInst : null,
          instalment2AmountCents:
            effectiveOption === "payment_plan" && cappedMonths >= 2
              ? cappedMonths === 2
                ? baseInst + remInst
                : baseInst
              : null,
          instalment3AmountCents:
            effectiveOption === "payment_plan" && cappedMonths >= 3
              ? baseInst + remInst
              : null,
          updatedAt: nowIso,
        })
        .where(eq(quotes.id, quote.id));

      await db
        .update(projects)
        .set({
          paymentOption: effectiveOption,
          stage: "accepted",
          updatedAt: nowIso,
        })
        .where(eq(projects.id, quote.projectId));
    }

    // Determine exact amount to charge now
    const resolvedPaymentType =
      paymentType ||
      (effectiveOption === "payment_plan" && quote.paidToDateCents === 0
        ? "deposit"
        : quote.paidToDateCents === 0
          ? "full_payment"
          : "balance");

    let amountToChargeCents = quote.balanceCents;
    if (resolvedPaymentType === "deposit") {
      amountToChargeCents = depositRequiredCents;
    } else if (
      resolvedPaymentType === "instalment_1" &&
      quote.instalment1AmountCents
    ) {
      amountToChargeCents = Math.min(
        quote.balanceCents,
        quote.instalment1AmountCents
      );
    } else if (
      resolvedPaymentType === "instalment_2" &&
      quote.instalment2AmountCents
    ) {
      amountToChargeCents = Math.min(
        quote.balanceCents,
        quote.instalment2AmountCents
      );
    } else if (
      resolvedPaymentType === "instalment_3" &&
      quote.instalment3AmountCents
    ) {
      amountToChargeCents = Math.min(
        quote.balanceCents,
        quote.instalment3AmountCents
      );
    }

    if (amountToChargeCents <= 0) {
      return NextResponse.json(
        { success: false, error: "This quote is already paid in full." },
        { status: 400 }
      );
    }

    // Reference always starts with the quoteNumber for clean reconciliation
    const shortRand = crypto.randomUUID().slice(0, 4).toUpperCase();
    const paystackReference = `${quote.quoteNumber}-${shortRand}`;

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://www.tweaks.co.za";
    const callbackUrl = `${origin}/quote/${quote.token}`;

    const initResult = await initializePaystackTransaction({
      email: client.email,
      amountCents: amountToChargeCents,
      reference: paystackReference,
      callbackUrl,
      metadata: {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        projectId: quote.projectId,
        clientId: client.id,
        paymentType: resolvedPaymentType,
      },
    });

    if (!initResult.success || !initResult.authorizationUrl) {
      return NextResponse.json(
        {
          success: false,
          error: initResult.error || "Could not initialize Paystack checkout.",
        },
        { status: 500 }
      );
    }

    await db.insert(payments).values({
      projectId: quote.projectId,
      quoteId: quote.id,
      clientId: client.id,
      paymentType: resolvedPaymentType,
      amountCents: amountToChargeCents,
      currency: "ZAR",
      method: "paystack",
      status: "pending",
      paystackReference: initResult.reference,
      paystackAccessCode: initResult.accessCode || null,
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: initResult.authorizationUrl,
      reference: initResult.reference,
      simulated: initResult.simulated,
    });
  } catch (error) {
    console.error("Paystack initialize route error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start payment session." },
      { status: 500 }
    );
  }
}

