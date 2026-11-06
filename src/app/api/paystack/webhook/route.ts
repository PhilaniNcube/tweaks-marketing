import { NextRequest, NextResponse } from "next/server";
import {
  verifyPaystackWebhookSignature,
  verifyAndSettlePaystackReference,
} from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    if (event.event === "charge.success" && event.data?.reference) {
      await verifyAndSettlePaystackReference(event.data.reference, false);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

