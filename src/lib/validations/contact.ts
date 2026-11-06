import { z } from "zod";

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.za",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.za",
  "outlook.com",
  "live.com",
  "live.co.za",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "ymail.com",
  "webmail.co.za",
  "mweb.co.za",
  "telkomsa.net",
  "vodamail.co.za",
]);

export function isInstitutionalEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!domain || !domain.includes(".")) return false;
  return !PERSONAL_EMAIL_DOMAINS.has(domain);
}

export const REFERRAL_SOURCES = [
  "Google Search",
  "Supervisor Recommendation",
  "Colleague / Fellow Student Referral",
  "University Department / Faculty",
  "Previous Client",
  "Social Media (LinkedIn / Facebook / Instagram)",
  "WhatsApp",
  "Other",
] as const;

export const REFERENCING_STYLES = [
  "APA 7th",
  "Harvard",
  "Vancouver",
  "OSCOLA",
  "Chicago",
  "MLA",
  "IEEE",
  "Turabian",
  "Other",
] as const;

export const DOCUMENT_TYPES = [
  "Thesis/Dissertation",
  "Proposal",
  "Journal Article",
  "Abstract",
  "Assignment",
  "Other",
] as const;

export const SERVICE_TURNAROUND_RULES: Record<
  string,
  { minStandardDays: number; minExpressHours: number }
> = {
  "academic-editing": { minStandardDays: 3, minExpressHours: 24 },
  "Academic editing": { minStandardDays: 3, minExpressHours: 24 },
  "reference-checking": { minStandardDays: 3, minExpressHours: 24 },
  "Reference checking": { minStandardDays: 3, minExpressHours: 24 },
  "reference-list-editing": { minStandardDays: 2, minExpressHours: 24 },
  "Reference list editing": { minStandardDays: 2, minExpressHours: 24 },
  formatting: { minStandardDays: 5, minExpressHours: 48 },
  Formatting: { minStandardDays: 5, minExpressHours: 48 },
  "journal-article-proposal-editing": {
    minStandardDays: 7,
    minExpressHours: 48,
  },
  "Journal article and proposal editing": {
    minStandardDays: 7,
    minExpressHours: 48,
  },
  "abstract-editing": { minStandardDays: 3, minExpressHours: 24 },
  "Abstract editing": { minStandardDays: 3, minExpressHours: 24 },
};

export function getMinimumTurnaroundDays(
  services: string[],
  deliverySpeed: "standard" | "express"
): number {
  if (!services || services.length === 0) return deliverySpeed === "express" ? 1 : 3;
  let maxMinDays = 1;
  for (const svc of services) {
    const rule = SERVICE_TURNAROUND_RULES[svc];
    if (rule) {
      const days =
        deliverySpeed === "express"
          ? Math.ceil(rule.minExpressHours / 24)
          : rule.minStandardDays;
      if (days > maxMinDays) maxMinDays = days;
    }
  }
  return maxMinDays;
}

