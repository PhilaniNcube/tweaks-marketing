import { db } from "./index.ts";
import {
  services,
  rateCardRules,
  degreeLevels,
  crmSettings,
  institutions,
} from "./schema.ts";
import { eq, notInArray } from "drizzle-orm";
import {
  DEFAULT_SERVICES,
  DEFAULT_RATE_CARD_RULES,
  DEFAULT_DEGREE_LEVELS,
  DEFAULT_CRM_SETTINGS,
  DEFAULT_INSTITUTIONS,
} from "./seed-data.ts";

const LEGACY_SOURCE_SLUG_BY_NEW_SLUG: Record<string, string> = {
  "thesis-academic-editing": "academic-editing",
  "thesis-reference-checking": "reference-checking",
  "thesis-reference-list-editing": "reference-list-editing",
  "thesis-formatting": "formatting",
  "dissertation-academic-editing": "academic-editing",
  "dissertation-reference-checking": "reference-checking",
  "dissertation-reference-list-editing": "reference-list-editing",
  "dissertation-formatting": "formatting",
  "journal-article-editing": "journal-article-proposal-editing",
  "proposal-editing": "journal-article-proposal-editing",
};

/**
 * Idempotently seeds the initial CRM reference tables:
 * - Services & Rate Card (10 grouped live services with standard/express rates & turnarounds)
 * - Conditional Payment Plan Rules (< R3,000 = max 2 months; >= R3,000 = max 3 months)
 * - 34 South African Degree Designators
 * - South African Higher Education Institutions
 * - Editable CRM Policy Settings & Constants
 */
export async function seedCrmDatabase() {
  // 1. Seed Services (preserving any existing admin-edited rates/turnarounds/QB IDs)
  const existingServices = await db.select().from(services);
  const existingBySlug = new Map(
    existingServices.map((row) => [row.slug, row])
  );

  for (const service of DEFAULT_SERVICES) {
    const existing = existingBySlug.get(service.slug);
    const structuralFields = {
      name: service.name,
      description: service.description,
      serviceGroup: service.serviceGroup,
      pricingBasis: service.pricingBasis,
      includesReferencingReport: service.includesReferencingReport,
      sortOrder: service.sortOrder,
    };

    if (existing) {
      await db
        .update(services)
        .set(structuralFields)
        .where(eq(services.slug, service.slug));
      continue;
    }

    const legacySlug = LEGACY_SOURCE_SLUG_BY_NEW_SLUG[service.slug];
    const legacyRow = legacySlug ? existingBySlug.get(legacySlug) : undefined;

    await db
      .insert(services)
      .values({
        ...service,
        standardRateCents:
          legacyRow?.standardRateCents ?? service.standardRateCents,
        expressSurchargeCents:
          legacyRow?.expressSurchargeCents ?? service.expressSurchargeCents,
        hasExpressOption:
          legacyRow?.hasExpressOption ?? service.hasExpressOption,
        standardTurnaroundMinDays:
          legacyRow?.standardTurnaroundMinDays ??
          service.standardTurnaroundMinDays,
        standardTurnaroundMaxDays:
          legacyRow?.standardTurnaroundMaxDays ??
          service.standardTurnaroundMaxDays,
        expressTurnaroundMinHours:
          legacyRow?.expressTurnaroundMinHours ??
          service.expressTurnaroundMinHours,
        expressTurnaroundMaxHours:
          legacyRow?.expressTurnaroundMaxHours ??
          service.expressTurnaroundMaxHours,
        quickbooksItemId:
          legacyRow?.quickbooksItemId ?? service.quickbooksItemId,
      })
      .onConflictDoUpdate({
        target: services.slug,
        set: structuralFields,
      });
  }

  // Retire services that are no longer offered on the website
  await db
    .update(services)
    .set({ isActive: false })
    .where(
      notInArray(
        services.slug,
        DEFAULT_SERVICES.map((service) => service.slug)
      )
    );

  // 2. Seed Conditional Rate Card Rules (only if none exist yet)
  const existingRules = await db.select().from(rateCardRules).limit(1);
  if (existingRules.length === 0) {
    await db.insert(rateCardRules).values(DEFAULT_RATE_CARD_RULES);
  }

  // 3. Seed Degree Levels
  for (const degree of DEFAULT_DEGREE_LEVELS) {
    await db
      .insert(degreeLevels)
      .values(degree)
      .onConflictDoNothing({ target: degreeLevels.designator });
  }

  // 4. Seed Institutions
  for (const inst of DEFAULT_INSTITUTIONS) {
    await db
      .insert(institutions)
      .values(inst)
      .onConflictDoNothing({ target: institutions.name });
  }

  // 5. Seed CRM Settings & Policy Wording
  for (const setting of DEFAULT_CRM_SETTINGS) {
    await db
      .insert(crmSettings)
      .values(setting)
      .onConflictDoNothing({ target: crmSettings.key });
  }

  console.log("✓ CRM database seeded successfully.");
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedCrmDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed database:", err);
      process.exit(1);
    });
}

