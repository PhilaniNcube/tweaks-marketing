"use server";

import { db } from "@/db";
import {
  clients,
  projects,
  quotes,
  quoteItems,
  payments,
  services,
  rateCardRules,
  institutions,
  degreeLevels,
  crmSettings,
  certificates,
  type ProjectStage,
  type PaymentOption,
  type QuoteOutcome,
  type WhyLost,
} from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { recalculateQuoteAndProjectFromPayments } from "@/lib/paystack";
import { DEFAULT_CRM_SETTINGS } from "@/db/seed-data";
import { seedCrmDatabase } from "@/db/seed";

/**
 * Fetches everything needed for the interactive client Quote, Payment, Status & Handover page (/quote/[token]).
 * Resolves either quotes.token or projects.accessToken so the same link works across Phases 3 and 5.
 */
export async function getQuotePageDataByToken(token: string) {
  try {
    let [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.token, token))
      .limit(1);

    let project = null;
    if (quote) {
      const [proj] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, quote.projectId))
        .limit(1);
      project = proj || null;
    } else {
      // Check if token is a project accessToken
      const [proj] = await db
        .select()
        .from(projects)
        .where(eq(projects.accessToken, token))
        .limit(1);
      if (proj) {
        project = proj;
        const [q] = await db
          .select()
          .from(quotes)
          .where(eq(quotes.projectId, proj.id))
          .orderBy(desc(quotes.createdAt))
          .limit(1);
        quote = q;
      }
    }

    if (!quote || !project) return null;

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, project.clientId))
      .limit(1);

    if (!client) return null;

    let institutionName =
      project.institutionOther || client.institutionOther || "University";
    if (project.institutionId) {
      const [inst] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.id, project.institutionId))
        .limit(1);
      if (inst) institutionName = inst.name;
    }

    const [items, quotePayments, certRows, settingsRows, allServices] =
      await Promise.all([
        db
          .select()
          .from(quoteItems)
          .where(eq(quoteItems.quoteId, quote.id)),
        db
          .select()
          .from(payments)
          .where(eq(payments.quoteId, quote.id))
          .orderBy(desc(payments.createdAt)),
        db
          .select()
          .from(certificates)
          .where(eq(certificates.projectId, project.id))
          .limit(1),
        db.select().from(crmSettings),
        db.select().from(services),
      ]);

    const settingsMap: Record<string, string> = {};
    for (const s of DEFAULT_CRM_SETTINGS) {
      settingsMap[s.key] = s.value;
    }
    for (const s of settingsRows) {
      settingsMap[s.key] = s.value;
    }

    // Check whether any purchased service includes a referencing report
    const includesReferencingReport = items.some((item) => {
      const svc = allServices.find((s) => s.id === item.serviceId);
      return (
        svc?.includesReferencingReport ||
        item.serviceName.toLowerCase().includes("reference")
      );
    });

    // Check if quote link is past validity date (and hasn't been accepted/paid yet)
    const todayIso = new Date().toISOString().split("T")[0];
    const isExpired =
      Boolean(quote.validUntil && quote.validUntil < todayIso) &&
      quote.paidToDateCents === 0 &&
      quote.outcome !== "accepted";

    return {
      quote,
      project,
      client,
      institutionName,
      items,
      payments: quotePayments.filter((p) => p.status === "success"),
      certificate: certRows[0] || null,
      includesReferencingReport,
      isExpired,
      settings: settingsMap,
    };
  } catch (error) {
    console.error("Error loading quote page data:", error);
    return null;
  }
}

/**
 * Client action on /quote/[token]: accepts the quote and locks in their chosen payment option
 * (1. Full payment, 2. Payment plan [2 vs 3 months], or 3. Institutional funding).
 */
