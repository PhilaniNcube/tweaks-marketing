import { NextRequest, NextResponse } from "next/server";
import {
  verifyPaystackWebhookSignature,
  verifyAndSettlePaystackReference,
  markPaymentFailed,
  markPaymentRefunded,
} from "@/lib/paystack";

/**
 * Paystack webhook endpoint.
 *
 * Configure this URL in the Paystack dashboard:
 *   https://<your-domain>/api/paystack/webhook
 *
 * Paystack signs every request with HMAC-SHA512 using your secret key and puts
 * the hex digest in the `x-paystack-signature` header. The signature must be
 * checked against the *raw* request body, so we read `request.text()` before
 * parsing JSON.
 *
 * Docs: https://paystack.com/docs/payments/webhooks/
 */
interface PaystackWebhookPayload {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    transaction?: { reference?: string };
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Could not read webhook body" },
      { status: 400 }
    );
  }

  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    // 401 makes invalid/unsigned calls obvious in logs. Paystack itself will
    // never send a request without a valid signature.
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackWebhookPayload;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const reference =
    event.data?.reference || event.data?.transaction?.reference;

  try {
    switch (event.event) {
      case "charge.success": {
        if (!reference) break;

        const result = await verifyAndSettlePaystackReference(
          reference,
          false
        );

        if (!result.success) {
          console.warn("[paystack:webhook] charge.success not settled", {
            reference,
            error: result.error,
          });

          // Let Paystack retry transient failures (network / 5xx from Paystack).
          // Permanent failures (amount mismatch, unknown reference) are logged
          // and acknowledged so we do not retry forever.
          if (result.retryable) {
            return NextResponse.json(
              { error: "Temporary verification failure" },
              { status: 500 }
            );
          }
        }
        break;
      }

      case "charge.failed": {
        if (!reference) break;
        await markPaymentFailed(
          reference,
          "Paystack reported charge.failed."
        );
        break;
      }

      case "refund.processed": {
        if (!reference) break;
        await markPaymentRefunded(reference);
        break;
      }

      // Other events (transfer.success, subscription.create, etc.) are
      // acknowledged so Paystack does not retry them.
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paystack:webhook] processing failed", {
      event: event.event,
      reference,
      error,
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
