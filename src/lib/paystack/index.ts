import crypto from "crypto";
import { db } from "@/db";
import { payments, quotes, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

/**
 * Read the secret key at call time so runtime env changes (and test keys)
 * are always picked up correctly.
 *
 * NOTE: This key must never be exposed to the browser. Paystack uses the same
 * secret key to sign webhook payloads, so there is no separate webhook secret.
 */
export function getPaystackSecretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || "";
}

export function isPaystackConfigured(): boolean {
  return getPaystackSecretKey().length > 0;
}

/**
 * Local/dev-only simulation so the payment flow can be tested without a
 * Paystack account. This is deliberately disabled in production: allowing it
 * there would let anyone mark an invoice as paid for free.
 */
function isSimulationAllowed(): boolean {
  return !isPaystackConfigured() && process.env.NODE_ENV !== "production";
}

export interface InitializePaystackInput {
  email: string;
  /** Amount in ZAR cents (Paystack expects the subunit as an integer) */
  amountCents: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializePaystackResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Initializes a transaction with Paystack in ZAR.
 * If PAYSTACK_SECRET_KEY is not configured in local dev, returns a simulated callback URL
 * so the payment flow can still be tested end-to-end locally.
 */
export async function initializePaystackTransaction(
  input: InitializePaystackInput
): Promise<InitializePaystackResponse> {
  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    if (!isSimulationAllowed()) {
      return {
        success: false,
        reference: input.reference,
        error:
          "Paystack is not configured. Set PAYSTACK_SECRET_KEY before accepting payments.",
      };
    }

    const simUrl = new URL(input.callbackUrl);
    simUrl.searchParams.set("reference", input.reference);
    simUrl.searchParams.set("simulated", "true");
    return {
      success: true,
      authorizationUrl: simUrl.toString(),
      accessCode: `SIM_${input.reference}`,
      reference: input.reference,
      simulated: true,
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountCents,
        currency: "ZAR",
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
    });

    const json = await response.json();
    if (!response.ok || !json.status) {
      return {
        success: false,
        reference: input.reference,
        error: json.message || "Failed to initialize Paystack transaction",
      };
    }

    return {
      success: true,
      authorizationUrl: json.data.authorization_url,
      accessCode: json.data.access_code,
      reference: json.data.reference,
    };
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return {
      success: false,
      reference: input.reference,
      error: "Unable to reach Paystack gateway.",
    };
  }
}

/**
 * Verifies a Paystack webhook HMAC SHA-512 signature.
 * Paystack sends the hex digest of the raw request body in `x-paystack-signature`.
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secretKey = getPaystackSecretKey();
  if (!secretKey || !signature) return false;

  const expected = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest();
  const provided = Buffer.from(signature, "hex");

  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(provided, expected);
}

async function appendPaymentNote(paymentId: string, note: string) {
  const [row] = await db
    .select({ notes: payments.notes })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  const nextNotes = [row?.notes, note].filter(Boolean).join(" | ");
  await db
    .update(payments)
    .set({ notes: nextNotes })
    .where(eq(payments.id, paymentId));
}

/**
 * Marks a pending payment as failed (e.g. from a `charge.failed` webhook).
 * Successful or refunded payments are never downgraded.
 */
export async function markPaymentFailed(reference: string, reason?: string) {
  const [paymentRow] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, reference))
    .limit(1);

  if (!paymentRow) return null;
  if (paymentRow.status === "success" || paymentRow.status === "refunded") {
    return paymentRow;
  }

  await db
    .update(payments)
    .set({
      status: "failed",
      notes: reason
        ? [paymentRow.notes, reason].filter(Boolean).join(" | ")
        : paymentRow.notes,
    })
    .where(eq(payments.id, paymentRow.id));

  return paymentRow;
}

/**
 * Marks a payment as refunded and recalculates the quote/project state so the
 * outstanding balance comes back.
 */
export async function markPaymentRefunded(reference: string) {
  const [paymentRow] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, reference))
    .limit(1);

  if (!paymentRow) return null;

  if (paymentRow.status !== "refunded") {
    await db
      .update(payments)
      .set({
        status: "refunded",
        notes: [paymentRow.notes, "Refunded via Paystack webhook."]
          .filter(Boolean)
          .join(" | "),
      })
      .where(eq(payments.id, paymentRow.id));
  }

  return recalculateQuoteAndProjectFromPayments(paymentRow.quoteId);
}

/**
 * Records a confirmed payment (from Paystack webhook/verify or manual EFT reconciliation)
 * and recalculates:
 * - quotes.paidToDateCents (sum over all successful payments for the quote)
 * - quotes.balanceCents (totalFeeCents - paidToDateCents)
 * - quotes.instalment1..3DueDate (set 1, 2, 3 months from deposit date when Option 2 deposit lands)
 * - projects.releaseWork (flips to true when balanceCents <= 0 or Option 3 PO exists)
 */