export async function acceptQuoteAndSelectOption(input: {
  quoteToken: string;
  paymentOption: PaymentOption;
  selectedInstalmentMonths?: number;
  department?: string;
  billingContactName?: string;
  billingContactEmail?: string;
}) {
  try {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.token, input.quoteToken))
      .limit(1);

    if (!quote) {
      return { success: false as const, error: "Quote not found." };
    }

    const cappedMonths =
      input.paymentOption === "payment_plan"
        ? Math.min(
            quote.maxInstalmentMonths,
            Math.max(
              2,
              input.selectedInstalmentMonths || quote.selectedInstalmentMonths
            )
          )
        : quote.maxInstalmentMonths;

    const depositPercentage =
      input.paymentOption === "payment_plan"
        ? 50
        : input.paymentOption === "institutional_funding"
          ? 0
          : 100;

    const depositRequiredCents =
      input.paymentOption === "payment_plan"
        ? Math.round(quote.totalFeeCents * 0.5)
        : input.paymentOption === "institutional_funding"
          ? 0
          : quote.totalFeeCents;

    const remAfterDeposit = quote.totalFeeCents - depositRequiredCents;
    const baseInst =
      cappedMonths > 0 ? Math.floor(remAfterDeposit / cappedMonths) : 0;
    const remInst = remAfterDeposit - baseInst * cappedMonths;
    const nowIso = new Date().toISOString();

    await db
      .update(quotes)
      .set({
        paymentOption: input.paymentOption,
        selectedInstalmentMonths: cappedMonths,
        depositPercentage,
        depositRequiredCents,
        outcome: "accepted",
        acceptedAt: quote.acceptedAt || nowIso,
        institutionalStatus:
          input.paymentOption === "institutional_funding"
            ? quote.poNumber
              ? "awaiting_institution"
              : "awaiting_po"
            : "not_applicable",
        instalment1AmountCents:
          input.paymentOption === "payment_plan" ? baseInst : null,
        instalment2AmountCents:
          input.paymentOption === "payment_plan" && cappedMonths >= 2
            ? cappedMonths === 2
              ? baseInst + remInst
              : baseInst
            : null,
        instalment3AmountCents:
          input.paymentOption === "payment_plan" && cappedMonths >= 3
            ? baseInst + remInst
            : null,
        updatedAt: nowIso,
      })
      .where(eq(quotes.id, quote.id));

    await db
      .update(projects)
      .set({
        paymentOption: input.paymentOption,
        department: input.department?.trim() || undefined,
        billingContactName: input.billingContactName?.trim() || undefined,
        billingContactEmail: input.billingContactEmail?.trim() || undefined,
        stage: "accepted",
        updatedAt: nowIso,
      })
      .where(eq(projects.id, quote.projectId));

    return { success: true as const };
  } catch (error) {
    console.error("Error accepting quote:", error);
    return {
      success: false as const,
      error: "Failed to accept quote. Please try again.",
    };
  }
}

/**
 * Stamps clientOpenedAt on first open of the delivered package and starts the 72-hour review clock.
 */
