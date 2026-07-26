import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { contactSchema } from "@/lib/validations/contact";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { ContactConfirmationEmail } from "@/components/emails/contact-confirmation";

import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting Check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 3, 10 * 60 * 1000); // 3 submissions per 10 mins
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many form submissions. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const getString = (key: string) => {
      const val = formData.get(key);
      return typeof val === "string" ? val : "";
    };

    const getOptionalString = (key: string) => {
      const val = formData.get(key);
      return typeof val === "string" && val.trim() !== "" ? val : undefined;
    };

    const getArray = (key: string) => {
      return formData.getAll(key).map((val) => String(val));
    };

    const rawData = {
      name: getString("name"),
      email: getString("email"),
      whatsapp: getString("whatsapp"),
      documentTypes: getArray("documentTypes"),
      documentTypeOther: getOptionalString("documentTypeOther"),
      studyLevel: getOptionalString("studyLevel"),
      studyLevelOther: getOptionalString("studyLevelOther"),
      pageCount: getString("pageCount"),
      referencePageCount: getString("referencePageCount"),
      services: getArray("services"),
      serviceOther: getOptionalString("serviceOther"),
      mainGoal: getOptionalString("mainGoal"),
      concerns: getOptionalString("concerns"),
      referencingStyle: getString("referencingStyle"),
      deadline: getString("deadline"),
      submissionDate: getString("submissionDate"),
      trackedChanges: getString("trackedChanges"),
      trackedChangesOther: getOptionalString("trackedChangesOther"),
      certificate: getString("certificate"),
      funding: getOptionalString("funding"),
      additionalInfo: getOptionalString("additionalInfo"),
      hp_website: getOptionalString("hp_website"),
      _formTime: getOptionalString("_formTime"),
    };

    // 2. Honeypot check: If the hidden field is filled, silently succeed without sending email
    if (rawData.hp_website && rawData.hp_website.trim() !== "") {
      console.warn("Spam detected via Honeypot trap:", { ip, email: rawData.email });
      return NextResponse.json({ success: true });
    }

    // 3. Time trap check: If submitted in under 3 seconds (3000ms), silently succeed
    if (rawData._formTime) {
      const formTimeNum = Number(rawData._formTime);
      if (!isNaN(formTimeNum)) {
        const elapsedTime = Date.now() - formTimeNum;
        if (elapsedTime < 3000) {
          console.warn("Spam detected via Time Trap (<3s):", { ip, elapsedTime, email: rawData.email });
          return NextResponse.json({ success: true });
        }
      }
    }

    const validatedFields = contactSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return NextResponse.json(
        { success: false, errors: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data: parsedData } = validatedFields;

    // Process file attachment if present
    const file = formData.get("file") as File | null;
    const attachments: { filename: string; content: Buffer }[] = [];

    if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Attached file is too large (maximum 10MB)." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name, content: buffer });
    }

    // Send notification to tweaks.co.za
    const notificationHtml = await render(ContactNotificationEmail({ data: parsedData }));

    const notificationResult = await resend.emails.send({
      from: "Tweaks Notifications <hello@tweaks.co.za>",
      to: ["hello@tweaks.co.za"],
      subject: `New Editing Brief from ${parsedData.name}`,
      html: notificationHtml,
      attachments,
    });

    if (notificationResult.error) {
      console.error("Resend Notification Error", notificationResult.error);
      return NextResponse.json(
        { success: false, error: "Failed to send notification email. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation to customer
    const confirmationHtml = await render(ContactConfirmationEmail({ data: parsedData }));

    const confirmationResult = await resend.emails.send({
      from: "Tweaks <hello@tweaks.co.za>",
      to: [parsedData.email],
      subject: "We have received your editing brief",
      html: confirmationHtml,
    });

    if (confirmationResult.error) {
      console.error("Resend Confirmation Error", confirmationResult.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
