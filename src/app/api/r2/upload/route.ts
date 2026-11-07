import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import {
  isR2Configured,
  uploadBufferToR2,
  sanitizeR2FileName,
} from "@/lib/r2";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          error:
            "Cloudflare R2 is not configured yet. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME to your environment variables.",
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
          error instanceof Error ? error.message : "Failed to upload file to R2.",
      },
      { status: 500 }
    );
  }
}

