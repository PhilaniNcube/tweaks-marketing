import * as v from "valibot";
import {
  areServicesInSingleGroup,
  resolveServiceGroup,
} from "@/lib/pricing/quote-calculator";
import type { Service } from "@/db/schema";

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

const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function isNonDegreeEligibleServiceSelection(
  selectedServices: string[],
  catalog?: Service[]
): boolean {
  if (!selectedServices || selectedServices.length === 0) return false;
  return selectedServices.every((sel) => {
    const group = resolveServiceGroup(sel, catalog);
    return group === "journal_article" || group === "proposal";
  });
}

function requiresUniversityContext(input: {
  services?: string[];
  isUniversityEnrolled?: boolean;
}): boolean {
  return (
    !isNonDegreeEligibleServiceSelection(input.services ?? []) ||
    input.isUniversityEnrolled !== false
  );
}

export const contactSchema = v.pipe(
  v.object({
    // --- Client & Academic Context ---
    firstName: v.pipe(
      v.string("First name is required"),
      v.trim(),
      v.minLength(1, "First name is required")
    ),
    surname: v.pipe(
      v.string("Surname is required"),
      v.trim(),
      v.minLength(1, "Surname is required")
    ),
    email: v.pipe(
      v.string("Valid email address is required"),
      v.trim(),
      v.minLength(1, "Valid email address is required"),
      v.email("Valid email address is required")
    ),
    whatsapp: v.pipe(
      v.string("WhatsApp number is required"),
      v.trim(),
      v.regex(
        /^\+\d{1,4}[\s\d-]{7,15}$/,
        "WhatsApp number must include country code in international format (e.g. +27 82 123 4567)"
      )
    ),
    isUniversityEnrolled: v.optional(v.boolean(), true),
    institutionId: v.optional(v.string(), ""),
    institutionOther: v.optional(v.string()),
    degreeLevel: v.optional(v.string(), ""),
    degreeLevelOther: v.optional(v.string()),
    degreeProgramme: v.optional(v.pipe(v.string(), v.trim()), ""),
    researchTitle: v.pipe(
      v.string("Title is required"),
      v.trim(),
      v.minLength(
        3,
        "Title is required (at least 3 characters)"
      )
    ),
    referralSource: v.pipe(
      v.string("Please tell us how you heard about us"),
      v.minLength(1, "Please tell us how you heard about us")
    ),

    // --- Step 2: Document & Scope ---
    documentType: v.optional(v.string()),
    documentTypeOther: v.optional(v.string()),
    wholeOrPart: v.picklist(
      ["whole", "part"],
      "Please indicate if you are sending the whole document or a part"
    ),
    whichPart: v.optional(v.string()),
    wordCount: v.optional(
      v.pipe(
        v.unknown(),
        v.transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const n = Number(val);
          return Number.isNaN(n) ? undefined : Math.trunc(n);
        }),
        v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)))
      )
    ),
    pageCount: v.pipe(
      v.unknown(),
      v.transform((val) => {
        if (val === "" || val === undefined || val === null) return NaN;
        return Number(val);
      }),
      v.number("Page count is required"),
      v.integer("Page count must be a whole number"),
      v.minValue(1, "Page count must be at least 1")
    ),
    referencePageCount: v.pipe(
      v.unknown(),
      v.transform((val) => {
        if (val === "" || val === undefined || val === null) return 0;
        return Number(val);
      }),
      v.number("Reference list page count is required"),
      v.integer("Reference list page count must be a whole number"),
      v.minValue(0, "Reference list page count must be between 0 and 500"),
      v.maxValue(500, "Reference list page count cannot exceed 500")
    ),

    // --- Step 3: Services & Delivery Speed ---
    services: v.pipe(
      v.array(v.string(), "Please select at least one editing service"),
      v.minLength(1, "Please select at least one editing service"),
      v.check(
        (selected) => areServicesInSingleGroup(selected),
        "Please select services from only one editing category"
      )
    ),
    deliverySpeed: v.picklist(
      ["standard", "express"],
      "Please choose Standard or Express delivery speed"
    ),
    mainGoal: v.pipe(
      v.string("Please describe the main goal of the edit"),
      v.trim(),
      v.minLength(
        20,
        "Please describe the main goal of the edit (at least 20 characters)"
      )
    ),
    concerns: v.optional(v.string()),

    // --- Step 4: Style, Referencing & Preferences ---
    referencingStyle: v.pipe(
      v.string("Please select a referencing style"),
      v.minLength(1, "Please select a referencing style")
    ),
    referencingStyleOther: v.optional(v.string()),
    trackedChanges: v.pipe(
      v.string("Please select tracked changes preference"),
      v.minLength(1, "Please select tracked changes preference")
    ),
    trackedChangesOther: v.optional(v.string()),
    certificate: v.pipe(
      v.string("Please specify if an editing certificate is required"),
      v.minLength(1, "Please specify if an editing certificate is required")
    ),

    // --- Step 5: Dates, Supervisor Sign-Off & Funding ---
    expectedSendDate: v.pipe(
      v.string("Please pick the date you will send us the document"),
      v.minLength(1, "Please pick the date you will send us the document")
    ),
    // Derived on the server from the send date + the selected services, so the
    // client never has to choose it.
    requestedReturnDate: v.optional(v.string()),
    supervisorSignOff: v.picklist(
      ["yes", "no", "not_applicable"],
      "Please indicate whether supervisor sign-off has been obtained"
    ),
    supervisorDisclaimerAck: v.optional(v.boolean()),
    requestSupervisorSignOff: v.optional(v.boolean()),
    supervisorName: v.optional(v.string()),
    supervisorEmail: v.optional(v.string()),
    paymentOption: v.picklist(
      ["full_payment", "payment_plan", "institutional_funding"],
      "Please select a payment / funding option"
    ),
    selectedInstalmentMonths: v.optional(
      v.pipe(
        v.unknown(),
        v.transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const n = Number(val);
          return Number.isNaN(n) ? undefined : Math.trunc(n);
        }),
        v.optional(v.pipe(v.number(), v.integer(), v.minValue(2), v.maxValue(3)))
      )
    ),
    department: v.optional(v.string()),
    billingContactName: v.optional(v.string()),
    billingContactEmail: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
    scopeDeclarationAccepted: v.literal(
      true,
      "Tweaks edits and improves your own writing (no ghostwriting, rewriting, or plagiarism checks). Please tick the scope declaration to confirm."
    ),

    // --- Anti-Spam ---
    hp_website: v.optional(v.string()),
    _formTime: v.optional(v.string()),
  }),
  // 1a. Institution required when university-enrolled
  v.forward(
    v.partialCheck(
      [["services"], ["isUniversityEnrolled"], ["institutionId"]],
      (input) =>
        !requiresUniversityContext(input) ||
        Boolean(input.institutionId && input.institutionId !== "None"),
      "Please select your institution"
    ),
    ["institutionId"]
  ),
  // 1b. Institution Other
  v.forward(
    v.partialCheck(
      [["institutionId"], ["institutionOther"]],
      (input) =>
        input.institutionId !== "Other" ||
        Boolean(input.institutionOther && input.institutionOther.trim().length >= 2),
      "Please enter the name of your institution or organisation"
    ),
    ["institutionOther"]
  ),
  // 2a. Degree Level required when university-enrolled
  v.forward(
    v.partialCheck(
      [["services"], ["isUniversityEnrolled"], ["degreeLevel"]],
      (input) =>
        !requiresUniversityContext(input) ||
        Boolean(input.degreeLevel && input.degreeLevel !== "N/A"),
      "Please select your degree level"
    ),
    ["degreeLevel"]
  ),
  // 2b. Degree Level Other
  v.forward(
    v.partialCheck(
      [["services"], ["isUniversityEnrolled"], ["degreeLevel"], ["degreeLevelOther"]],
      (input) =>
        !requiresUniversityContext(input) ||
        input.degreeLevel !== "Other" ||
        Boolean(input.degreeLevelOther && input.degreeLevelOther.trim().length >= 2),
      "Please specify your degree designator"
    ),
    ["degreeLevelOther"]
  ),
  // 2c. Degree Programme required when university-enrolled
  v.forward(
    v.partialCheck(
      [["services"], ["isUniversityEnrolled"], ["degreeProgramme"]],
      (input) =>
        !requiresUniversityContext(input) ||
        Boolean(
          input.degreeProgramme &&
            input.degreeProgramme.trim().length >= 2 &&
            input.degreeProgramme.trim().toUpperCase() !== "N/A"
        ),
      "Degree programme is required (e.g. Chemistry, Sociology)"
    ),
    ["degreeProgramme"]
  ),
  // 2d. Supervisor Sign-Off required (yes/no) when university-enrolled
  v.forward(
    v.partialCheck(
      [["services"], ["isUniversityEnrolled"], ["supervisorSignOff"]],
      (input) =>
        !requiresUniversityContext(input) ||
        input.supervisorSignOff === "yes" ||
        input.supervisorSignOff === "no",
      "Please indicate whether supervisor sign-off has been obtained"
    ),
    ["supervisorSignOff"]
  ),
  // 3. Whole or Part -> Which Part
  v.forward(
    v.partialCheck(
      [["wholeOrPart"], ["whichPart"]],
      (input) =>
        input.wholeOrPart !== "part" ||
        Boolean(input.whichPart && input.whichPart.trim().length >= 2),
      "Please specify which part of the document you are sending (e.g. Chapter 4 of 6)"
    ),
    ["whichPart"]
  ),
  // 5. Referencing Style Other
  v.forward(
    v.partialCheck(
      [["referencingStyle"], ["referencingStyleOther"]],
      (input) =>
        input.referencingStyle !== "Other" ||
        Boolean(
          input.referencingStyleOther &&
            input.referencingStyleOther.trim().length >= 2
        ),
      "Please specify your referencing style"
    ),
    ["referencingStyleOther"]
  ),
  // 6. Supervisor Sign-Off = "no" requires acknowledging the disclaimer
  v.forward(
    v.partialCheck(
      [["supervisorSignOff"], ["supervisorDisclaimerAck"]],
      (input) =>
        input.supervisorSignOff !== "no" || Boolean(input.supervisorDisclaimerAck),
      "Please acknowledge the supervisor sign-off disclaimer before submitting."
    ),
    ["supervisorDisclaimerAck"]
  ),
  // 8a. Requesting supervisor sign-off requires supervisor name
  v.forward(
    v.partialCheck(
      [["supervisorSignOff"], ["requestSupervisorSignOff"], ["supervisorName"]],
      (input) =>
        !(input.supervisorSignOff === "no" && input.requestSupervisorSignOff) ||
        Boolean(input.supervisorName && input.supervisorName.trim().length >= 2),
      "Supervisor name is required to send a sign-off request"
    ),
    ["supervisorName"]
  ),
  // 8b. Requesting supervisor sign-off requires institutional supervisor email
  v.forward(
    v.partialCheck(
      [["supervisorSignOff"], ["requestSupervisorSignOff"], ["supervisorEmail"]],
      (input) => {
        if (!(input.supervisorSignOff === "no" && input.requestSupervisorSignOff)) {
          return true;
        }
        if (!input.supervisorEmail || !input.supervisorEmail.includes("@")) {
          return false;
        }
        return isInstitutionalEmail(input.supervisorEmail);
      },
      "Supervisor email is required and must be at an institutional domain (not a personal Gmail, Yahoo, or Outlook address)"
    ),
    ["supervisorEmail"]
  ),
  // 9a. Institutional Funding requires department
  v.forward(
    v.partialCheck(
      [["paymentOption"], ["department"]],
      (input) =>
        input.paymentOption !== "institutional_funding" ||
        Boolean(input.department && input.department.trim().length >= 2),
      "Department is required when institution funded"
    ),
    ["department"]
  ),
  // 9b. Institutional Funding requires billing contact name
  v.forward(
    v.partialCheck(
      [["paymentOption"], ["billingContactName"]],
      (input) =>
        input.paymentOption !== "institutional_funding" ||
        Boolean(
          input.billingContactName && input.billingContactName.trim().length >= 2
        ),
      "Billing contact name is required when institution funded"
    ),
    ["billingContactName"]
  ),
  // 9c. Institutional Funding requires valid billing contact email
  v.forward(
    v.partialCheck(
      [["paymentOption"], ["billingContactEmail"]],
      (input) =>
        input.paymentOption !== "institutional_funding" ||
        Boolean(
          input.billingContactEmail &&
            SIMPLE_EMAIL_REGEX.test(input.billingContactEmail.trim())
        ),
      "A valid billing contact email is required when institution funded"
    ),
    ["billingContactEmail"]
  )
);

