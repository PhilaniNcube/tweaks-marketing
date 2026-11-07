import { NextRequest, NextResponse } from "next/server";
import { exchangeQuickbooksCodeForTokens } from "@/lib/quickbooks";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const baseUrl = request.nextUrl.origin;

  if (!code || !realmId) {
    return NextResponse.redirect(
      new URL("/settings?qb_error=Missing+QuickBooks+OAuth+parameters", baseUrl)
    );
  }

  try {
    await exchangeQuickbooksCodeForTokens(code, realmId);
    return NextResponse.redirect(
      new URL("/settings?qb=connected", baseUrl)
    );
  } catch (error) {
    console.error("QuickBooks OAuth callback failed:", error);
    return NextResponse.redirect(
      new URL("/settings?qb_error=QuickBooks+token+exchange+failed", baseUrl)
    );
  }
}

