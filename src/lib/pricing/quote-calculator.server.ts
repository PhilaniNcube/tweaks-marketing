import { db } from "@/db";
import {
  services as servicesTable,
  rateCardRules as rateCardRulesTable,
  type Service,
  type RateCardRule,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  DEFAULT_SERVICES,
  DEFAULT_RATE_CARD_RULES,
} from "@/db/seed-data";
import {
  calculateQuoteFromCatalog,
  type QuoteCalculationInput,
  type CalculatedQuoteResult,
} from "./quote-calculator";

/**
 * Fetches active services and rate card rules from Turso/SQLite on the server,
 * falling back to seed defaults if not yet seeded.
 */
export async function getActiveCatalogAndRules(): Promise<{
  catalog: Service[];
  rules: RateCardRule[];
}> {
  let catalog = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.isActive, true))
    .orderBy(asc(servicesTable.sortOrder));

  if (catalog.length === 0) {
    catalog = DEFAULT_SERVICES.map((s, idx) => ({
      id: s.slug,
      slug: s.slug,
      name: s.name,
      description: s.description ?? null,
      pricingBasis: s.pricingBasis,
      standardRateCents: s.standardRateCents,
      expressSurchargeCents: s.expressSurchargeCents ?? 0,
      hasExpressOption: s.hasExpressOption ?? true,
      standardTurnaroundMinDays: s.standardTurnaroundMinDays,
      standardTurnaroundMaxDays: s.standardTurnaroundMaxDays,
      expressTurnaroundMinHours: s.expressTurnaroundMinHours,
      expressTurnaroundMaxHours: s.expressTurnaroundMaxHours,
      includesReferencingReport: s.includesReferencingReport ?? false,
      quickbooksItemId: s.quickbooksItemId ?? null,
      sortOrder: s.sortOrder ?? idx + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  let rules = await db
    .select()
    .from(rateCardRulesTable)
    .where(eq(rateCardRulesTable.isActive, true))
    .orderBy(asc(rateCardRulesTable.priority));

  if (rules.length === 0) {
    rules = DEFAULT_RATE_CARD_RULES.map((r, idx) => ({
      id: `default-rule-${idx}`,
      serviceId: r.serviceId ?? null,
      name: r.name,
      description: r.description ?? null,
      ruleCategory: r.ruleCategory,
      conditionField: r.conditionField,
      operator: r.operator,
      conditionValue: r.conditionValue,
      effectType: r.effectType,
      effectValue: r.effectValue,
      priority: r.priority ?? idx * 10,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
  }

  return { catalog, rules };
}

/**
 * Server helper to calculate a quote directly from the live database rate card.
 */
export async function calculateQuote(
  input: QuoteCalculationInput
): Promise<CalculatedQuoteResult> {
  const { catalog, rules } = await getActiveCatalogAndRules();
  return calculateQuoteFromCatalog(input, catalog, rules);
}

