"use server";

import { Resend } from "resend";
import { contactSchema } from "@/lib/validations/contact";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { ContactConfirmationEmail } from "@/components/emails/contact-confirmation";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(
  prevState: { success: boolean; error?: string; errors?: Record<string, string[]> },
  data: unknown
) {
  try {
    const validatedFields = contactSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { data: parsedData } = validatedFields;

    // Send notification to tweaks.co.za
    const notificationHtml = await render(
      <ContactNotificationEmail data={parsedData} />,
      { pretty: false }
    );

    const notificationResult = await resend.emails.send({
      from: 'Tweaks Notifications <hello@tweaks.co.za>',
      to: ['hello@tweaks.co.za'],
      subject: `New Editing Brief from ${parsedData.name}`,
      html: notificationHtml,
    });

    if (notificationResult.error) {
        console.error("Resend Notification Error", notificationResult.error);
        return { success: false, error: "Failed to send notification email. Please try again." };
    }

    // Send confirmation to customer
    const confirmationHtml = await render(
      <ContactConfirmationEmail data={parsedData} />,
      { pretty: false }
    );

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
