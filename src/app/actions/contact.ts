"use server";

import { Resend } from "resend";
import { contactSchema } from "@/lib/validations/contact";
import { ContactNotificationEmail } from "@/components/emails/contact-notification";
import { ContactConfirmationEmail } from "@/components/emails/contact-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(prevState: any, data: any) {
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
    const notificationResult = await resend.emails.send({
      from: 'Tweaks Notifications <hello@tweaks.co.za>',
      to: ['hello@tweaks.co.za'],
      subject: `New Editing Brief from ${parsedData.name}`,
      react: ContactNotificationEmail({ data: parsedData }) as React.ReactElement,
    });

    if (notificationResult.error) {
        console.error("Resend Notification Error", notificationResult.error);
        return { success: false, error: "Failed to send notification email. Please try again." };
    }

    // Send confirmation to customer
    const confirmationResult = await resend.emails.send({
      from: 'Tweaks <hello@tweaks.co.za>',
      to: [parsedData.email],
      subject: 'We have received your editing brief',
      react: ContactConfirmationEmail({ data: parsedData }) as React.ReactElement,
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
