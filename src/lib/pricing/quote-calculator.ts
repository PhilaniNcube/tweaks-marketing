import { db } from "@/db";
import {
  services as servicesTable,
  rateCardRules as rateCardRulesTable,
  type Service,
  type RateCardRule,
  type PaymentOption,
  type PricingBasis,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  DEFAULT_SERVICES,
  DEFAULT_RATE_CARD_RULES,
} from "@/db/seed-data";

export interface QuoteCalculationInput {
  /** Selected service names or slugs */
  selectedServices: string[];
  /** Billable document page count (auto-calculated at 300 words/page, editable) */
  pageCount: number;
  /** Reference list page count (0 to 500) */
  referencePageCount: number;
  /** Word count of the document */
  wordCount?: number;
  /** Delivery speed */
  deliverySpeed: "standard" | "express";
  /** Client's chosen payment option */
  paymentOption: PaymentOption;
  /** Optional selected instalment months (capped at maxInstalmentMonths) */
  requestedInstalmentMonths?: number;
  /** Optional degree level for conditional pricing rules */
  degreeLevel?: string;
}

export interface CalculatedQuoteLineItem {
  serviceId: string;
  slug: string;
  serviceName: string;
  pricingBasis: PricingBasis;
  quantity: number;
  unitStandardRateCents: number;
  unitExpressSurchargeCents: number;
  appliedAdjustmentCents: number;
  lineTotalCents: number;
  includesReferencingReport: boolean;
}

export interface TurnaroundSummary {
  minDays: number;
  maxDays: number;
  expressMinHours: number;
  expressMaxHours: number;
  /** Minimum calendar days to add to expectedSendDate for date validation */
  minimumReturnOffsetDays: number;
  displayLabel: string;
}

export interface CalculatedQuoteResult {
  items: CalculatedQuoteLineItem[];
  subtotalCents: number;
  expressSurchargeCents: number;
  discountCents: number;
  totalFeeCents: number;
  currency: "ZAR";
  paymentOption: PaymentOption;
  /** 2 if totalFeeCents < R3,000 (300000 cents); 3 if >= R3,000 */
  maxInstalmentMonths: number;
  selectedInstalmentMonths: number;
  depositPercentage: number;
  depositRequiredCents: number;
  remainingBalanceAfterDepositCents: number;
  instalmentAmountsCents: number[];
  turnaround: TurnaroundSummary;
}

/**
 * Normalizes a service identifier (slug or display name) for matching.
 */
