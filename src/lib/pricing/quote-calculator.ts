import type {
  Service,
  ServiceGroup,
  RateCardRule,
  PaymentOption,
  PricingBasis,
} from "@/db/schema";

export const SERVICE_GROUPS: Array<{
  key: ServiceGroup;
  title: string;
  subtitle: string;
  documentTypeLabel: string;
}> = [
  {
    key: "thesis",
    title: "Thesis Editing",
    subtitle: "Select the services you need for your doctoral thesis.",
    documentTypeLabel: "Thesis",
  },
  {
    key: "dissertation",
    title: "Dissertation Editing",
    subtitle: "Select the services you need for your dissertation.",
    documentTypeLabel: "Dissertation",
  },
  {
    key: "journal_article",
    title: "Journal Article Editing",
    subtitle:
      "When submitting a journal article to a publication (e.g. scientific journal).",
    documentTypeLabel: "Journal Article",
  },
  {
    key: "proposal",
    title: "Proposal Editing",
    subtitle:
      "When submitting a proposal (e.g. for a dissertation or thesis).",
    documentTypeLabel: "Proposal",
  },
];

const LEGACY_SERVICE_SLUG_MAP: Record<string, string> = {
  "academic-editing": "thesis-academic-editing",
  "reference-checking": "thesis-reference-checking",
  "reference-list-editing": "thesis-reference-list-editing",
  formatting: "thesis-formatting",
  "journal-article-proposal-editing": "journal-article-editing",
  "journal-article-and-proposal-editing": "journal-article-editing",
};

/**
 * Extracts the sub-service label (e.g. "Academic Editing" from "Thesis Editing: Academic Editing").
 */
export function getServiceSubLabel(service: Pick<Service, "name">): string {
  const colonIdx = service.name.indexOf(":");
  if (colonIdx !== -1) {
    return service.name.slice(colonIdx + 1).trim();
  }
  return service.name;
}

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

function findServiceInCatalog(
  sel: string,
  catalog: Service[]
): Service | undefined {
  const norm = normalizeServiceKey(sel);
  const direct = catalog.find(
    (svc) =>
      normalizeServiceKey(svc.slug) === norm ||
      normalizeServiceKey(svc.name) === norm
  );
  if (direct) return direct;

  const mappedSlug = LEGACY_SERVICE_SLUG_MAP[norm];
  if (mappedSlug) {
    return catalog.find((svc) => normalizeServiceKey(svc.slug) === mappedSlug);
  }
  return undefined;
}

function resolveServiceGroup(
  sel: string,
  catalog?: Service[]
): ServiceGroup | undefined {
  const matched = catalog ? findServiceInCatalog(sel, catalog) : undefined;
  if (matched) return matched.serviceGroup;

  const norm = normalizeServiceKey(sel);
  const resolved = LEGACY_SERVICE_SLUG_MAP[norm] || norm;
  if (resolved.includes("dissertation")) return "dissertation";
  if (resolved.includes("journal")) return "journal_article";
  if (resolved.includes("proposal")) return "proposal";
  if (resolved.includes("thesis")) return "thesis";
  return undefined;
}

/**
 * Checks whether all selected services belong to a single top-level service group.
 */
export function areServicesInSingleGroup(
  selectedServices: string[],
  catalog?: Service[]
): boolean {
  const groups = new Set<ServiceGroup>();
  for (const sel of selectedServices) {
    const group = resolveServiceGroup(sel, catalog);
    if (group) {
      groups.add(group);
      if (groups.size > 1) return false;
    }
  }
  return true;
}

/**
 * Derives a human-readable document type label from selected services.
 */
export function deriveDocumentTypeFromServices(
  selectedServices: string[],
  catalog?: Service[]
): string {
  const groupKeys = new Set<ServiceGroup>();

  for (const sel of selectedServices) {
    const group = resolveServiceGroup(sel, catalog);
    if (group) {
      groupKeys.add(group);
    }
  }

  const labels = SERVICE_GROUPS.filter((g) => groupKeys.has(g.key)).map(
    (g) => g.documentTypeLabel
  );

  return labels.length > 0 ? labels.join(", ") : "Thesis";
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
      return (
        String(rawFieldVal).toLowerCase() === rule.conditionValue.toLowerCase()
      );
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
 * Pure calculation engine given catalog and rules (safe for both Client and Server components).
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

  const rawMatchedServices = Array.from(
    new Map(
      input.selectedServices
        .map((sel) => findServiceInCatalog(sel, catalog))
        .filter((s): s is Service => Boolean(s))
        .map((s) => [s.id, s])
    ).values()
  );

  const primaryGroup = rawMatchedServices[0]?.serviceGroup;
  const matchedServices = primaryGroup
    ? rawMatchedServices.filter((svc) => svc.serviceGroup === primaryGroup)
    : rawMatchedServices;

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

  // Turnaround calculation: services are worked through one after another,
  // so each selected service adds its own time (they do not run in parallel).
  const sumBy = (
    pick: (svc: Service) => number,
    fallback: number
  ): number =>
    matchedServices.length > 0
      ? matchedServices.reduce((total, svc) => total + pick(svc), 0)
      : fallback;

  const minDays = sumBy((s) => s.standardTurnaroundMinDays, 3);
  const maxDays = sumBy((s) => s.standardTurnaroundMaxDays, 5);
  const expressMinHours = sumBy((s) => s.expressTurnaroundMinHours, 24);
  const expressMaxHours = sumBy((s) => s.expressTurnaroundMaxHours, 48);

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