export async function recordClientOpenedPackage(quoteToken: string) {
  try {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.token, quoteToken))
      .limit(1);

    if (!quote) return { success: false };

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, quote.projectId))
      .limit(1);

    if (!project || !project.workReady || !project.releaseWork) {
      return { success: false };
    }

    if (!project.clientOpenedAt) {
      const now = new Date();
      const reviewCloses = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      await db
        .update(projects)
        .set({
          clientOpenedAt: now.toISOString(),
          reviewClosesAt: reviewCloses.toISOString(),
          stage:
            project.stage === "work_ready" ? "review" : project.stage,
          updatedAt: now.toISOString(),
        })
        .where(eq(projects.id, project.id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error recording client package open:", error);
    return { success: false };
  }
}

/**
 * Loads all data for the built-in Admin CRM Dashboard (/admin/crm).
 */
export async function getAdminCrmDashboardData() {
  try {
    let allServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.sortOrder));

    if (allServices.length === 0) {
      await seedCrmDatabase();
      allServices = await db
        .select()
        .from(services)
        .orderBy(asc(services.sortOrder));
    }

    const [
      allProjects,
      allClients,
      allQuotes,
      allQuoteItems,
      allPayments,
      allInstitutions,
      allDegreeLevels,
      allRules,
      allCertificates,
    ] = await Promise.all([
      db.select().from(projects).orderBy(desc(projects.createdAt)),
      db.select().from(clients),
      db.select().from(quotes).orderBy(desc(quotes.createdAt)),
      db.select().from(quoteItems),
      db.select().from(payments).orderBy(desc(payments.createdAt)),
      db.select().from(institutions).orderBy(asc(institutions.name)),
      db.select().from(degreeLevels).orderBy(asc(degreeLevels.sortOrder)),
      db.select().from(rateCardRules).orderBy(asc(rateCardRules.priority)),
      db.select().from(certificates),
    ]);

    const enrichedProjects = allProjects.map((proj) => {
      const client = allClients.find((c) => c.id === proj.clientId) || null;
      const quote =
        allQuotes.find((q) => q.projectId === proj.id) || null;
      const items = quote
        ? allQuoteItems.filter((i) => i.quoteId === quote.id)
        : [];
      const projPayments = allPayments.filter(
        (p) => p.projectId === proj.id
      );
      const institution = proj.institutionId
        ? allInstitutions.find((i) => i.id === proj.institutionId) || null
        : null;
      const certificate =
        allCertificates.find((c) => c.projectId === proj.id) || null;

      return {
        project: proj,
        client,
        quote,
        items,
        payments: projPayments,
        institutionName:
          institution?.name || proj.institutionOther || "Unspecified",
        certificate,
      };
    });

    // Calculate CRM KPIs (including "Released on a PO, not yet paid" exposure)
    let totalQuotedCents = 0;
    let totalPaidCents = 0;
    let totalOutstandingCents = 0;
    let releasedOnPoExposureCents = 0;
    let flaggedDuplicatesCount = 0;

    for (const row of enrichedProjects) {
      if (row.project.isDuplicateFlag && !row.project.duplicateResolved) {
        flaggedDuplicatesCount++;
      }
      if (row.quote) {
        totalQuotedCents += row.quote.totalFeeCents;
        totalPaidCents += row.quote.paidToDateCents;
        totalOutstandingCents += row.quote.balanceCents;

        if (
          row.quote.paymentOption === "institutional_funding" &&
          row.project.releaseWork &&
          row.quote.balanceCents > 0
        ) {
          releasedOnPoExposureCents += row.quote.balanceCents;
        }
      }
    }

    return {
      rows: enrichedProjects,
      services: allServices,
      rateCardRules: allRules,
      pendingInstitutions: allInstitutions.filter(
        (i) => i.status === "pending_review"
      ),
      pendingDegreeLevels: allDegreeLevels.filter(
        (d) => d.status === "pending_review"
      ),
      kpis: {
        totalProjects: enrichedProjects.length,
        totalQuotedCents,
        totalPaidCents,
        totalOutstandingCents,
        releasedOnPoExposureCents,
        flaggedDuplicatesCount,
      },
    };
  } catch (error) {
    console.error("Error loading Admin CRM dashboard data:", error);
    return {
      rows: [],
      services: [],
      rateCardRules: [],
      pendingInstitutions: [],
      pendingDegreeLevels: [],
      kpis: {
        totalProjects: 0,
        totalQuotedCents: 0,
        totalPaidCents: 0,
        totalOutstandingCents: 0,
        releasedOnPoExposureCents: 0,
        flaggedDuplicatesCount: 0,
      },
    };
  }
}

/**
 * Admin action: updates a project's stage, handover package links, workReady flag,
 * and auto-generates the Completion Certificate when stage reaches "complete".
 */
