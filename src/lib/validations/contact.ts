import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  whatsapp: z.string().min(1, { message: "WhatsApp number is required" }),
  documentTypes: z.array(z.string()).min(1, { message: "Select at least one document type" }),
  documentTypeOther: z.string().optional(),
  studyLevel: z.string().optional(),
  studyLevelOther: z.string().optional(),
  pageCount: z.string().min(1, { message: "Page count is required" }),
  referencePageCount: z.string().min(1, { message: "Reference page count is required" }),
  services: z.array(z.string()).min(1, { message: "Select at least one service" }),
  serviceOther: z.string().optional(),
  mainGoal: z.string().optional(),
  concerns: z.string().optional(),
  referencingStyle: z.string().min(1, { message: "Referencing style is required" }),
  deadline: z.string().min(1, { message: "Deadline is required" }),
  submissionDate: z.string().min(1, { message: "Submission date is required" }),
  trackedChanges: z.string().min(1, { message: "Please select tracked changes preference" }),
  trackedChangesOther: z.string().optional(),
  certificate: z.string().min(1, { message: "Please specify if an editing certificate is required" }),
  funding: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
