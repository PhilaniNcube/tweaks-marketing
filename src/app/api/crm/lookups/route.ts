import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  services,
  institutions,
  degreeLevels,
  degreeProgrammes,
  crmSettings,
  rateCardRules,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import {
  DEFAULT_SERVICES,
  DEFAULT_INSTITUTIONS,
  DEFAULT_DEGREE_LEVELS,
  DEFAULT_CRM_SETTINGS,
  DEFAULT_RATE_CARD_RULES,
} from "@/db/seed-data";
import { seedCrmDatabase } from "@/db/seed";

export async function GET() {
  try {
    let activeServices = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.sortOrder));

    // Auto-seed if the database (e.g. a newly created Turso preview branch) has empty lookup tables
    if (activeServices.length === 0) {
      try {
        await seedCrmDatabase();
        activeServices = await db
          .select()
          .from(services)
          .where(eq(services.isActive, true))
          .orderBy(asc(services.sortOrder));
      } catch (seedErr) {
        console.warn("Auto-seed skipped, using fallback defaults:", seedErr);
      }
    }

    const [
      approvedInstitutions,
      approvedDegreeLevels,
      approvedProgrammes,
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
      db
        .select()
        .from(degreeProgrammes)
        .where(eq(degreeProgrammes.status, "approved"))
        .orderBy(desc(degreeProgrammes.usageCount), asc(degreeProgrammes.name)),
      db.select().from(crmSettings),
      db
        .select()
        .from(rateCardRules)
        .where(eq(rateCardRules.isActive, true))
        .orderBy(asc(rateCardRules.priority)),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const def of DEFAULT_CRM_SETTINGS) {
      settingsMap[def.key] = def.value;
    }
    for (const row of settingsRows) {
      settingsMap[row.key] = row.value;
    }

    return NextResponse.json({
      services:
        activeServices.length > 0
          ? activeServices
          : DEFAULT_SERVICES.map((s, i) => ({ ...s, id: s.slug, sortOrder: i + 1 })),
      institutions:
        approvedInstitutions.length > 0
          ? approvedInstitutions
          : DEFAULT_INSTITUTIONS.map((inst, i) => ({
              ...inst,
              id: `inst-${i}`,
            })),
      degreeLevels:
        approvedDegreeLevels.length > 0
          ? approvedDegreeLevels
          : DEFAULT_DEGREE_LEVELS.map((deg, i) => ({
              ...deg,
              id: `deg-${i}`,
            })),
      degreeProgrammes: approvedProgrammes,
      settings: settingsMap,
      rateCardRules:
        activeRules.length > 0 ? activeRules : DEFAULT_RATE_CARD_RULES,
    });
  } catch (error) {
    console.error("Failed to fetch CRM lookups:", error);
    const fallbackSettings: Record<string, string> = {};
    for (const def of DEFAULT_CRM_SETTINGS) {
      fallbackSettings[def.key] = def.value;
    }
    return NextResponse.json({
      services: DEFAULT_SERVICES.map((s, i) => ({
        ...s,
        id: s.slug,
        sortOrder: i + 1,
      })),
      institutions: DEFAULT_INSTITUTIONS.map((inst, i) => ({
        ...inst,
        id: `inst-${i}`,
      })),
      degreeLevels: DEFAULT_DEGREE_LEVELS.map((deg, i) => ({
        ...deg,
        id: `deg-${i}`,
      })),
      degreeProgrammes: [],
      settings: fallbackSettings,
      rateCardRules: DEFAULT_RATE_CARD_RULES,
    });
  }
}

