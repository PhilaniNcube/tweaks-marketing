import React from "react";
import { Mail } from "lucide-react";
import { db } from "@/db";
import {
  services,
  institutions,
  degreeLevels,
  crmSettings,
  rateCardRules,
  type Service,
  type RateCardRule,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  DEFAULT_SERVICES,
  DEFAULT_INSTITUTIONS,
  DEFAULT_DEGREE_LEVELS,
  DEFAULT_CRM_SETTINGS,
  DEFAULT_RATE_CARD_RULES,
} from "@/db/seed-data";
import { seedCrmDatabase } from "@/db/seed";
import { ContactQuoteForm } from "./_components/contact-quote-form";
import type {
  ContactLookupsData,
  ContactInitialDefaults,
} from "./_components/types";

function getFallbackLookups(): ContactLookupsData {
  const settingsMap: Record<string, string> = {};
  for (const s of DEFAULT_CRM_SETTINGS) {
    settingsMap[s.key] = s.value;
  }

  return {
    services: DEFAULT_SERVICES.map((s, idx) => ({
      id: s.slug,
      slug: s.slug,
      name: s.name,
      description: s.description ?? null,
      serviceGroup: s.serviceGroup ?? "thesis",
      pricingBasis: s.pricingBasis,
      standardRateCents: s.standardRateCents,
      expressSurchargeCents: s.expressSurchargeCents ?? 0,
      hasExpressOption: s.hasExpressOption ?? true,
      standardTurnaroundMinDays: s.standardTurnaroundMinDays,
      standardTurnaroundMaxDays: s.standardTurnaroundMaxDays,
      expressTurnaroundMinHours: s.expressTurnaroundMinHours,
      expressTurnaroundMaxHours: s.expressTurnaroundMaxHours,
      includesReferencingReport: s.includesReferencingReport ?? false,
      quickbooksItemId: null,
      sortOrder: s.sortOrder ?? idx + 1,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    })),
    rules: DEFAULT_RATE_CARD_RULES.map((r, idx) => ({
      id: `rule-${idx}`,
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
      createdAt: "",
    })),
    institutions: DEFAULT_INSTITUTIONS.map((inst) => ({
      id: inst.name,
      name: inst.name,
      shortName: inst.shortName,
    })),
    degreeLevels: DEFAULT_DEGREE_LEVELS.map((d, idx) => ({
      id: `deg-${idx}`,
      designator: d.designator,
      category: d.category,
    })),
    settings: settingsMap,
  };
}

async function getContactLookups(): Promise<ContactLookupsData> {
  const fallback = getFallbackLookups();
  try {
    let activeServices = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder));

    if (activeServices.length === 0) {
      try {
        await seedCrmDatabase();
        activeServices = await db
          .select()
          .from(services)
          .where(eq(services.isActive, true))
          .orderBy(asc(services.sortOrder));
      } catch {
        // Ignore seed error and use fallback if needed
      }
    }

    const [
      approvedInstitutions,
      approvedDegreeLevels,
      settingsRows,
      activeRules,
    ] = await Promise.all([
      db
        .select()
        .from(institutions)
        .where(eq(institutions.status, "approved"))
        .orderBy(asc(institutions.name)),
      db
        .select()
        .from(degreeLevels)
        .where(eq(degreeLevels.status, "approved"))
        .orderBy(asc(degreeLevels.sortOrder)),
      db.select().from(crmSettings),
      db
        .select()
        .from(rateCardRules)
        .where(eq(rateCardRules.isActive, true))
        .orderBy(asc(rateCardRules.priority)),
    ]);

    const settingsMap: Record<string, string> = { ...fallback.settings };
    for (const row of settingsRows) {
      settingsMap[row.key] = row.value;
    }

    return {
      services:
        activeServices.length > 0
          ? (activeServices as Service[])
          : fallback.services,
      rules:
        activeRules.length > 0
          ? (activeRules as RateCardRule[])
          : fallback.rules,
      institutions:
        approvedInstitutions.length > 0
          ? approvedInstitutions.map((inst) => ({
              id: inst.id,
              name: inst.name,
              shortName: inst.shortName,
            }))
          : fallback.institutions,
      degreeLevels:
        approvedDegreeLevels.length > 0
          ? approvedDegreeLevels.map((deg) => ({
              id: deg.id,
              designator: deg.designator,
              category: deg.category,
            }))
          : fallback.degreeLevels,
      settings: settingsMap,
    };
  } catch (error) {
    console.warn("Using default lookup fallback on contact page:", error);
    return fallback;
  }
}

