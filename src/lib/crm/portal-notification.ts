import { Resend } from "resend";
import { render } from "@react-email/components";
import { db } from "@/db";
import { clients, projects, quotes, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAppUrl } from "@/lib/app-url";
import { PortalUploadInvitationEmail } from "@/components/emails/portal-upload-invitation";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendClientPortalUploadInvitationInput {
  quoteId: string;
  trigger: "payment_recorded" | "institutional_accepted";
  paymentAmountCents?: number;
  receiptNumber?: string;
}

/**
 * Sends a transactional email inviting the client to sign in or create a Client Portal
 * account using their quote email address and upload their manuscript for editing.
 */
export async function sendClientPortalUploadInvitationEmail(
  input: SendClientPortalUploadInvitationInput
) {
  if (!resend) {
    return { sent: false as const, reason: "resend_not_configured" as const };
  }

  try {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, input.quoteId))
      .limit(1);

    if (!quote) {
      return { sent: false as const, reason: "quote_not_found" as const };
    }

    const [[project], [client]] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(eq(projects.id, quote.projectId))
        .limit(1),
      db
        .select()
        .from(clients)
        .where(eq(clients.id, quote.clientId))
        .limit(1),
    ]);

    if (!project || !client) {
      return {
        sent: false as const,
        reason: "missing_project_or_client" as const,
      };
    }

    const normalizedEmail = client.email.trim().toLowerCase();
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    const appUrl = getAppUrl();
    const mode = existingUser ? "signin" : "signup";
    const portalLoginUrl = `${appUrl}/portal/login?mode=${mode}&email=${encodeURIComponent(
      client.email
    )}`;
    const quoteUrl = `${appUrl}/quote/${quote.token}`;
    const clientFullName = `${client.firstName} ${client.surname}`.trim();

    const emailHtml = await render(
      PortalUploadInvitationEmail({
        clientFirstName: client.firstName,
        clientFullName,
        clientEmail: client.email,
        researchTitle: project.researchTitle,
        quoteNumber: quote.quoteNumber,
        expectedSendDate: project.expectedSendDate,
        requestedReturnDate: project.requestedReturnDate,
        uploadedFileName: project.uploadedFileName,
        trigger: input.trigger,
        paymentAmountCents: input.paymentAmountCents,
        receiptNumber: input.receiptNumber,
        paidToDateCents: quote.paidToDateCents,
        balanceCents: quote.balanceCents,
        poNumber: quote.poNumber,
        hasPortalAccount: Boolean(existingUser),
        portalLoginUrl,
        quoteUrl,
      })
    );

    const subject =
      input.trigger === "payment_recorded"
        ? `Payment received for ${quote.quoteNumber} — Upload your document in the Client Portal`
        : `Quote ${quote.quoteNumber} accepted — Upload your document in the Client Portal`;

    await resend.emails.send({
      from: "Tweaks Academic Editing <hello@tweaks.co.za>",
      to: [client.email],
      subject,
      html: emailHtml,
    });

    return { sent: true as const };
  } catch (error) {
    console.warn(
      "Client portal upload invitation email warning (database update preserved):",
      error
    );
    return { sent: false as const, reason: "send_failed" as const };
  }
}
