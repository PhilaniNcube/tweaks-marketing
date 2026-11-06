import { NextRequest, NextResponse } from "next/server";
import { verifyAndSettlePaystackReference } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const { reference, simulated } = (await request.json()) as {
      reference?: string;
      simulated?: boolean;
    };

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Missing payment reference." },
        { status: 400 }
      );
    }

    const result = await verifyAndSettlePaystackReference(
      reference,
      Boolean(simulated)
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Paystack verify route error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed." },
      { status: 500 }
    );
  }
}