const SLUG_TO_SERVICE_NAME: Record<string, string> = {
  // Legacy slugs from existing marketing pages & links
  "academic-editing": "Thesis Editing: Academic Editing",
  "reference-checking": "Thesis Editing: Reference Checking",
  "reference-list-editing": "Thesis Editing: Reference List Editing",
  formatting: "Thesis Editing: Formatting",
  "journal-article-proposal-editing": "Journal Article Editing: All in One Service",
  // Grouped service slugs
  "thesis-academic-editing": "Thesis Editing: Academic Editing",
  "thesis-reference-checking": "Thesis Editing: Reference Checking",
  "thesis-reference-list-editing": "Thesis Editing: Reference List Editing",
  "thesis-formatting": "Thesis Editing: Formatting",
  "dissertation-academic-editing": "Dissertation Editing: Academic Editing",
  "dissertation-reference-checking": "Dissertation Editing: Reference Checking",
  "dissertation-reference-list-editing": "Dissertation Editing: Reference List Editing",
  "dissertation-formatting": "Dissertation Editing: Formatting",
  "journal-article-editing": "Journal Article Editing: All in One Service",
  "proposal-editing": "Proposal Editing: All in One Service",
};

function firstString(
  val: string | string[] | undefined
): string | undefined {
  if (typeof val === "string") return val;
  if (Array.isArray(val) && val.length > 0) return val[0];
  return undefined;
}

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Contact({ searchParams }: ContactPageProps) {
  const [lookups, resolvedParams] = await Promise.all([
    getContactLookups(),
    searchParams,
  ]);

  const serviceParam = firstString(resolvedParams.service);
  const defaultPagesRaw =
    firstString(resolvedParams.pageCount) ||
    firstString(resolvedParams.pages) ||
    firstString(resolvedParams.documents) ||
    firstString(resolvedParams.articles);
  const speedParam = firstString(resolvedParams.speed);

  const initialServices = serviceParam
    ? serviceParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => SLUG_TO_SERVICE_NAME[s] || s)
    : [];

  const parsedPages =
    defaultPagesRaw && !isNaN(Number(defaultPagesRaw))
      ? Math.max(1, Math.trunc(Number(defaultPagesRaw)))
      : undefined;

  const initialDefaults: ContactInitialDefaults = {
    services: initialServices,
    pageCount: parsedPages,
    deliverySpeed: speedParam === "express" ? "express" : "standard",
    todayIso: new Date().toISOString().split("T")[0],
    formTime: String(Date.now()),
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Intro Text */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 text-left">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Request a Quote
                </h1>
                <div className="space-y-4 text-base text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
                  <p>
                    Complete your project brief in five quick steps to receive
                    an instant estimate and official quotation tailored to your
                    document, turnaround time, and funding route.
                  </p>
                  <p>
                    Whether you are paying upfront, choosing a 50% deposit
                    payment plan, or submitting for institutional funding via a
                    university Purchase Order, your quote is generated
                    automatically from our live rate card.
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 bg-tweaks-red/10 text-tweaks-red rounded-none border border-tweaks-red/20">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Email Us
                      </h4>
                      <a
                        href="mailto:hello@tweaks.co.za"
                        className="text-sm font-light text-tweaks-blue hover:underline"
                      >
                        hello@tweaks.co.za
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-8">
              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-none shadow-sm p-6 sm:p-10 lg:p-12">
                <ContactQuoteForm
                  lookups={lookups}
                  initialDefaults={initialDefaults}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