export async function updateAdminProjectWorkflow(input: {
  projectId: string;
  stage: ProjectStage;
  workReady: boolean;
  editedDocUrl?: string;
  editingReportUrl?: string;
  referencingReportUrl?: string;
  walkthroughVideoUrl?: string;
  internalNotes?: string;
  quoteOutcome?: QuoteOutcome;
  whyLost?: WhyLost;
}) {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);

    if (!project) {
      return { success: false as const, error: "Project not found." };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const thirtyDaysOut = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const isBecomingWorkReady = input.workReady && !project.workReady;
    const isBecomingComplete =
      input.stage === "complete" && project.stage !== "complete";

    await db
      .update(projects)
      .set({
        stage: input.stage,
        workReady: input.workReady,
        workReadyAt: isBecomingWorkReady
          ? nowIso
          : project.workReadyAt,
        editedDocUrl: input.editedDocUrl?.trim() || null,
        editingReportUrl: input.editingReportUrl?.trim() || null,
        referencingReportUrl: input.referencingReportUrl?.trim() || null,
        walkthroughVideoUrl: input.walkthroughVideoUrl?.trim() || null,
        internalNotes: input.internalNotes?.trim() || null,
        completedAt: isBecomingComplete
          ? nowIso
          : project.completedAt,
        accessExpiresAt:
          isBecomingComplete || isBecomingWorkReady
            ? thirtyDaysOut
            : project.accessExpiresAt,
        updatedAt: nowIso,
      })
      .where(eq(projects.id, project.id));

    if (input.quoteOutcome) {
      await db
        .update(quotes)
        .set({
          outcome: input.quoteOutcome,
          whyLost: input.whyLost || null,
          updatedAt: nowIso,
        })
        .where(eq(quotes.projectId, project.id));
    }

    // Automatically issue Completion Certificate when stage reaches "complete"
    if (input.stage === "complete") {
      const [existingCert] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.projectId, project.id))
        .limit(1);

      if (!existingCert) {
        const [client] = await db
          .select()
          .from(clients)
          .where(eq(clients.id, project.clientId))
          .limit(1);

        let institutionName = project.institutionOther || "";
        if (project.institutionId) {
          const [inst] = await db
            .select()
            .from(institutions)
            .where(eq(institutions.id, project.institutionId))
            .limit(1);
          if (inst) institutionName = inst.name;
        }

        const certId = `CERT-${crypto
          .randomUUID()
          .replace(/-/g, "")
          .slice(0, 8)
          .toUpperCase()}`;
        const monthYear = now.toLocaleDateString("en-ZA", {
          month: "long",
          year: "numeric",
        });

        await db.insert(certificates).values({
          id: certId,
          token: crypto.randomUUID(),
          projectId: project.id,
          status: "completed",
          researchTitle: project.researchTitle,
          researcherName: client
            ? `${client.firstName} ${client.surname}`.trim()
            : "Researcher",
          university: institutionName,
          degreeLevel:
            project.degreeLevelOther || project.degreeLevel || null,
          degreeProgramme: project.degreeProgramme || null,
          completionDate: monthYear,
          recipientEmail: client?.email || null,
          completedAt: nowIso,
        });
      }
    }

    return { success: true as const };
  } catch (error) {
    console.error("Error updating project workflow:", error);
    return {
      success: false as const,
      error: "Failed to update project.",
    };
  }
}

/**
 * Admin action: records an Institutional Purchase Order (Option 3),
 * calculates invoiceDueDate = poDate + paymentTermsDays, and opens the releaseWork gate.
 */
