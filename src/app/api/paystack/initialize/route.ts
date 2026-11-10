import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, clients, payments, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initializePaystackTransaction } from "@/lib/paystack";
import { getAppUrl, getConfiguredAppUrl } from "@/lib/app-url";
import type { PaymentOption } from "@/db/schema";

const PAYMENT_TYPES = [
  "deposit",
  "full_payment",
  "instalment_1",
  "instalment_2",
  "instalment_3",
  "balance",
] as const;

type PaymentType = (typeof PAYMENT_TYPES)[number];

const PAYMENT_OPTIONS = [
  "full_payment",
  "payment_plan",
  "institutional_funding",
] as const;

/**
 * Returns a trusted absolute origin for the Paystack callback URL.
 * Prefers the configured app URL, then the request origin only when it is a
 * known host, so a spoofed Origin header cannot redirect the client elsewhere.
 */
function resolveAppOrigin(request: NextRequest): string {
  const configured = getConfiguredAppUrl();
  if (configured) return configured;

  const origin = request.headers.get("origin");
  const allowed =
    /^https?:\/\/(localhost(:\d+)?|([a-z0-9-]+\.)*tweaks\.co\.za|([a-z0-9-]+\.)*vercel\.app)$/i;

  if (origin && allowed.test(origin)) return origin.replace(/\/$/, "");

  // Preview deployments resolve to their own Vercel URL; production and local
  // fall back to the canonical/local origin.
  return getAppUrl();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      quoteToken?: string;
      paymentOption?: PaymentOption;
      selectedInstalmentMonths?: number;
      paymentType?: PaymentType;
    };

    const {
      quoteToken,
      paymentOption,
      selectedInstalmentMonths,
      paymentType,
    } = body;

    if (!quoteToken || typeof quoteToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing quote token." },
        { status: 400 }
      );
    }

    if (paymentOption && !PAYMENT_OPTIONS.includes(paymentOption)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment option." },
        { status: 400 }
      );
    }

    if (paymentType && !PAYMENT_TYPES.includes(paymentType)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment type." },
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

    if (quote.outcome === "declined" || quote.outcome === "expired") {
      return NextResponse.json(
        { success: false, error: "This quote is no longer payable." },
        { status: 400 }
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

    if (!client.email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid email address is required to pay online.",
        },
        { status: 400 }
      );
    }

    const effectiveOption = paymentOption || quote.paymentOption;

    if (effectiveOption === "institutional_funding") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Institutional quotes are settled by purchase order (PO), not online payment.",
        },
        { status: 400 }
      );
    }

    // Update quote if client changed payment option or instalment months before first payment
    const requestedMonths =
      typeof selectedInstalmentMonths === "number" &&
      Number.isFinite(selectedInstalmentMonths)
        ? selectedInstalmentMonths
        : quote.selectedInstalmentMonths;

    const cappedMonths =
      effectiveOption === "payment_plan"
        ? Math.min(
            quote.maxInstalmentMonths,
            Math.max(2, requestedMonths)
          )
        : quote.maxInstalmentMonths;

    const depositPercentage = effectiveOption === "payment_plan" ? 50 : 100;
    const depositRequiredCents =
      effectiveOption === "payment_plan"
        ? Math.round(quote.totalFeeCents * 0.5)
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
    const resolvedPaymentType: PaymentType =
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

    // Reference always starts with the quoteNumber for clean reconciliation.
    // 8 random characters keeps collisions effectively impossible.
    const shortRand = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const paystackReference = `${quote.quoteNumber}-${shortRand}`;

    const origin = resolveAppOrigin(request);
    const callbackUrl = `${origin}/quote/${quote.token}`;

    // Create the pending payment before calling Paystack so the webhook can
    // always find the reference, even if this request times out afterwards.
    const [pendingPayment] = await db
      .insert(payments)
      .values({
        projectId: quote.projectId,
        quoteId: quote.id,
        clientId: client.id,
        paymentType: resolvedPaymentType,
        amountCents: amountToChargeCents,
        currency: "ZAR",
        method: "paystack",
        status: "pending",
        paystackReference,
      })
      .returning();

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
      await db
        .update(payments)
        .set({
          status: "failed",
          notes:
            initResult.error || "Could not initialize Paystack checkout.",
        })
        .where(eq(payments.id, pendingPayment.id));

      return NextResponse.json(
        {
          success: false,
          error: initResult.error || "Could not initialize Paystack checkout.",
        },
        { status: 500 }
      );
    }

    await db
      .update(payments)
      .set({
        paystackReference: initResult.reference,
        paystackAccessCode: initResult.accessCode || null,
      })
      .where(eq(payments.id, pendingPayment.id));

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
