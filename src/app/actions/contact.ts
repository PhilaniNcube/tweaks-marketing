"use server";

import { contactSchema } from "@/lib/validations/contact";
import { parseBriefFormData } from "@/app/api/contact/route";
import { recordBriefAndGenerateQuote } from "@/lib/crm/submit-brief";

export async function submitContactForm(
  prevState: {
    success: boolean;
    error?: string;
    errors?: Record<string, string[]>;
  },
  formData: FormData
) {
  try {
    const rawData = parseBriefFormData(formData);
    const validatedFields = contactSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const file = formData.get("file") as File | null;
    if (file && file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "Attached file is too large (maximum 10MB).",
      };
    }

    const crmResult = await recordBriefAndGenerateQuote(
      validatedFields.data,
      file && file.size > 0 ? file.name : undefined
    );

    return {
      success: true,
      quoteNumber: crmResult.quoteNumber,
      quoteToken: crmResult.quoteToken,
      quoteSummary: crmResult.quoteSummary,
    };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
