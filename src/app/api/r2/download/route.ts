import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { getR2PresignedDownloadUrl, isR2Configured } from "@/lib/r2";
import { db } from "@/db";
import { clients, projects, quotes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "File storage is not configured." },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId") || "";
    const slot = searchParams.get("slot") || "";
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
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    const isAdminOrEditor = Boolean(
      session?.user && (userRole === "admin" || userRole === "editor")
    );

    // 2. If not a CRM staff member, verify Client Token or Client Session ownership
    if (!isAdminOrEditor) {
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

      const tokenMatches = Boolean(
        clientToken &&
          (project.accessToken === clientToken || quote?.token === clientToken)
      );

      let sessionOwnerMatches = false;
      const sessionEmail = (session?.user?.email || "").trim().toLowerCase();
      if (sessionEmail) {
        const [client] = await db
          .select()
          .from(clients)
          .where(eq(clients.id, project.clientId))
          .limit(1);
        sessionOwnerMatches = Boolean(
          client && client.email.trim().toLowerCase() === sessionEmail
        );
      }

      if (!tokenMatches && !sessionOwnerMatches) {
        return NextResponse.json(
          { error: "Authentication or valid client token required." },
          { status: 401 }
        );
      }

      const isClientSourceDoc =
        slot === "clientBrief" ||
        key.startsWith(`projects/${projectId}/clientBrief/`) ||
        key.startsWith("briefs/");

      if (!isClientSourceDoc) {
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