export const contactSchema = z
  .object({
    // --- Step 1: Client & Academic Context ---
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    surname: z.string().trim().min(1, { message: "Surname is required" }),
    email: z.string().trim().email({ message: "Valid email address is required" }),
    whatsapp: z
      .string()
      .trim()
      .regex(/^\+\d{1,4}[\s\d-]{7,15}$/, {
        message:
          "WhatsApp number must include country code in international format (e.g. +27 82 123 4567)",
      }),
    institutionId: z
      .string()
      .min(1, { message: "Please select your institution" }),
    institutionOther: z.string().optional(),
    degreeLevel: z
      .string()
      .min(1, { message: "Please select your degree level" }),
    degreeLevelOther: z.string().optional(),
    degreeProgramme: z
      .string()
      .trim()
      .min(2, { message: "Degree programme is required (e.g. Chemistry, Sociology)" }),
    researchTitle: z
      .string()
      .trim()
      .min(3, {
        message:
          "Research title is required as it should appear on your completion certificate",
      }),
    referralSource: z
      .string()
      .min(1, { message: "Please tell us how you heard about us" }),

    // --- Step 2: Document & Scope ---
    documentType: z
      .string()
      .min(1, { message: "Please select your document type" }),
    documentTypeOther: z.string().optional(),
    wholeOrPart: z.enum(["whole", "part"], {
      errorMap: () => ({
        message: "Please indicate if you are sending the whole document or a part",
      }),
    }),
    whichPart: z.string().optional(),
    wordCount: z.coerce
      .number({ invalid_type_error: "Word count is required" })
      .int()
      .min(1, { message: "Word count must be at least 1" }),
    pageCount: z.coerce
      .number({ invalid_type_error: "Page count is required" })
      .int()
      .min(1, { message: "Page count must be at least 1" }),
    referencePageCount: z.coerce
      .number({ invalid_type_error: "Reference list page count is required" })
      .int()
      .min(0, { message: "Reference list page count must be between 0 and 500" })
      .max(500, { message: "Reference list page count cannot exceed 500" }),

    // --- Step 3: Services & Delivery Speed ---
    services: z
      .array(z.string())
      .min(1, { message: "Please select at least one editing service" }),
    deliverySpeed: z.enum(["standard", "express"], {
      errorMap: () => ({
        message: "Please choose Standard or Express delivery speed",
      }),
    }),
    mainGoal: z
      .string()
      .trim()
      .min(20, {
        message:
          "Please describe the main goal of the edit (at least 20 characters)",
      }),
    concerns: z.string().optional(),

    // --- Step 4: Style & Referencing ---
    referencingStyle: z
      .string()
      .min(1, { message: "Please select a referencing style" }),
    referencingStyleOther: z.string().optional(),

    // --- Step 5: Dates, Supervisor Sign-Off & Funding ---
    expectedSendDate: z
      .string()
      .min(1, { message: "Please pick the date you will send us the document" }),
    requestedReturnDate: z
      .string()
      .min(1, { message: "Please pick the date you need the document back" }),
    supervisorSignOff: z.enum(["yes", "no"], {
      errorMap: () => ({
        message: "Please indicate whether supervisor sign-off has been obtained",
      }),
    }),
    supervisorDisclaimerAck: z.boolean().optional(),
    requestSupervisorSignOff: z.boolean().optional(),
    supervisorName: z.string().optional(),
    supervisorEmail: z.string().optional(),
    trackedChanges: z
      .string()
      .min(1, { message: "Please select tracked changes preference" }),
    trackedChangesOther: z.string().optional(),
    certificate: z
      .string()
      .min(1, { message: "Please specify if an editing certificate is required" }),
    paymentOption: z.enum(
      ["full_payment", "payment_plan", "institutional_funding"],
      {
        errorMap: () => ({ message: "Please select a payment / funding option" }),
      }
    ),
    selectedInstalmentMonths: z.coerce.number().int().min(2).max(3).optional(),
    department: z.string().optional(),
    billingContactName: z.string().optional(),
    billingContactEmail: z.string().optional(),
    additionalInfo: z.string().optional(),
    scopeDeclarationAccepted: z.literal(true, {
      errorMap: () => ({
        message:
          "Tweaks edits and improves your own writing (no ghostwriting, rewriting, or plagiarism checks). Please tick the scope declaration to confirm.",
      }),
    }),

    // --- Anti-Spam ---
    hp_website: z.string().optional(),
    _formTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Institution Other
    if (
      data.institutionId === "Other" &&
      (!data.institutionOther || data.institutionOther.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["institutionOther"],
        message: "Please enter the name of your institution",
      });
    }

    // 2. Degree Level Other
    if (
      data.degreeLevel === "Other" &&
      (!data.degreeLevelOther || data.degreeLevelOther.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["degreeLevelOther"],
        message: "Please specify your degree designator",
      });
    }

    // 3. Document Type Other
    if (
      data.documentType === "Other" &&
      (!data.documentTypeOther || data.documentTypeOther.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentTypeOther"],
        message: "Please specify your document type",
      });
    }

    // 4. Whole or Part -> Which Part
    if (
      data.wholeOrPart === "part" &&
      (!data.whichPart || data.whichPart.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whichPart"],
        message: "Please specify which part of the document you are sending (e.g. Chapter 4 of 6)",
      });
    }

    // 5. Referencing Style Other
    if (
      data.referencingStyle === "Other" &&
      (!data.referencingStyleOther ||
        data.referencingStyleOther.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["referencingStyleOther"],
        message: "Please specify your referencing style",
      });
    }

    // 6. Cross-field date validation: Return date must be after send date by at least minimum turnaround
    if (data.expectedSendDate && data.requestedReturnDate) {
      const sendDate = new Date(data.expectedSendDate);
      const returnDate = new Date(data.requestedReturnDate);
      if (!isNaN(sendDate.getTime()) && !isNaN(returnDate.getTime())) {
        const minDays = getMinimumTurnaroundDays(
          data.services,
          data.deliverySpeed
        );
        const minReturnDate = new Date(sendDate);
        minReturnDate.setDate(minReturnDate.getDate() + minDays);

        if (returnDate < minReturnDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["requestedReturnDate"],
            message: `Return date must be at least ${minDays} day${minDays > 1 ? "s" : ""} after the date you send us the document (${minReturnDate.toISOString().split("T")[0]} or later).`,
          });
        }
      }
    }

    // 7. Supervisor Sign-Off = "no" requires acknowledging the disclaimer
    if (data.supervisorSignOff === "no" && !data.supervisorDisclaimerAck) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supervisorDisclaimerAck"],
        message:
          "Please acknowledge the supervisor sign-off disclaimer before submitting.",
      });
    }

    // 8. Requesting supervisor sign-off requires supervisor name and institutional email
    if (data.supervisorSignOff === "no" && data.requestSupervisorSignOff) {
      if (!data.supervisorName || data.supervisorName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["supervisorName"],
          message: "Supervisor name is required to send a sign-off request",
        });
      }
      if (!data.supervisorEmail || !data.supervisorEmail.includes("@")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["supervisorEmail"],
          message: "Supervisor email is required to send a sign-off request",
        });
      } else if (!isInstitutionalEmail(data.supervisorEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["supervisorEmail"],
          message:
            "Supervisor email must be at an institutional domain (not a personal Gmail, Yahoo, or Outlook address)",
        });
      }
    }

    // 9. Institutional Funding requires department, billing contact name, and billing contact email
    if (data.paymentOption === "institutional_funding") {
      if (!data.department || data.department.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "Department is required when institution funded",
        });
      }
      if (
        !data.billingContactName ||
        data.billingContactName.trim().length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["billingContactName"],
          message: "Billing contact name is required when institution funded",
        });
      }
      if (
        !data.billingContactEmail ||
        !z.string().email().safeParse(data.billingContactEmail.trim()).success
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["billingContactEmail"],
          message:
            "A valid billing contact email is required when institution funded",
        });
      }
    }
  });

export type ContactFormData = z.infer<typeof contactSchema>;
