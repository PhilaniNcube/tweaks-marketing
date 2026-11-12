"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { render } from "@react-email/components";
import * as v from "valibot";
import { contactSchema } from "@/lib/validations/contact";
import { parseBriefFormData } from "@/app/api/contact/route";
import { recordBriefAndGenerateQuote } from "@/lib/crm/submit-brief";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { ContactConfirmationEmail } from "@/components/emails/contact-confirmation";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  isR2Configured,
  uploadBufferToR2,
  sanitizeR2FileName,
} from "@/lib/r2";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAppUrl } from "@/lib/app-url";
import type { CalculatedQuoteResult } from "@/lib/pricing/quote-calculator";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface ContactActionState {
  success: boolean;
  error?: string;
  errors?: Record<string, string[] | undefined>;
  quoteNumber?: string;
  quoteToken?: string;
  projectToken?: string;
  quoteSummary?: CalculatedQuoteResult;
  isDuplicateFlag?: boolean;
}

export async function submitContactForm(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return {
        success: false,
        error:
          "Too many form submissions. Please wait a few minutes before trying again.",
      };
    }

    const rawData = parseBriefFormData(formData);

    // Honeypot check
    if (rawData.hp_website && rawData.hp_website.trim() !== "") {
      return { success: true };
    }

    // Time trap check (< 2 seconds)
    if (rawData._formTime) {
      const formTimeNum = Number(rawData._formTime);
      if (!isNaN(formTimeNum)) {
        const elapsedTime = Date.now() - formTimeNum;
        if (elapsedTime < 2000) {
          return { success: true };
        }
      }
    }

    const validatedFields = v.safeParse(contactSchema, rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: v.flatten<typeof contactSchema>(validatedFields.issues).nested,
      };
    }

    const parsedData = validatedFields.output;

    // Process file attachment if present
    const file = formData.get("file") as File | null;
    const attachments: { filename: string; content: Buffer }[] = [];
    let fileBuffer: Buffer | null = null;

    if (file && file.size > 0) {
      const maxBytes = isR2Configured() ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        return {
          success: false,
          error: `Attached file is too large (maximum ${
            isR2Configured() ? "50MB" : "10MB"
          }).`,
        };
      }
      fileBuffer = Buffer.from(await file.arrayBuffer());
      if (file.size <= 10 * 1024 * 1024) {
        attachments.push({ filename: file.name, content: fileBuffer });
      }
    }

    // Persist Client, Brief/Project, Quote & Line Items into CRM Database
    const crmResult = await recordBriefAndGenerateQuote(
      parsedData,
      file && file.size > 0 ? file.name : undefined
    );

    // Upload Client Manuscript to Cloudflare R2 if configured
    if (file && fileBuffer && isR2Configured()) {
      try {
        const safeName = sanitizeR2FileName(file.name);
        const key = `projects/${crmResult.projectId}/clientBrief/${Date.now()}-${safeName}`;
        await uploadBufferToR2({
          key,
          buffer: fileBuffer,
          contentType: file.type || "application/octet-stream",
        });
        const downloadUrl = `/api/r2/download?projectId=${encodeURIComponent(
          crmResult.projectId
        )}&slot=clientBrief&key=${encodeURIComponent(
          key
        )}&name=${encodeURIComponent(file.name)}`;

        await db
          .update(projects)
          .set({ uploadedFileUrl: downloadUrl })
          .where(eq(projects.id, crmResult.projectId));
      } catch (r2Err) {
        console.error("R2 brief upload warning (CRM record saved):", r2Err);
      }
    }

    // Emailed links must always use the canonical deployment URL. The request
    // `Origin` header can be a preview alias, the apex domain, or a spoofed
    // value, none of which should be baked into a client-facing email.
    const appUrl = getAppUrl();
    const quoteUrl = `${appUrl}/quote/${crmResult.quoteToken}`;
    const fullName = `${parsedData.firstName} ${parsedData.surname}`.trim();

    if (resend) {
      try {
        const notificationHtml = await render(
          ContactNotificationEmail({
            data: parsedData,
            institutionName: crmResult.institutionName,
            quoteNumber: crmResult.quoteNumber,
            quoteSummary: crmResult.quoteSummary,
            isDuplicateFlag: crmResult.isDuplicateFlag,
            quoteUrl,
          })
        );

        await resend.emails.send({
          from: "Tweaks Notifications <hello@tweaks.co.za>",
          to: ["hello@tweaks.co.za"],
          subject: `${crmResult.isDuplicateFlag ? "[DUPLICATE FLAG] " : ""}New Brief & Quote ${crmResult.quoteNumber} from ${fullName}`,
          html: notificationHtml,
          attachments,
        });

        const confirmationHtml = await render(
          ContactConfirmationEmail({
            data: parsedData,
            quoteNumber: crmResult.quoteNumber,
            quoteSummary: crmResult.quoteSummary,
            quoteUrl,
          })
        );

        await resend.emails.send({
          from: "Tweaks <hello@tweaks.co.za>",
          to: [parsedData.email],
          subject: `We have received your editing brief (${crmResult.quoteNumber})`,
          html: confirmationHtml,
        });

        if (
          crmResult.supervisorSignOffToken &&
          parsedData.supervisorEmail &&
          parsedData.supervisorName
        ) {
          const supervisorUrl = `${appUrl}/supervisor/sign-off/${crmResult.supervisorSignOffToken}`;
          await resend.emails.send({
            from: "Tweaks Academic Editing <hello@tweaks.co.za>",
            to: [parsedData.supervisorEmail],
            cc: [parsedData.email],
            subject: `Supervisor confirmation requested: ${fullName} (${parsedData.researchTitle})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1B0ABD; margin-top: 0;">Supervisor Confirmation Request</h2>
                <p>Dear ${parsedData.supervisorName},</p>
                <p><strong>${fullName}</strong> (${crmResult.institutionName}, ${parsedData.degreeLevel} — ${parsedData.degreeProgramme}) has submitted their manuscript titled:</p>
                <blockquote style="border-left: 3px solid #1B0ABD; padding-left: 12px; color: #334155; font-style: italic;">
                  ${parsedData.researchTitle}
                </blockquote>
                <p>They have requested your confirmation that you are aware this work is being submitted for professional language editing at this stage.</p>
                <p style="margin: 24px 0;">
                  <a href="${supervisorUrl}" style="background: #1B0ABD; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Review &amp; Confirm Sign-Off
                  </a>
                </p>
                <p style="font-size: 12px; color: #64748b;">
                  Note: Confirming only indicates awareness that the student is submitting their work for language editing at this stage; it is not an endorsement of the final edited text.
                </p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.error("Email send warning (CRM record saved):", emailErr);
      }
    }

    return {
      success: true,
      quoteNumber: crmResult.quoteNumber,
      quoteToken: crmResult.quoteToken,
      projectToken: crmResult.projectAccessToken,
      quoteSummary: crmResult.quoteSummary,
      isDuplicateFlag: crmResult.isDuplicateFlag,
    };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
