"use server";

import { Resend } from "resend";
import { render } from "@react-email/components";
import { contactSchema } from "@/lib/validations/contact";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { ContactConfirmationEmail } from "@/components/emails/contact-confirmation";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(
  prevState: { success: boolean; error?: string; errors?: Record<string, string[]> },
  formData: FormData
) {
  try {
    const getString = (key: string) => {
      const val = formData.get(key);
      return typeof val === "string" ? val : "";
    };

    const getOptionalString = (key: string) => {
      const val = formData.get(key);
      return typeof val === "string" && val.trim() !== "" ? val : undefined;
    };

    const getArray = (key: string) => {
      return formData.getAll(key).map(val => String(val));
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
    };

    const validatedFields = contactSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { data: parsedData } = validatedFields;

    // Process file attachment if present
    const file = formData.get("file") as File | null;
    const attachments = [];

    if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return {
          success: false,
          error: "Attached file is too large (maximum 10MB).",
        };
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    // Send notification to tweaks.co.za
    const notificationHtml = await render(ContactNotificationEmail({ data: parsedData }));
    const notificationResult = await resend.emails.send({
      from: 'Tweaks Notifications <hello@tweaks.co.za>',
      to: ['hello@tweaks.co.za'],
      subject: `New Editing Brief from ${parsedData.name}`,
      html: notificationHtml,
      attachments,
    });

    if (notificationResult.error) {
        console.error("Resend Notification Error", notificationResult.error);
        return { success: false, error: "Failed to send notification email. Please try again." };
    }

    // Send confirmation to customer
    const confirmationHtml = await render(ContactConfirmationEmail({ data: parsedData }));
    const confirmationResult = await resend.emails.send({
      from: 'Tweaks <hello@tweaks.co.za>',
      to: [parsedData.email],
      subject: 'We have received your editing brief',
      html: confirmationHtml,
    });

    if (confirmationResult.error) {
        console.error("Resend Confirmation Error", confirmationResult.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
