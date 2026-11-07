import { db } from "@/db";
import {
  clients,
  projects,
  quotes,
  quoteItems,
  institutions,
  degreeLevels,
  degreeProgrammes,
  crmSettings,
} from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { ContactFormData } from "@/lib/validations/contact";
import { calculateQuote } from "@/lib/pricing/quote-calculator.server";
import type { CalculatedQuoteResult } from "@/lib/pricing/quote-calculator";

export interface BriefSubmissionDatabaseResult {
  clientId: string;
  projectId: string;
  projectAccessToken: string;
  quoteId: string;
  quoteNumber: string;
  quoteToken: string;
  quoteSummary: CalculatedQuoteResult;
  institutionName: string;
  isDuplicateFlag: boolean;
  duplicateOfProjectId: string | null;
  supervisorSignOffToken: string | null;
}

/**
 * Generates a unique, human-readable quote number (e.g., QT-2026-4F9A2C)
 * that is short enough for bank EFT reference fields while remaining unguessable.
 */
function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `QT-${year}-${suffix}`;
}

/**
 * Persists a validated 33-field brief into the CRM database:
 * 1. Upserts Client
 * 2. Checks 24-hour duplicate rule (flags instead of blocking)
 * 3. Queues "Other" Institution / Degree Level for review
 * 4. Updates Degree Programme autocomplete usage count
 * 5. Calculates Quote & Conditional Payment Plan (2 vs 3 months) from DB rate card
 * 6. Creates Project, Quote, and Quote Line Items
 */