export async function recordInstitutionalPurchaseOrder(input: {
  quoteId: string;
  poNumber: string;
  poDate: string;
  paymentTermsDays?: number;
}) {
  try {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, input.quoteId))
      .limit(1);

    if (!quote) {
      return { success: false as const, error: "Quote not found." };
    }

    const cleanPo = input.poNumber.trim();
    const terms = input.paymentTermsDays || 30;
    const baseDate = input.poDate ? new Date(input.poDate) : new Date();
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + terms);
    const invoiceDueDateIso = dueDate.toISOString().split("T")[0];
    const nowIso = new Date().toISOString();

    await db
      .update(quotes)
      .set({
        poNumber: cleanPo || null,
        poDate: input.poDate || null,
        paymentTermsDays: terms,
        invoiceDueDate: cleanPo ? invoiceDueDateIso : null,
        institutionalStatus: cleanPo
          ? quote.balanceCents === 0
            ? "paid"
            : "awaiting_institution"
          : "awaiting_po",
        outcome: cleanPo ? "accepted" : quote.outcome,
        acceptedAt: cleanPo && !quote.acceptedAt ? nowIso : quote.acceptedAt,
        updatedAt: nowIso,
      })
      .where(eq(quotes.id, quote.id));

    await recalculateQuoteAndProjectFromPayments(quote.id);

    return { success: true as const };
  } catch (error) {
    console.error("Error recording institutional PO:", error);
    return { success: false as const, error: "Failed to save PO details." };
  }
}

/**
 * Admin action: logs a manual EFT, Cash, or Institutional payment row in the payments table
 * and recalculates paidToDateCents, balanceCents, and the releaseWork gate automatically.
 */
export async function recordManualPayment(input: {
  quoteId: string;
  amountRands: number;
  paymentType:
    | "deposit"
    | "instalment_1"
    | "instalment_2"
    | "instalment_3"
    | "full_payment"
    | "balance";
  method: "eft" | "cash" | "other";
  reference?: string;
  notes?: string;
}) {
  try {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, input.quoteId))
      .limit(1);

    if (!quote) {
      return { success: false as const, error: "Quote not found." };
    }

    const amountCents = Math.round(Number(input.amountRands) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      return {
        success: false as const,
        error: "Payment amount must be greater than zero.",
      };
    }

    const nowIso = new Date().toISOString();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${crypto
      .randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

    await db.insert(payments).values({
      projectId: quote.projectId,
      quoteId: quote.id,
      clientId: quote.clientId,
      paymentType: input.paymentType,
      amountCents,
      currency: "ZAR",
      method: input.method,
      status: "success",
      paystackReference:
        input.reference?.trim() ||
        `EFT-${quote.quoteNumber}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
      receiptNumber,
      paidAt: nowIso,
      notes: input.notes?.trim() || null,
    });

    await recalculateQuoteAndProjectFromPayments(quote.id, nowIso);

    return { success: true as const };
  } catch (error) {
    console.error("Error recording manual payment:", error);
    return {
      success: false as const,
      error: "Failed to log payment.",
    };
  }
}

export async function resolveDuplicateProjectFlag(projectId: string) {
  try {
    await db
      .update(projects)
      .set({
        duplicateResolved: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId));
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Could not resolve flag." };
  }
}

export async function reviewQueueItemAction(input: {
  kind: "institution" | "degree_level";
  id: string;
  decision: "approved" | "rejected";
}) {
  try {
    if (input.kind === "institution") {
      await db
        .update(institutions)
        .set({ status: input.decision })
        .where(eq(institutions.id, input.id));
    } else {
      await db
        .update(degreeLevels)
        .set({ status: input.decision })
        .where(eq(degreeLevels.id, input.id));
    }
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to update review item." };
  }
}

export async function updateServiceRateCardItem(input: {
  serviceId: string;
  standardRateRands: number;
  expressSurchargeRands: number;
  standardTurnaroundMinDays: number;
  standardTurnaroundMaxDays: number;
  quickbooksItemId?: string;
  isActive: boolean;
}) {
  try {
    await db
      .update(services)
      .set({
        standardRateCents: Math.round(input.standardRateRands * 100),
        expressSurchargeCents: Math.round(input.expressSurchargeRands * 100),
        standardTurnaroundMinDays: input.standardTurnaroundMinDays,
        standardTurnaroundMaxDays: input.standardTurnaroundMaxDays,
        quickbooksItemId: input.quickbooksItemId?.trim() || null,
        isActive: input.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(services.id, input.serviceId));
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to update rate card." };
  }
}