export async function settlePaymentAndRecalculateQuote(params: {
  paymentId: string;
  transactionId?: string;
  channel?: string;
  feesCents?: number;
  paidAt?: string;
}) {
  const nowIso = params.paidAt || new Date().toISOString();

  const [paymentRow] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, params.paymentId))
    .limit(1);

  if (!paymentRow) return null;

  // Idempotent: webhooks and the browser callback can both verify the same
  // reference. Re-settling should only recalculate, never double-count.
  if (paymentRow.status === "success") {
    return recalculateQuoteAndProjectFromPayments(
      paymentRow.quoteId,
      paymentRow.paidAt || nowIso
    );
  }

  const receiptNumber =
    paymentRow.receiptNumber ||
    `RCP-${new Date().getFullYear()}-${crypto
      .randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

  await db
    .update(payments)
    .set({
      status: "success",
      paystackTransactionId:
        params.transactionId ?? paymentRow.paystackTransactionId,
      paystackChannel: params.channel ?? paymentRow.paystackChannel,
      paystackFeesCents: params.feesCents ?? paymentRow.paystackFeesCents,
      receiptNumber,
      paidAt: nowIso,
    })
    .where(eq(payments.id, paymentRow.id));

  return recalculateQuoteAndProjectFromPayments(paymentRow.quoteId, nowIso);
}

/**
 * Sums all successful payments for a quote and updates quote + project state.
 */
export async function recalculateQuoteAndProjectFromPayments(
  quoteId: string,
  depositLandedAtIso?: string
) {
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!quote) return null;

  const successfulPayments = await db
    .select()
    .from(payments)
    .where(and(eq(payments.quoteId, quoteId), eq(payments.status, "success")));

  const paidToDateCents = successfulPayments.reduce(
    (sum, p) => sum + p.amountCents,
    0
  );
  const balanceCents = Math.max(0, quote.totalFeeCents - paidToDateCents);

  // If this is Option 2 (payment_plan) and a deposit landed, compute monthly instalment dates
  let instalment1DueDate = quote.instalment1DueDate;
  let instalment2DueDate = quote.instalment2DueDate;
  let instalment3DueDate = quote.instalment3DueDate;

  if (
    quote.paymentOption === "payment_plan" &&
    paidToDateCents > 0 &&
    !instalment1DueDate
  ) {
    const baseDate = depositLandedAtIso
      ? new Date(depositLandedAtIso)
      : new Date();
    const d1 = new Date(baseDate);
    d1.setMonth(d1.getMonth() + 1);
    instalment1DueDate = d1.toISOString().split("T")[0];

    if (quote.selectedInstalmentMonths >= 2) {
      const d2 = new Date(baseDate);
      d2.setMonth(d2.getMonth() + 2);
      instalment2DueDate = d2.toISOString().split("T")[0];
    }

    if (quote.selectedInstalmentMonths >= 3) {
      const d3 = new Date(baseDate);
      d3.setMonth(d3.getMonth() + 3);
      instalment3DueDate = d3.toISOString().split("T")[0];
    }
  }

  const nowIso = new Date().toISOString();
  const institutionalStatus =
    quote.paymentOption === "institutional_funding"
      ? balanceCents === 0
        ? "paid"
        : quote.poNumber
          ? "awaiting_institution"
          : "awaiting_po"
      : "not_applicable";

  const [updatedQuote] = await db
    .update(quotes)
    .set({
      paidToDateCents,
      balanceCents,
      outcome: paidToDateCents > 0 ? "accepted" : quote.outcome,
      acceptedAt:
        paidToDateCents > 0 && !quote.acceptedAt ? nowIso : quote.acceptedAt,
      instalment1DueDate,
      instalment2DueDate,
      instalment3DueDate,
      institutionalStatus,
      updatedAt: nowIso,
    })
    .where(eq(quotes.id, quoteId))
    .returning();

  // Check releaseWork gate on project:
  // Options 1 & 2: releaseWork is true ONLY when balanceCents === 0
  // Option 3 (institutional_funding): releaseWork is true when poNumber is present OR balanceCents === 0
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, quote.projectId))
    .limit(1);

  if (project) {
    const shouldRelease =
      balanceCents === 0 ||
      (quote.paymentOption === "institutional_funding" &&
        Boolean(quote.poNumber && quote.poNumber.trim().length > 0));

    const nextStage =
      project.stage === "enquiry" || project.stage === "quote_sent"
        ? paidToDateCents > 0 || shouldRelease
          ? "accepted"
          : project.stage
        : project.stage;

    await db
      .update(projects)
      .set({
        releaseWork: shouldRelease,
        stage: nextStage,
        updatedAt: nowIso,
      })
      .where(eq(projects.id, project.id));
  }

  return updatedQuote;
}

export interface VerifyPaystackResult {
  success: boolean;
  error?: string;
  /** Signals the caller (e.g. the webhook) that a retry may succeed. */
  retryable?: boolean;
  alreadySettled?: boolean;
  simulated?: boolean;
  quote?: {
    totalFeeCents: number;
    paidToDateCents: number;
    balanceCents: number;
  };
}

function toQuoteSummary(
  quote: typeof quotes.$inferSelect | null | undefined
): VerifyPaystackResult["quote"] {
  if (!quote) return undefined;
  return {
    totalFeeCents: quote.totalFeeCents,
    paidToDateCents: quote.paidToDateCents,
    balanceCents: quote.balanceCents,
  };
}

/**
 * Verifies a Paystack reference against Paystack's API (or simulated local mode)
 * and settles the payment in the database.
 *
 * The Paystack API is the source of truth: status, amount and currency are all
 * checked before a payment is marked successful.
 */
export async function verifyAndSettlePaystackReference(
  reference: string,
  simulated = false
): Promise<VerifyPaystackResult> {
  const [paymentRow] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, reference))
    .limit(1);

  if (!paymentRow) {
    return { success: false, error: "Payment reference not found." };
  }

  if (paymentRow.status === "success") {
    return { success: true, alreadySettled: true };
  }

  if (paymentRow.status === "refunded") {
    return { success: false, error: "This payment has already been refunded." };
  }

  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    if (simulated && isSimulationAllowed()) {
      const updatedQuote = await settlePaymentAndRecalculateQuote({
        paymentId: paymentRow.id,
        transactionId: `SIM_TX_${Date.now()}`,
        channel: "card (simulated)",
        feesCents: 0,
      });
      return {
        success: true,
        simulated: true,
        quote: toQuoteSummary(updatedQuote),
      };
    }

    return {
      success: false,
      error:
        "Paystack is not configured. Set PAYSTACK_SECRET_KEY to verify payments.",
    };
  }

  try {
    const res = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );
    const json = await res.json();

    if (!res.ok || !json.status || !json.data) {
      return {
        success: false,
        error: json.message || "Could not verify payment with Paystack.",
        retryable: res.status >= 500,
      };
    }

    const data = json.data as {
      status?: string;
      amount?: number;
      currency?: string;
      channel?: string;
      fees?: number;
      id?: number | string;
      paid_at?: string;
      gateway_response?: string;
    };

    if (data.status === "failed" || data.status === "abandoned") {
      await markPaymentFailed(reference, `Paystack status: ${data.status}`);
      return {
        success: false,
        error: data.gateway_response || `Payment ${data.status}.`,
      };
    }

    if (data.status !== "success") {
      return {
        success: false,
        error:
          data.gateway_response ||
          `Payment is ${data.status || "not complete"} yet.`,
      };
    }

    const paidCurrency = String(data.currency || "").toUpperCase();
    if (paidCurrency && paidCurrency !== paymentRow.currency.toUpperCase()) {
      await appendPaymentNote(
        paymentRow.id,
        `Currency mismatch: Paystack returned ${paidCurrency}, expected ${paymentRow.currency}.`
      );
      return {
        success: false,
        error: "Payment currency does not match this invoice.",
      };
    }

    const paidAmountCents = Number(data.amount);
    if (
      !Number.isFinite(paidAmountCents) ||
      paidAmountCents !== paymentRow.amountCents
    ) {
      await appendPaymentNote(
        paymentRow.id,
        `Amount mismatch: Paystack returned ${data.amount}, expected ${paymentRow.amountCents}. Needs manual reconciliation.`
      );
      return {
        success: false,
        error:
          "The amount received does not match this invoice. Please contact us so we can reconcile it.",
      };
    }

    const updatedQuote = await settlePaymentAndRecalculateQuote({
      paymentId: paymentRow.id,
      transactionId:
        data.id !== undefined ? String(data.id) : undefined,
      channel: data.channel || "card",
      feesCents: Number(data.fees || 0),
      paidAt: data.paid_at || new Date().toISOString(),
    });

    return {
      success: true,
      quote: toQuoteSummary(updatedQuote),
    };
  } catch (err) {
    console.error("Error verifying Paystack payment:", err);
    return {
      success: false,
      error: "Failed to verify payment with Paystack.",
      retryable: true,
    };
  }
}
