import { z } from "zod";

export const createTokenSchema = z.object({
  recipientEmail: z
    .string()
    .email("Please enter a valid email address.")
    .or(z.literal(""))
    .optional(),
  note: z.string().max(500).optional(),
});

export const claimCertificateSchema = z.object({
  token: z.string().min(1, "Token is required."),
  researchTitle: z
    .string()
    .min(5, "Research Title must be at least 5 characters long.")
    .max(500, "Research Title cannot exceed 500 characters."),
  researcherName: z
    .string()
    .min(2, "Researcher Name must be at least 2 characters long.")
    .max(150, "Researcher Name cannot exceed 150 characters."),
  university: z
    .string()
    .min(2, "University / Institution must be at least 2 characters long.")
    .max(200, "University cannot exceed 200 characters."),
  completionDate: z
    .string()
    .min(2, "Date of Completion is required (e.g. July 2026).")
    .max(100, "Date cannot exceed 100 characters."),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type ClaimCertificateInput = z.infer<typeof claimCertificateSchema>;
