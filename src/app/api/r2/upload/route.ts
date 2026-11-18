import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import {
  isR2Configured,
  uploadBufferToR2,
  sanitizeR2FileName,
} from "@/lib/r2";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export type R2ProjectUploadSlot =
  | "clientBrief"
  | "editedDoc"
  | "editingReport"
  | "referencingReport"
  | "walkthroughVideo";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role || "editor";
    const userEmail = (session.user.email || "").trim().toLowerCase();
    const isCrmStaff = userRole === "admin" || userRole === "editor";

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            "File storage is not configured yet. Please contact your system administrator.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = String(formData.get("projectId") || "").trim();
    const slot = String(formData.get("slot") || "editedDoc") as R2ProjectUploadSlot;

    if (!file || file.size === 0 || !projectId) {
      return NextResponse.json(
        { error: "File and projectId are required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 50MB maximum upload size." },
        { status: 400 }
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

    if (!isCrmStaff) {
      if (slot !== "clientBrief") {
        return NextResponse.json(
          { error: "Clients can only upload source manuscripts." },
          { status: 403 }
        );
      }

      const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, project.clientId))
        .limit(1);

      if (!client || client.email.trim().toLowerCase() !== userEmail) {
        return NextResponse.json(
          { error: "You can only upload documents to your own project." },
          { status: 403 }
        );
      }

      if (
        project.workReady ||
        project.stage === "complete" ||
        project.stage === "closed"
      ) {
        return NextResponse.json(
          {
            error:
              "Editing has already been completed for this project. Please contact us if you need further changes.",
          },
          { status: 400 }
        );
      }
    }

    const safeFileName = sanitizeR2FileName(file.name);
    const key = `projects/${projectId}/${slot}/${Date.now()}-${safeFileName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadBufferToR2({
      key,
      buffer,
      contentType: file.type || "application/octet-stream",
    });

    const downloadPath = `/api/r2/download?projectId=${encodeURIComponent(
      projectId
    )}&slot=${encodeURIComponent(slot)}&key=${encodeURIComponent(
      key
    )}&name=${encodeURIComponent(file.name)}`;

    const nowIso = new Date().toISOString();
    const updatePayload: Partial<typeof projects.$inferInsert> = {
      updatedAt: nowIso,
    };

    if (slot === "clientBrief") {
      updatePayload.uploadedFileName = file.name;
      updatePayload.uploadedFileUrl = downloadPath;
    } else if (slot === "editedDoc") {
      updatePayload.editedDocUrl = downloadPath;
    } else if (slot === "editingReport") {
      updatePayload.editingReportUrl = downloadPath;
    } else if (slot === "referencingReport") {
      updatePayload.referencingReportUrl = downloadPath;
    } else if (slot === "walkthroughVideo") {
      updatePayload.walkthroughVideoUrl = downloadPath;
    }

    await db
      .update(projects)
      .set(updatePayload)
      .where(eq(projects.id, projectId));

    return NextResponse.json({
      success: true,
      key,
      url: downloadPath,
      fileName: file.name,
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload file.",
      },
      { status: 500 }
    );
  }
}

