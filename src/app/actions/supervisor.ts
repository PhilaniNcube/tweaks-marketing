"use server";

import { db } from "@/db";
import { projects, clients, institutions, crmSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_CRM_SETTINGS } from "@/db/seed-data";

export async function getSupervisorSignOffRequest(token: string) {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.supervisorSignOffToken, token))
      .limit(1);

    if (!project) return null;

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, project.clientId))
      .limit(1);

    let institutionName = project.institutionOther || "South African Institution";
    if (project.institutionId) {
      const [inst] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.id, project.institutionId))
        .limit(1);
      if (inst) institutionName = inst.name;
    }

    const [settingRow] = await db
      .select()
      .from(crmSettings)
      .where(eq(crmSettings.key, "supervisor_confirmation_text"))
      .limit(1);

    const defaultWording =
      DEFAULT_CRM_SETTINGS.find(
        (s) => s.key === "supervisor_confirmation_text"
      )?.value ||
      "I confirm that I am aware this student is submitting this work for professional language editing, and that I approve it going for editing at this stage.";

    // Intentionally return ONLY academic context — never fees, payment status, or notes
    return {
      studentName: client
        ? `${client.firstName} ${client.surname}`.trim()
        : "Postgraduate Student",
      institutionName,
      degreeLevel: project.degreeLevelOther || project.degreeLevel || "",
      degreeProgramme: project.degreeProgramme,
      researchTitle: project.researchTitle,
      supervisorName: project.supervisorName || "Supervisor",
      alreadyConfirmed:
        project.supervisorSignOff === "yes" &&
        Boolean(project.supervisorSignOffReceivedAt),
      confirmedAt: project.supervisorSignOffReceivedAt,
      confirmationWording: settingRow?.value || defaultWording,
    };
  } catch (error) {
    console.error("Error fetching supervisor sign-off request:", error);
    return null;
  }
}

export async function confirmSupervisorSignOff(token: string) {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.supervisorSignOffToken, token))
      .limit(1);

    if (!project) {
      return {
        success: false as const,
        error: "Invalid or expired sign-off link.",
      };
    }

    const nowIso = new Date().toISOString();

    await db
      .update(projects)
      .set({
        supervisorSignOff: "yes",
        supervisorSignOffReceivedAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(projects.id, project.id));

    return {
      success: true as const,
      confirmedAt: nowIso,
    };
  } catch (error) {
    console.error("Error confirming supervisor sign-off:", error);
    return {
      success: false as const,
      error: "Failed to record confirmation. Please try again.",
    };
  }
}