export async function recordBriefAndGenerateQuote(
  data: ContactFormData,
  uploadedFileName?: string
): Promise<BriefSubmissionDatabaseResult> {
  const nowIso = new Date().toISOString();
  const normalizedEmail = data.email.trim().toLowerCase();

  // 1. Resolve Institution & Queue "Other" if needed
  let resolvedInstitutionId: string | null = null;
  let resolvedInstitutionName = data.institutionOther?.trim() || "Other";

  if (data.institutionId && data.institutionId !== "Other") {
    const [instRow] = await db
      .select()
      .from(institutions)
      .where(eq(institutions.id, data.institutionId))
      .limit(1);

    if (instRow) {
      resolvedInstitutionId = instRow.id;
      resolvedInstitutionName = instRow.name;
    } else {
      // Maybe matched by name
      const [byName] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.name, data.institutionId))
        .limit(1);
      if (byName) {
        resolvedInstitutionId = byName.id;
        resolvedInstitutionName = byName.name;
      } else {
        resolvedInstitutionName = data.institutionId;
      }
    }
  } else if (
    data.institutionId === "Other" &&
    data.institutionOther &&
    data.institutionOther.trim().length > 1
  ) {
    const customInstName = data.institutionOther.trim();
    resolvedInstitutionName = customInstName;
    await db
      .insert(institutions)
      .values({
        name: customInstName,
        institutionType: "other",
        status: "pending_review",
      })
      .onConflictDoNothing({ target: institutions.name });
  }

  // 2. Queue "Other" Degree Level if needed
  if (
    data.degreeLevel === "Other" &&
    data.degreeLevelOther &&
    data.degreeLevelOther.trim().length > 1
  ) {
    await db
      .insert(degreeLevels)
      .values({
        designator: data.degreeLevelOther.trim(),
        category: "other",
        status: "pending_review",
      })
      .onConflictDoNothing({ target: degreeLevels.designator });
  }

  // 3. Upsert / Increment Degree Programme for Autocomplete
  const cleanProgramme = data.degreeProgramme.trim();
  const effectiveDegreeLevel =
    data.degreeLevel === "Other"
      ? data.degreeLevelOther?.trim() || "Other"
      : data.degreeLevel;

  const existingProgs = await db
    .select()
    .from(degreeProgrammes)
    .where(eq(degreeProgrammes.name, cleanProgramme))
    .limit(1);

  if (existingProgs.length > 0) {
    await db
      .update(degreeProgrammes)
      .set({ usageCount: existingProgs[0].usageCount + 1 })
      .where(eq(degreeProgrammes.id, existingProgs[0].id));
  } else {
    await db.insert(degreeProgrammes).values({
      institutionId: resolvedInstitutionId,
      degreeLevel: effectiveDegreeLevel,
      name: cleanProgramme,
      usageCount: 1,
      status: "approved",
    });
  }

  // 4. Upsert Client by Email
  const [existingClient] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, normalizedEmail))
    .limit(1);

  let clientId: string;
  if (existingClient) {
    clientId = existingClient.id;
    await db
      .update(clients)
      .set({
        firstName: data.firstName.trim(),
        surname: data.surname.trim(),
        whatsapp: data.whatsapp.trim(),
        institutionId: resolvedInstitutionId ?? existingClient.institutionId,
        institutionOther:
          data.institutionOther?.trim() ?? existingClient.institutionOther,
        department: data.department?.trim() ?? existingClient.department,
        billingContactName:
          data.billingContactName?.trim() ?? existingClient.billingContactName,
        billingContactEmail:
          data.billingContactEmail?.trim() ??
          existingClient.billingContactEmail,
        referralSource: data.referralSource,
        updatedAt: nowIso,
      })
      .where(eq(clients.id, clientId));
  } else {
    const [insertedClient] = await db
      .insert(clients)
      .values({
        firstName: data.firstName.trim(),
        surname: data.surname.trim(),
        email: normalizedEmail,
        whatsapp: data.whatsapp.trim(),
        institutionId: resolvedInstitutionId,
        institutionOther: data.institutionOther?.trim() || null,
        department: data.department?.trim() || null,
        billingContactName: data.billingContactName?.trim() || null,
        billingContactEmail: data.billingContactEmail?.trim() || null,
        referralSource: data.referralSource,
      })
      .returning();
    clientId = insertedClient.id;
  }

  // 5. Check for Duplicate Submissions within the last 24 hours (Same Client + Document Type)
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const recentMatchingProjects = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.clientId, clientId),
        eq(projects.documentType, data.documentType),
        gte(projects.createdAt, twentyFourHoursAgo)
      )
    )
    .orderBy(desc(projects.createdAt))
    .limit(1);

  const isDuplicateFlag = recentMatchingProjects.length > 0;
  const duplicateOfProjectId = isDuplicateFlag
    ? recentMatchingProjects[0].id
    : null;

  // 6. Calculate Quote from Rate Card & Conditional Payment Plan Rules
  const quoteSummary = await calculateQuote({
    selectedServices: data.services,
    pageCount: data.pageCount,
    referencePageCount: data.referencePageCount,
    wordCount: data.wordCount,
    deliverySpeed: data.deliverySpeed,
    paymentOption: data.paymentOption,
    requestedInstalmentMonths: data.selectedInstalmentMonths,
    degreeLevel: effectiveDegreeLevel,
  });

  // 7. Create Project (Brief / Tracker Row)
  const shouldRequestSupervisor =
    data.supervisorSignOff === "no" && Boolean(data.requestSupervisorSignOff);
  const supervisorSignOffToken = shouldRequestSupervisor
    ? crypto.randomUUID()
    : null;

  const [createdProject] = await db
    .insert(projects)
    .values({
      clientId,
      isDuplicateFlag,
      duplicateOfProjectId,
      institutionId: resolvedInstitutionId,
      institutionOther: data.institutionOther?.trim() || null,
      degreeLevel: effectiveDegreeLevel,
      degreeLevelOther: data.degreeLevelOther?.trim() || null,
      degreeProgramme: cleanProgramme,
      researchTitle: data.researchTitle.trim(),
      referralSource: data.referralSource,
      documentType: data.documentType,
      documentTypeOther: data.documentTypeOther?.trim() || null,
      wholeOrPart: data.wholeOrPart,
      whichPart: data.wholeOrPart === "part" ? data.whichPart?.trim() : null,
      wordCount: data.wordCount,
      pageCount: data.pageCount,
      referencePageCount: data.referencePageCount,
      referencingStyle: data.referencingStyle,
      referencingStyleOther: data.referencingStyleOther?.trim() || null,
      deliverySpeed: data.deliverySpeed,
      expectedSendDate: data.expectedSendDate,
      requestedReturnDate: data.requestedReturnDate,
      mainGoal: data.mainGoal.trim(),
      concerns: data.concerns?.trim() || null,
      trackedChanges: data.trackedChanges,
      trackedChangesOther: data.trackedChangesOther?.trim() || null,
      certificateRequested: data.certificate === "Yes",
      additionalInfo: data.additionalInfo?.trim() || null,
      uploadedFileName: uploadedFileName || null,
      paymentOption: data.paymentOption,
      department: data.department?.trim() || null,
      billingContactName: data.billingContactName?.trim() || null,
      billingContactEmail: data.billingContactEmail?.trim() || null,
      scopeDeclarationAccepted: true,
      scopeDeclaredAt: nowIso,
      supervisorSignOff: data.supervisorSignOff,
      supervisorDisclaimerAck:
        data.supervisorSignOff === "no"
          ? Boolean(data.supervisorDisclaimerAck)
          : false,
      supervisorName: data.supervisorName?.trim() || null,
      supervisorEmail: data.supervisorEmail?.trim().toLowerCase() || null,
      supervisorSignOffToken,
      supervisorSignOffRequestedAt: shouldRequestSupervisor ? nowIso : null,
      stage: "enquiry",
      releaseWork: false,
      workReady: false,
    })
    .returning();

  // 8. Create Quote & Quote Line Items
  const quoteNumber = generateQuoteNumber();
  const [validitySetting] = await db
    .select()
    .from(crmSettings)
    .where(eq(crmSettings.key, "quote_validity_days"))
    .limit(1);
  const validityDays = Math.max(
    1,
    Number(validitySetting?.value || 14) || 14
  );
  const validUntilDate = new Date(
    Date.now() + validityDays * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const [createdQuote] = await db
    .insert(quotes)
    .values({
      quoteNumber,
      projectId: createdProject.id,
      clientId,
      deliverySpeed: data.deliverySpeed,
      subtotalCents: quoteSummary.subtotalCents,
      expressSurchargeCents: quoteSummary.expressSurchargeCents,
      discountCents: quoteSummary.discountCents,
      totalFeeCents: quoteSummary.totalFeeCents,
      currency: "ZAR",
      paymentOption: data.paymentOption,
      maxInstalmentMonths: quoteSummary.maxInstalmentMonths,
      selectedInstalmentMonths:
        quoteSummary.selectedInstalmentMonths ||
        quoteSummary.maxInstalmentMonths,
      depositPercentage: quoteSummary.depositPercentage,
      depositRequiredCents: quoteSummary.depositRequiredCents,
      paidToDateCents: 0,
      balanceCents: quoteSummary.totalFeeCents,
      instalment1AmountCents: quoteSummary.instalmentAmountsCents[0] ?? null,
      instalment2AmountCents: quoteSummary.instalmentAmountsCents[1] ?? null,
      instalment3AmountCents: quoteSummary.instalmentAmountsCents[2] ?? null,
      institutionalStatus:
        data.paymentOption === "institutional_funding"
          ? "awaiting_po"
          : "not_applicable",
      outcome: "awaiting_reply",
      sentAt: nowIso,
      validUntil: validUntilDate,
    })
    .returning();

  for (const item of quoteSummary.items) {
    await db.insert(quoteItems).values({
      quoteId: createdQuote.id,
      projectId: createdProject.id,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      pricingBasis: item.pricingBasis,
      quantity: item.quantity,
      unitStandardRateCents: item.unitStandardRateCents,
      unitExpressSurchargeCents: item.unitExpressSurchargeCents,
      appliedAdjustmentCents: item.appliedAdjustmentCents,
      lineTotalCents: item.lineTotalCents,
    });
  }

  return {
    clientId,
    projectId: createdProject.id,
    projectAccessToken: createdProject.accessToken,
    quoteId: createdQuote.id,
    quoteNumber,
    quoteToken: createdQuote.token,
    quoteSummary,
    institutionName: resolvedInstitutionName,
    isDuplicateFlag,
    duplicateOfProjectId,
    supervisorSignOffToken,
  };
}

