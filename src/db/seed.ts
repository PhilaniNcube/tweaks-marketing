import { db } from "./index.ts";
import {
  services,
  rateCardRules,
  degreeLevels,
  crmSettings,
  institutions,
} from "./schema.ts";
import {
  DEFAULT_SERVICES,
  DEFAULT_RATE_CARD_RULES,
  DEFAULT_DEGREE_LEVELS,
  DEFAULT_CRM_SETTINGS,
  DEFAULT_INSTITUTIONS,
} from "./seed-data.ts";

/**
 * Idempotently seeds the initial CRM reference tables:
 * - Services & Rate Card (6 live services with standard/express rates & turnarounds)
 * - Conditional Payment Plan Rules (< R3,000 = max 2 months; >= R3,000 = max 3 months)
 * - 34 South African Degree Designators
 * - South African Higher Education Institutions
 * - Editable CRM Policy Settings & Constants
 */
export async function seedCrmDatabase() {
  // 1. Seed Services
  for (const service of DEFAULT_SERVICES) {
    await db
      .insert(services)
      .values(service)
      .onConflictDoUpdate({
        target: services.slug,
        set: {
          name: service.name,
          description: service.description,
          pricingBasis: service.pricingBasis,
          standardRateCents: service.standardRateCents,
          expressSurchargeCents: service.expressSurchargeCents,
          hasExpressOption: service.hasExpressOption,
          standardTurnaroundMinDays: service.standardTurnaroundMinDays,
          standardTurnaroundMaxDays: service.standardTurnaroundMaxDays,
          expressTurnaroundMinHours: service.expressTurnaroundMinHours,
          expressTurnaroundMaxHours: service.expressTurnaroundMaxHours,
          includesReferencingReport: service.includesReferencingReport,
          sortOrder: service.sortOrder,
          isActive: service.isActive,
        },
      });
  }

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

