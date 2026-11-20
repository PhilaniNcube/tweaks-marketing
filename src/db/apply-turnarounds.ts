/**
 * One-off maintenance script: applies the agreed category turnaround times
 * (standard + express, both expressed in working days) to the database that
 * TURSO_DATABASE_URL points at.
 *
 * Usage (production):
 *   node --env-file=.env.production src/db/apply-turnarounds.ts
 *
 * Usage (preview/local):
 *   node --env-file=.env.preview src/db/apply-turnarounds.ts
 */
import { eq } from "drizzle-orm";
import { db, client } from "./index.ts";
import { services } from "./schema.ts";
import type { ServiceGroup } from "./schema.ts";

const HOURS_PER_DAY = 24;

const TURNAROUNDS: Array<{
  serviceGroup: ServiceGroup;
  label: string;
  standardDays: number;
  expressDays: number;
}> = [
  {
    serviceGroup: "thesis",
    label: "Thesis Editing",
    standardDays: 10,
    expressDays: 7,
  },
  {
    serviceGroup: "dissertation",
    label: "Dissertation Editing",
    standardDays: 14,
    expressDays: 10,
  },
  {
    serviceGroup: "journal_article",
    label: "Journal Article Editing",
    standardDays: 5,
    expressDays: 3,
  },
  {
    serviceGroup: "proposal",
    label: "Proposal Editing",
    standardDays: 5,
    expressDays: 3,
  },
];

async function main() {
  for (const rule of TURNAROUNDS) {
    const updated = await db
      .update(services)
      .set({
        standardTurnaroundMinDays: rule.standardDays,
        standardTurnaroundMaxDays: rule.standardDays,
        expressTurnaroundMinHours: rule.expressDays * HOURS_PER_DAY,
        expressTurnaroundMaxHours: rule.expressDays * HOURS_PER_DAY,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(services.serviceGroup, rule.serviceGroup))
      .returning({ slug: services.slug });

    console.log(
      `✓ ${rule.label}: ${updated.length} service(s) → standard ${rule.standardDays} working days, express ${rule.expressDays} working days`
    );
  }
}

main()
  .then(async () => {
    await client.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Failed to apply turnaround values:", err);
    try {
      await client.close();
    } catch {
      // ignore close errors on the failure path
    }
    process.exit(1);
  });
