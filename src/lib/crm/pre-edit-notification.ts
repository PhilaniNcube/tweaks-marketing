import { Resend } from "resend";
import { render } from "@react-email/components";
import { db } from "@/db";
import { clients, projects, quotes, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAppUrl } from "@/lib/app-url";
import { parseClientSourceDocuments } from "@/lib/crm/client-documents";
import { PreEditSubmittedEmail } from "@/components/emails/pre-edit-submitted";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendPreEditSubmittedNotificationInput {
  projectId: string;
  editorName: string;
  editorEmail: string;
}

/**
 * Sends a transactional email notification to all CRM admins (and hello@tweaks.co.za)
 * when an assigned editor uploads pre-edited files and submits their pre-edit notes.
 */
export async function sendPreEditSubmittedNotificationEmail(
  input: SendPreEditSubmittedNotificationInput
) {
  if (!resend) {
    return { sent: false as const, reason: "resend_not_configured" as const };
  }

  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);

    if (!project) {
      return { sent: false as const, reason: "project_not_found" as const };
    }

    const [[client], [quote], adminUsers] = await Promise.all([
      db
        .select()
        .from(clients)
        .where(eq(clients.id, project.clientId))
        .limit(1),
      db
        .select()
        .from(quotes)
        .where(eq(quotes.projectId, project.id))
        .limit(1),
      db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.role, "admin")),
    ]);

    const clientFullName = client
      ? `${client.firstName} ${client.surname}`.trim()
      : "Client";
    const quoteNumber = quote?.quoteNumber || project.id.slice(0, 8);
    const preEditedDocs = parseClientSourceDocuments(
      project.preEditedFileName,
      project.preEditedFileUrl
    );
    const fileNames = preEditedDocs.map((d) => d.name);

    const appUrl = getAppUrl();
    const projectWorkspaceUrl = `${appUrl}/projects/${project.id}`;

    const recipientSet = new Set<string>(["hello@tweaks.co.za"]);
    for (const adm of adminUsers) {
      const clean = (adm.email || "").trim().toLowerCase();
      if (clean && clean.includes("@")) {
        recipientSet.add(clean);
      }
    }

    const recipients = Array.from(recipientSet);

    const emailHtml = await render(
      PreEditSubmittedEmail({
        editorName: input.editorName,
        editorEmail: input.editorEmail,
        clientFullName,
        researchTitle: project.researchTitle,
        quoteNumber,
        requestedReturnDate: project.requestedReturnDate,
        fileNames,
        editorNotes: project.editorNotes,
        projectWorkspaceUrl,
      })
    );

    await resend.emails.send({
      from: "Tweaks CRM Notifications <hello@tweaks.co.za>",
      to: recipients,
      subject: `${input.editorName} uploaded pre-edited files for ${clientFullName} (${quoteNumber})`,
      html: emailHtml,
    });

    return { sent: true as const };
  } catch (error) {
    console.warn(
      "Pre-edit submitted notification email warning (database update preserved):",
      error
    );
    return { sent: false as const, reason: "send_failed" as const };
  }
}