function normalizeServiceKey(val: string): string {
  return val.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Fetches active services and rate card rules from Turso/SQLite,
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
 * Evaluates a single rate card rule condition against the current quote context.
 */
function matchesRuleCondition(
  rule: RateCardRule,
  context: {
    totalFeeCents: number;
    pageCount: number;
    referencePageCount: number;
    wordCount: number;
    degreeLevel: string;
    serviceCount: number;
    deliverySpeed: "standard" | "express";
  }
): boolean {
  const rawFieldVal = (() => {
    switch (rule.conditionField) {
      case "total_fee_cents":
        return context.totalFeeCents;
      case "page_count":
        return context.pageCount;
      case "reference_page_count":
        return context.referencePageCount;
      case "word_count":
        return context.wordCount;
      case "service_count":
        return context.serviceCount;
      case "degree_level":
        return context.degreeLevel;
      case "delivery_speed":
        return context.deliverySpeed;
    }
  })();

  const targetNum = Number(rule.conditionValue);
  const currentNum = Number(rawFieldVal);

  switch (rule.operator) {
    case "lt":
      return !isNaN(currentNum) && !isNaN(targetNum) && currentNum < targetNum;
    case "lte":
      return !isNaN(currentNum) && !isNaN(targetNum) && currentNum <= targetNum;
    case "gt":
      return !isNaN(currentNum) && !isNaN(targetNum) && currentNum > targetNum;
    case "gte":
      return !isNaN(currentNum) && !isNaN(targetNum) && currentNum >= targetNum;
    case "eq":
      return String(rawFieldVal).toLowerCase() === rule.conditionValue.toLowerCase();
    case "in": {
      try {
        const list = JSON.parse(rule.conditionValue) as string[];
        return list
          .map((item) => item.toLowerCase())
          .includes(String(rawFieldVal).toLowerCase());
      } catch {
        return false;
      }
    }
    case "between": {
      try {
        const [min, max] = JSON.parse(rule.conditionValue) as [number, number];
        return !isNaN(currentNum) && currentNum >= min && currentNum <= max;
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

/**
 * Pure calculation engine given catalog and rules (can be used both server-side and in tests/UI).
 */
export function calculateQuoteFromCatalog(
  input: QuoteCalculationInput,
  catalog: Service[],
  rules: RateCardRule[]
): CalculatedQuoteResult {
  const pages = Math.max(0, Math.ceil(input.pageCount || 0));
  const refPages = Math.max(0, Math.ceil(input.referencePageCount || 0));
  const words = input.wordCount ?? pages * 300;
  const isExpress = input.deliverySpeed === "express";

  const matchedServices = input.selectedServices
    .map((sel) => {
      const norm = normalizeServiceKey(sel);
      return catalog.find(
        (svc) =>
          normalizeServiceKey(svc.slug) === norm ||
          normalizeServiceKey(svc.name) === norm
      );
    })
    .filter((s): s is Service => Boolean(s));

  let subtotalCents = 0;
  let expressSurchargeCents = 0;

  const items: CalculatedQuoteLineItem[] = matchedServices.map((svc) => {
    const quantity = (() => {
      switch (svc.pricingBasis) {
        case "per_page":
          return Math.max(1, pages);
        case "per_reference_page":
          return Math.max(0, refPages);
        case "flat_document":
        case "flat_article":
        case "flat_abstract":
          return 1;
      }
    })();

    let unitStandard = svc.standardRateCents;
    const unitExpress =
      isExpress && svc.hasExpressOption ? svc.expressSurchargeCents : 0;
    let adjustmentCents = 0;

    // Check service-specific pricing rules
    const serviceRules = rules.filter(
      (r) => r.ruleCategory === "pricing" && r.serviceId === svc.id
    );
    for (const rule of serviceRules) {
      if (
        matchesRuleCondition(rule, {
          totalFeeCents: 0,
          pageCount: pages,
          referencePageCount: refPages,
          wordCount: words,
          degreeLevel: input.degreeLevel || "",
          serviceCount: matchedServices.length,
          deliverySpeed: input.deliverySpeed,
        })
      ) {
        if (rule.effectType === "override_unit_rate_cents") {
          unitStandard = Number(rule.effectValue);
        } else if (rule.effectType === "rate_multiplier") {
          const mult = Number(rule.effectValue);
          adjustmentCents += Math.round(unitStandard * quantity * (mult - 1));
        } else if (rule.effectType === "flat_adjustment_cents") {
          adjustmentCents += Number(rule.effectValue);
        }
      }
    }

    const baseLineCents = quantity * unitStandard;
    const expressLineCents = quantity * unitExpress;
    const lineTotalCents = Math.max(
      0,
      baseLineCents + expressLineCents + adjustmentCents
    );

    subtotalCents += baseLineCents + adjustmentCents;
    expressSurchargeCents += expressLineCents;

    return {
      serviceId: svc.id,
      slug: svc.slug,
      serviceName: svc.name,
      pricingBasis: svc.pricingBasis,
      quantity,
      unitStandardRateCents: unitStandard,
      unitExpressSurchargeCents: unitExpress,
      appliedAdjustmentCents: adjustmentCents,
      lineTotalCents,
      includesReferencingReport: svc.includesReferencingReport,
    };
  });

  const preDiscountTotalCents = subtotalCents + expressSurchargeCents;

  // Evaluate order-level discount rules
  let discountCents = 0;
  const discountRules = rules.filter((r) => r.ruleCategory === "discount");
  for (const rule of discountRules) {
    if (
      matchesRuleCondition(rule, {
        totalFeeCents: preDiscountTotalCents,
        pageCount: pages,
        referencePageCount: refPages,
        wordCount: words,
        degreeLevel: input.degreeLevel || "",
        serviceCount: matchedServices.length,
        deliverySpeed: input.deliverySpeed,
      })
    ) {
      if (rule.effectType === "percentage_discount") {
        const pct = Number(rule.effectValue);
        discountCents += Math.round(preDiscountTotalCents * (pct / 100));
      } else if (rule.effectType === "flat_adjustment_cents") {
        discountCents += Math.abs(Number(rule.effectValue));
      }
    }
  }

  const totalFeeCents = Math.max(0, preDiscountTotalCents - discountCents);

  // Evaluate conditional payment plan rules (< R3,000 -> max 2 months; >= R3,000 -> max 3 months)
  let maxInstalmentMonths = totalFeeCents < 300000 ? 2 : 3;
  const paymentPlanRules = rules.filter(
    (r) =>
      r.ruleCategory === "payment_plan" &&
      r.effectType === "max_instalment_months"
  );
  for (const rule of paymentPlanRules) {
    if (
      matchesRuleCondition(rule, {
        totalFeeCents,
        pageCount: pages,
        referencePageCount: refPages,
        wordCount: words,
        degreeLevel: input.degreeLevel || "",
        serviceCount: matchedServices.length,
        deliverySpeed: input.deliverySpeed,
      })
    ) {
      const parsedMonths = Number(rule.effectValue);
      if (!isNaN(parsedMonths) && parsedMonths >= 1) {
        maxInstalmentMonths = parsedMonths;
      }
    }
  }

  const selectedInstalmentMonths =
    input.paymentOption === "payment_plan"
      ? Math.min(
          maxInstalmentMonths,
          Math.max(1, input.requestedInstalmentMonths ?? maxInstalmentMonths)
        )
      : 0;

  // Deposit calculation:
  // Option 1 (full_payment): 100% upfront
  // Option 2 (payment_plan): 50% deposit upfront, balance split over selectedInstalmentMonths
  // Option 3 (institutional_funding): 0% deposit, 100% paid on invoice against PO
  const depositPercentage =
    input.paymentOption === "payment_plan"
      ? 50
      : input.paymentOption === "institutional_funding"
        ? 0
        : 100;

  const depositRequiredCents =
    input.paymentOption === "payment_plan"
      ? Math.round(totalFeeCents * 0.5)
      : input.paymentOption === "institutional_funding"
        ? 0
        : totalFeeCents;

  const remainingBalanceAfterDepositCents =
    input.paymentOption === "payment_plan"
      ? totalFeeCents - depositRequiredCents
      : input.paymentOption === "institutional_funding"
        ? totalFeeCents
        : 0;

  const instalmentAmountsCents: number[] = [];
  if (
    input.paymentOption === "payment_plan" &&
    selectedInstalmentMonths > 0 &&
    remainingBalanceAfterDepositCents > 0
  ) {
    const baseInstalment = Math.floor(
      remainingBalanceAfterDepositCents / selectedInstalmentMonths
    );
    const remainder =
      remainingBalanceAfterDepositCents -
      baseInstalment * selectedInstalmentMonths;
    for (let i = 0; i < selectedInstalmentMonths; i++) {
      instalmentAmountsCents.push(
        i === selectedInstalmentMonths - 1
          ? baseInstalment + remainder
          : baseInstalment
      );
    }
  }

  // Turnaround calculation (longest selected service governs earliest return date)
  const minDays =
    matchedServices.length > 0
      ? Math.max(...matchedServices.map((s) => s.standardTurnaroundMinDays))
      : 3;
  const maxDays =
    matchedServices.length > 0
      ? Math.max(...matchedServices.map((s) => s.standardTurnaroundMaxDays))
      : 5;
  const expressMinHours =
    matchedServices.length > 0
      ? Math.max(...matchedServices.map((s) => s.expressTurnaroundMinHours))
      : 24;
  const expressMaxHours =
    matchedServices.length > 0
      ? Math.max(...matchedServices.map((s) => s.expressTurnaroundMaxHours))
      : 48;

  const minimumReturnOffsetDays = isExpress
    ? Math.ceil(expressMinHours / 24)
    : minDays;

  const displayLabel = isExpress
    ? expressMinHours === expressMaxHours
      ? `${expressMinHours} hours (Express)`
      : `${expressMinHours} to ${expressMaxHours} hours (Express)`
    : `${minDays} to ${maxDays} days (Standard)`;

  return {
    items,
    subtotalCents,
    expressSurchargeCents,
    discountCents,
    totalFeeCents,
    currency: "ZAR",
    paymentOption: input.paymentOption,
    maxInstalmentMonths,
    selectedInstalmentMonths,
    depositPercentage,
    depositRequiredCents,
    remainingBalanceAfterDepositCents,
    instalmentAmountsCents,
    turnaround: {
      minDays,
      maxDays,
      expressMinHours,
      expressMaxHours,
      minimumReturnOffsetDays,
      displayLabel,
    },
  };
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

/**
 * Formats ZAR cents as "R25,625.00" or "R25,625"
 */
export function formatZarFromCents(cents: number, showCents = true): string {
  const rands = cents / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: showCents && cents % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(rands)
    .replace("ZAR", "R")
    .trim();
}

