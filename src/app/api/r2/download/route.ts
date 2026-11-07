import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { getR2PresignedDownloadUrl, isR2Configured } from "@/lib/r2";
import { db } from "@/db";
import { projects, quotes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured." },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId") || "";
    const key = searchParams.get("key") || "";
    const fileName = searchParams.get("name") || undefined;
    const clientToken = searchParams.get("token") || "";

    if (!projectId || !key || !key.startsWith(`projects/${projectId}/`) && !key.startsWith("briefs/")) {
      return NextResponse.json(
        { error: "Invalid file reference." },
        { status: 400 }
      );
    }

    // 1. Check if requester is an authenticated CRM Admin / Editor
    const session = await getServerSession();
    const isAdminOrEditor = Boolean(session?.user);

    // 2. If not a CRM user, verify Client Token + Work Release Gatekeeper
    if (!isAdminOrEditor) {
      if (!clientToken) {
        return NextResponse.json(
          { error: "Authentication or valid client token required." },
          { status: 401 }
        );
      }

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      const [quote] = await db
        .select()
        .from(quotes)
        .where(eq(quotes.projectId, project.id))
        .limit(1);

      const tokenMatches =
        project.accessToken === clientToken || quote?.token === clientToken;

      if (!tokenMatches) {
        return NextResponse.json({ error: "Invalid token." }, { status: 403 });
      }

      if (!project.workReady || !project.releaseWork) {
        return NextResponse.json(
          {
            error:
              "Work release gate is locked. Full payment or an approved Institutional PO is required before downloading deliverables.",
          },
          { status: 403 }
        );
      }

      if (
        project.accessExpiresAt &&
        new Date(project.accessExpiresAt).getTime() < Date.now()
      ) {
        return NextResponse.json(
          { error: "Download link has expired (30-day window elapsed)." },
          { status: 410 }
        );
      }
    }

    const presignedUrl = getR2PresignedDownloadUrl({
      key,
      expiresInSeconds: 3600,
      downloadFileName: fileName,
    });

    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("R2 download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link." },
      { status: 500 }
    );
  }
}

