import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import * as v from "valibot";
import { contactSchema } from "@/lib/validations/contact";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { ContactConfirmationEmail } from "@/components/emails/contact-confirmation";
import { recordBriefAndGenerateQuote } from "@/lib/crm/submit-brief";
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

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export function parseBriefFormData(formData: FormData) {
  const getString = (key: string) => {
    const val = formData.get(key);
    return typeof val === "string" ? val : "";
  };

  const getOptionalString = (key: string) => {
    const val = formData.get(key);
    return typeof val === "string" && val.trim() !== "" ? val : undefined;
  };

  const getBoolean = (key: string) => {
    const val = formData.get(key);
    return val === "true" || val === "on" || val === "1";
  };

  const getArray = (key: string) => {
    return formData.getAll(key).map((val) => String(val));
  };

  return {
    firstName: getString("firstName"),
    surname: getString("surname"),
    email: getString("email"),
    whatsapp: getString("whatsapp"),
    institutionId: getString("institutionId"),
    institutionOther: getOptionalString("institutionOther"),
    degreeLevel: getString("degreeLevel"),
    degreeLevelOther: getOptionalString("degreeLevelOther"),
    degreeProgramme: getString("degreeProgramme"),
    researchTitle: getString("researchTitle"),
    referralSource: getString("referralSource"),
    documentType: getString("documentType"),
    documentTypeOther: getOptionalString("documentTypeOther"),
    wholeOrPart: getString("wholeOrPart"),
    whichPart: getOptionalString("whichPart"),
    wordCount: getOptionalString("wordCount"),
    pageCount: getString("pageCount"),
    referencePageCount: getString("referencePageCount") || "0",
    services: getArray("services"),
    deliverySpeed: getString("deliverySpeed") || "standard",
    mainGoal: getString("mainGoal"),
    concerns: getOptionalString("concerns"),
    referencingStyle: getString("referencingStyle"),
    referencingStyleOther: getOptionalString("referencingStyleOther"),
    expectedSendDate: getString("expectedSendDate"),
    requestedReturnDate: getString("requestedReturnDate"),
    supervisorSignOff: getString("supervisorSignOff"),
    supervisorDisclaimerAck: getBoolean("supervisorDisclaimerAck"),
    requestSupervisorSignOff: getBoolean("requestSupervisorSignOff"),
    supervisorName: getOptionalString("supervisorName"),
    supervisorEmail: getOptionalString("supervisorEmail"),
    trackedChanges: getString("trackedChanges"),
    trackedChangesOther: getOptionalString("trackedChangesOther"),
    certificate: getString("certificate"),
    paymentOption: getString("paymentOption") || "full_payment",
    selectedInstalmentMonths: getOptionalString("selectedInstalmentMonths"),
    department: getOptionalString("department"),
    billingContactName: getOptionalString("billingContactName"),
    billingContactEmail: getOptionalString("billingContactEmail"),
    additionalInfo: getOptionalString("additionalInfo"),
    scopeDeclarationAccepted: getBoolean("scopeDeclarationAccepted"),
    hp_website: getOptionalString("hp_website"),
    _formTime: getOptionalString("_formTime"),
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting Check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many form submissions. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const rawData = parseBriefFormData(formData);

    // 2. Honeypot check
    if (rawData.hp_website && rawData.hp_website.trim() !== "") {
      console.warn("Spam detected via Honeypot trap:", {
        ip,
        email: rawData.email,
      });
      return NextResponse.json({ success: true });
    }

    // 3. Time trap check (< 2 seconds)
    if (rawData._formTime) {
      const formTimeNum = Number(rawData._formTime);
      if (!isNaN(formTimeNum)) {
        const elapsedTime = Date.now() - formTimeNum;
        if (elapsedTime < 2000) {
          console.warn("Spam detected via Time Trap (<2s):", {
            ip,
            elapsedTime,
            email: rawData.email,
          });
          return NextResponse.json({ success: true });
        }
      }
    }

    const validatedFields = v.safeParse(contactSchema, rawData);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          errors: v.flatten<typeof contactSchema>(validatedFields.issues).nested,
        },
        { status: 400 }
      );
    }

    const parsedData = validatedFields.output;

    // 4. Process file attachment if present
    const file = formData.get("file") as File | null;
    const attachments: { filename: string; content: Buffer }[] = [];
    let fileBuffer: Buffer | null = null;

    if (file && file.size > 0) {
      const maxBytes = isR2Configured() ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        return NextResponse.json(
          {
            success: false,
            error: `Attached file is too large (maximum ${
              isR2Configured() ? "50MB" : "10MB"
            }).`,
          },
          { status: 400 }
        );
      }
      fileBuffer = Buffer.from(await file.arrayBuffer());
      // Resend email attachments cap around 10MB
      if (file.size <= 10 * 1024 * 1024) {
        attachments.push({ filename: file.name, content: fileBuffer });
      }
    }

    // 5. Persist Client, Brief/Project, Quote & Line Items into CRM Database
    const crmResult = await recordBriefAndGenerateQuote(
      parsedData,
      file && file.size > 0 ? file.name : undefined
    );

    // 5B. Upload Client Manuscript to Cloudflare R2 if configured
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

    const origin = request.headers.get("origin") || getAppUrl();
    const quoteUrl = `${origin}/quote/${crmResult.quoteToken}`;
    const fullName = `${parsedData.firstName} ${parsedData.surname}`.trim();

    // 6. Send Email Notifications via Resend (non-blocking if API key not configured locally)
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

        // If student requested supervisor sign-off confirmation via tokenised link
        if (
          crmResult.supervisorSignOffToken &&
          parsedData.supervisorEmail &&
          parsedData.supervisorName
        ) {
          const supervisorUrl = `${origin}/supervisor/sign-off/${crmResult.supervisorSignOffToken}`;
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

    return NextResponse.json({
      success: true,
      quoteNumber: crmResult.quoteNumber,
      quoteToken: crmResult.quoteToken,
      projectToken: crmResult.projectAccessToken,
      quoteSummary: crmResult.quoteSummary,
      isDuplicateFlag: crmResult.isDuplicateFlag,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
