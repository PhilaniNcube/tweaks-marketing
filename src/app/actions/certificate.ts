"use server";

import { db } from "@/db";
import { certificates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  createTokenSchema,
  claimCertificateSchema,
  CreateTokenInput,
  ClaimCertificateInput,
} from "@/lib/validations/certificate";

export async function createCertificateToken(input: CreateTokenInput) {
  try {
    const validated = createTokenSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false as const,
        error: "Invalid input",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { recipientEmail, note } = validated.data;
    const newToken = crypto.randomUUID();
    const id = `CERT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [newCert] = await db
      .insert(certificates)
      .values({
        id,
        token: newToken,
        status: "pending",
        recipientEmail: recipientEmail || null,
        note: note || null,
      })
      .returning();

    return {
      success: true as const,
      certificate: newCert,
    };
  } catch (error) {
    console.error("Error creating certificate token:", error);
    return {
      success: false as const,
      error: "Failed to generate secure link. Please try again.",
    };
  }
}

export async function claimCertificate(input: ClaimCertificateInput) {
  try {
    const validated = claimCertificateSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false as const,
        error: "Please check your details and try again.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { token, researchTitle, researcherName, university, completionDate } =
      validated.data;

    // Check if token exists
    const [existing] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.token, token))
      .limit(1);

    if (!existing) {
      return {
        success: false as const,
        error: "Invalid certificate link or token.",
      };
    }

    const now = new Date().toISOString();

    const [updated] = await db
      .update(certificates)
      .set({
        status: "completed",
        researchTitle,
        researcherName,
        university,
        completionDate,
        completedAt: now,
      })
      .where(eq(certificates.token, token))
      .returning();

    return {
      success: true as const,
      certificateId: updated.id,
    };
  } catch (error) {
    console.error("Error claiming certificate:", error);
    return {
      success: false as const,
      error: "Failed to submit details. Please try again.",
    };
  }
}

export async function getCertificateByToken(token: string) {
  try {
    const [cert] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.token, token))
      .limit(1);

    return cert || null;
  } catch (error) {
    console.error("Error fetching certificate by token:", error);
    return null;
  }
}

export async function getCertificateById(id: string) {
  try {
    const [cert] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id))
      .limit(1);

    return cert || null;
  } catch (error) {
    console.error("Error fetching certificate by id:", error);
    return null;
  }
}

export async function getAllCertificates() {
  try {
    const certs = await db
      .select()
      .from(certificates)
      .orderBy(desc(certificates.createdAt));

    return certs;
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
}

export async function deleteCertificate(id: string) {
  try {
    await db.delete(certificates).where(eq(certificates.id, id));
    return { success: true as const };
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return { success: false as const, error: "Failed to delete certificate." };
  }
}
