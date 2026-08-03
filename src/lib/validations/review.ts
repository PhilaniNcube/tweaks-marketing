import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ invalid_type_error: "Please select a star rating." })
    .min(1, "Please select at least 1 star.")
    .max(5, "Rating cannot exceed 5 stars."),
  feedback: z
    .string()
    .min(10, "Feedback text must be at least 10 characters long.")
    .max(2000, "Feedback text cannot exceed 2000 characters."),
  authorName: z.string().max(100).optional(),
  authorEmail: z
    .string()
    .email("Please enter a valid email address.")
    .or(z.literal(""))
    .optional(),
  university: z.string().max(150).optional(),
  hp_website: z.string().optional(),
  _formTime: z.string().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