export type ContactFormData = v.InferOutput<typeof contactSchema>;

export const CONTACT_FORM_STEPS = [
  {
    id: 1,
    title: "Services & Speed",
    subtitle: "Category & turnaround",
    fields: [
      "services",
      "deliverySpeed",
      "mainGoal",
      "concerns",
    ] as (keyof ContactFormData)[],
  },
  {
    id: 2,
    title: "Document Scope",
    subtitle: "Scope & page count",
    fields: [
      "wholeOrPart",
      "whichPart",
      "pageCount",
      "referencePageCount",
    ] as (keyof ContactFormData)[],
  },
  {
    id: 3,
    title: "Your Details",
    subtitle: "Client & context",
    fields: [
      "firstName",
      "surname",
      "email",
      "whatsapp",
      "isUniversityEnrolled",
      "institutionId",
      "institutionOther",
      "degreeLevel",
      "degreeLevelOther",
      "degreeProgramme",
      "researchTitle",
      "referralSource",
    ] as (keyof ContactFormData)[],
  },
  {
    id: 4,
    title: "Style & Upload",
    subtitle: "Referencing & preferences",
    fields: [
      "referencingStyle",
      "referencingStyleOther",
      "trackedChanges",
      "trackedChangesOther",
      "certificate",
    ] as (keyof ContactFormData)[],
  },
  {
    id: 5,
    title: "Dates & Payment",
    subtitle: "Sign-off & quote summary",
    fields: [
      "expectedSendDate",
      "supervisorSignOff",
      "supervisorDisclaimerAck",
      "requestSupervisorSignOff",
      "supervisorName",
      "supervisorEmail",
      "paymentOption",
      "selectedInstalmentMonths",
      "department",
      "billingContactName",
      "billingContactEmail",
      "additionalInfo",
      "scopeDeclarationAccepted",
    ] as (keyof ContactFormData)[],
  },
] as const;
