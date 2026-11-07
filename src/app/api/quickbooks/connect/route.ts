import { NextResponse } from "next/server";
import { getQuickbooksConnectUrl } from "@/lib/quickbooks";
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = getQuickbooksConnectUrl();
  if (!url) {
    return NextResponse.redirect(
      new URL(
        "/settings?qb_error=Missing+QUICKBOOKS_CLIENT_ID+in+environment+variables",
        process.env.BETTER_AUTH_URL || "http://localhost:3000"
      )
    );
  }

  return NextResponse.redirect(url);
}

