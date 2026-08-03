import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const reviews = sqliteTable("reviews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  rating: integer("rating").notNull(),
  feedback: text("feedback").notNull(),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export const certificates = sqliteTable("certificates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `CERT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`),
  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  status: text("status", { enum: ["pending", "completed"] })
    .default("pending")
    .notNull(),
  researchTitle: text("research_title"),
  researcherName: text("researcher_name"),
  university: text("university"),
  completionDate: text("completion_date"),
  recipientEmail: text("recipient_email"),
  note: text("note"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  completedAt: text("completed_at"),
});

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

