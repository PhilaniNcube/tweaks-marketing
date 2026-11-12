import { asc, eq, inArray, like } from "drizzle-orm";
import { db } from "./index.ts";
import {
  certificates,
  clients,
  degreeLevels,
  institutions,
  payments,
  projects,
  quoteItems,
  quotes,
  rateCardRules,
  services,
  type PaymentOption,
  type ProjectStage,
  type QuoteOutcome,
  type WhyLost,
} from "./schema.ts";
import { seedCrmDatabase } from "./seed.ts";
import { calculateQuoteFromCatalog } from "../lib/pricing/quote-calculator.ts";

/**
 * Demo deliverables are committed under `public/demo/` so that seeded projects
 * always resolve. These previously pointed at `https://files.tweaks.co.za`, a
 * host that was never provisioned (NXDOMAIN), which left every demo download
 * link dead in the CRM and on the client quote page.
 */
const DEMO_FILES = {
  manuscript: "/demo/manuscript.docx",
  editedDoc: "/demo/edited.docx",
  editingReport: "/demo/editing-report.pdf",
  referencingReport: "/demo/referencing-report.pdf",
  walkthrough: "/demo/walkthrough.mp4",
} as const;

interface DemoProjectSeed {
  firstName: string;
  surname: string;
  institutionName: string;
  degreeDesignator: string;
  degreeProgramme: string;
  researchTitle: string;
  referralSource: string;
  documentType: string;
  pages: number;
  refPages: number;
  speed: "standard" | "express";
  serviceSlugs: string[];
  stage: ProjectStage;
  paymentOption: PaymentOption;
  /** 0 = unpaid, 0.5 = 50% deposit only, 1 = fully paid */
  paidFraction: number;
  mainGoal: string;
  concerns?: string;
  poNumber?: string;
  workReady?: boolean;
  archived?: boolean;
  certificate?: boolean;
  duplicate?: boolean;
  whyLost?: WhyLost;
  whyLostNotes?: string;
  supervisorNo?: boolean;
  supervisorConfirmed?: boolean;
}

const DEMO_PROJECTS: DemoProjectSeed[] = [
  {
    firstName: "Thabo",
    surname: "Mokoena",
    institutionName: "University of Limpopo (UL)",
    degreeDesignator: "MSc",
    degreeProgramme: "Finance",
    researchTitle:
      "The impact of digital banking adoption on financial inclusion in rural Limpopo",
    referralSource: "Google Search",
    documentType: "Thesis/Dissertation",
    pages: 142,
    refPages: 14,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-checking"],
    stage: "enquiry",
    paymentOption: "full_payment",
    paidFraction: 0,
    mainGoal:
      "Prepare the thesis for examination submission and improve academic tone throughout.",
    concerns: "Long sentences and inconsistent terminology.",
  },
  {
    firstName: "Naledi",
    surname: "Dlamini",
    institutionName: "University of KwaZulu-Natal (UKZN)",
    degreeDesignator: "MEd",
    degreeProgramme: "Educational Psychology",
    researchTitle:
      "Exploring teacher perceptions of inclusive education in KwaZulu-Natal primary schools",
    referralSource: "Supervisor Recommendation",
    documentType: "Thesis/Dissertation",
    pages: 118,
    refPages: 9,
    speed: "standard",
    serviceSlugs: ["academic-editing"],
    stage: "quote_sent",
    paymentOption: "payment_plan",
    paidFraction: 0,
    mainGoal:
      "Refine the argument and language quality before final supervisor review.",
  },
  {
    firstName: "Sipho",
    surname: "Ndlovu",
    institutionName: "University of Johannesburg (UJ)",
    degreeDesignator: "MA",
    degreeProgramme: "Sociology",
    researchTitle:
      "A comparative analysis of municipal service delivery protests in Gauteng",
    referralSource: "Colleague / Fellow Student Referral",
    documentType: "Thesis/Dissertation",
    pages: 96,
    refPages: 8,
    speed: "express",
    serviceSlugs: ["academic-editing", "reference-list-editing"],
    stage: "quote_sent",
    paymentOption: "full_payment",
    paidFraction: 0,
    mainGoal:
      "Polish the manuscript for submission to the faculty higher degrees committee.",
  },
  {
    firstName: "Lerato",
    surname: "Molefe",
    institutionName: "University of the Free State (UFS)",
    degreeDesignator: "MPH",
    degreeProgramme: "Public Health",
    researchTitle: "Prevalence of hypertension among young adults in Mangaung",
    referralSource: "University Department / Faculty",
    documentType: "Thesis/Dissertation",
    pages: 154,
    refPages: 18,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-checking", "formatting"],
    stage: "accepted",
    paymentOption: "institutional_funding",
    paidFraction: 0,
    mainGoal:
      "Final language edit and formatting for institutional examination submission.",
  },
  {
    firstName: "Ayesha",
    surname: "Patel",
    institutionName: "University of Cape Town (UCT)",
    degreeDesignator: "MCom",
    degreeProgramme: "Development Studies",
    researchTitle:
      "The role of microfinance in women's entrepreneurship in Cape Town",
    referralSource: "Previous Client",
    documentType: "Thesis/Dissertation",
    pages: 130,
    refPages: 11,
    speed: "express",
    serviceSlugs: ["academic-editing"],
    stage: "accepted",
    paymentOption: "payment_plan",
    paidFraction: 0,
    mainGoal:
      "Improve clarity, flow, and academic register for final submission.",
    concerns: "Repetition in the literature review chapter.",
  },
  {
    firstName: "Bongani",
    surname: "Khumalo",
    institutionName: "University of the Witwatersrand (Wits)",
    degreeDesignator: "MSc",
    degreeProgramme: "Computer Science",
    researchTitle:
      "Machine learning approaches for detecting credit card fraud in South African banks",
    referralSource: "Social Media (LinkedIn / Facebook / Instagram)",
    documentType: "Thesis/Dissertation",
    pages: 110,
    refPages: 10,
    speed: "standard",
    serviceSlugs: ["academic-editing", "formatting"],
    stage: "in_progress",
    paymentOption: "full_payment",
    paidFraction: 1,
    mainGoal:
      "Tighten the technical argument and align all formatting with university guidelines.",
  },
  {
    firstName: "Zanele",
    surname: "Ngcobo",
    institutionName: "Gordon Institute of Business Science (GIBS)",
    degreeDesignator: "MBA",
    degreeProgramme: "Business Administration",
    researchTitle:
      "Employee engagement and remote work productivity in the insurance sector",
    referralSource: "WhatsApp",
    documentType: "Thesis/Dissertation",
    pages: 88,
    refPages: 7,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-checking"],
    stage: "in_progress",
    paymentOption: "payment_plan",
    paidFraction: 0.5,
    mainGoal:
      "Make the report concise and executive-ready while preserving the research evidence.",
  },
  {
    firstName: "Kabelo",
    surname: "Mahlangu",
    institutionName: "University of Pretoria (UP)",
    degreeDesignator: "PhD",
    degreeProgramme: "Chemistry",
    researchTitle: "Assessing water quality in the Olifants River catchment",
    referralSource: "Supervisor Recommendation",
    documentType: "Thesis/Dissertation",
    pages: 210,
    refPages: 24,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-list-editing", "formatting"],
    stage: "in_progress",
    paymentOption: "institutional_funding",
    paidFraction: 0,
    poNumber: "PO-UP-2026-0198",
    mainGoal:
      "Comprehensive academic edit for the final doctoral examination draft.",
    supervisorNo: true,
    supervisorConfirmed: true,
  },
  {
    firstName: "Chantelle",
    surname: "van Wyk",
    institutionName: "Stellenbosch University (SU)",
    degreeDesignator: "MA",
    degreeProgramme: "Psychology",
    researchTitle:
      "The influence of social media on adolescent body image perceptions",
    referralSource: "Google Search",
    documentType: "Thesis/Dissertation",
    pages: 124,
    refPages: 13,
    speed: "standard",
    serviceSlugs: ["abstract-editing", "academic-editing"],
    stage: "work_ready",
    paymentOption: "full_payment",
    paidFraction: 1,
    workReady: true,
    mainGoal: "Prepare a polished dissertation for the final review window.",
  },
  {
    firstName: "Musa",
    surname: "Radebe",
    institutionName: "Rhodes University (RU)",
    degreeDesignator: "MCom",
    degreeProgramme: "Economics",
    researchTitle:
      "Renewable energy policy and household adoption in the Eastern Cape",
    referralSource: "University Department / Faculty",
    documentType: "Thesis/Dissertation",
    pages: 102,
    refPages: 9,
    speed: "express",
    serviceSlugs: ["academic-editing", "reference-checking"],
    stage: "work_ready",
    paymentOption: "payment_plan",
    paidFraction: 0.5,
    workReady: true,
    mainGoal:
      "Finalise the manuscript language and ensure consistent citation practice.",
  },
  {
    firstName: "Palesa",
    surname: "Mofokeng",
    institutionName: "North-West University (NWU)",
    degreeDesignator: "PhD",
    degreeProgramme: "Development Studies",
    researchTitle:
      "Indigenous knowledge systems in climate-resilient agriculture",
    referralSource: "Colleague / Fellow Student Referral",
    documentType: "Thesis/Dissertation",
    pages: 188,
    refPages: 21,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-list-editing"],
    stage: "review",
    paymentOption: "institutional_funding",
    paidFraction: 0,
    poNumber: "PO-NWU-2026-0451",
    workReady: true,
    mainGoal: "Prepare the final thesis for the 72-hour client review window.",
  },
  {
    firstName: "Ruan",
    surname: "Botha",
    institutionName: "University of Pretoria (UP)",
    degreeDesignator: "MEng",
    degreeProgramme: "Mechanical Engineering",
    researchTitle:
      "Structural optimisation of lightweight concrete beams for low-cost housing",
    referralSource: "WhatsApp",
    documentType: "Thesis/Dissertation",
    pages: 134,
    refPages: 12,
    speed: "express",
    serviceSlugs: ["academic-editing", "formatting"],
    stage: "review",
    paymentOption: "full_payment",
    paidFraction: 1,
    workReady: true,
    mainGoal:
      "Ensure the engineering report is clear, consistent, and submission-ready.",
  },
  {
    firstName: "Nomsa",
    surname: "Sithole",
    institutionName: "University of the Witwatersrand (Wits)",
    degreeDesignator: "MCur",
    degreeProgramme: "Nursing Science",
    researchTitle: "Nurse-led interventions for reducing hospital readmissions",
    referralSource: "Previous Client",
    documentType: "Thesis/Dissertation",
    pages: 112,
    refPages: 10,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-checking", "formatting"],
    stage: "complete",
    paymentOption: "full_payment",
    paidFraction: 1,
    workReady: true,
    certificate: true,
    mainGoal:
      "Final edit and certificate-ready formatting for the completed study.",
  },
  {
    firstName: "Ebrahim",
    surname: "Cassim",
    institutionName: "University of KwaZulu-Natal (UKZN)",
    degreeDesignator: "MCom",
    degreeProgramme: "Accounting",
    researchTitle: "Islamic finance instruments and SME growth in Durban",
    referralSource: "University Department / Faculty",
    documentType: "Thesis/Dissertation",
    pages: 108,
    refPages: 8,
    speed: "standard",
    serviceSlugs: ["academic-editing"],
    stage: "complete",
    paymentOption: "payment_plan",
    paidFraction: 1,
    workReady: true,
    certificate: true,
    mainGoal:
      "Complete the final language edit and issue the editing certificate.",
  },
  {
    firstName: "Michelle",
    surname: "Adams",
    institutionName: "University of the Western Cape (UWC)",
    degreeDesignator: "LLM",
    degreeProgramme: "Law",
    researchTitle:
      "The effectiveness of restorative justice programmes in Western Cape schools",
    referralSource: "Supervisor Recommendation",
    documentType: "Thesis/Dissertation",
    pages: 146,
    refPages: 16,
    speed: "express",
    serviceSlugs: ["academic-editing", "reference-list-editing"],
    stage: "complete",
    paymentOption: "institutional_funding",
    paidFraction: 1,
    poNumber: "PO-UWC-2026-0077",
    workReady: true,
    certificate: true,
    mainGoal:
      "Finalise the legal dissertation and provide the official editing certificate.",
  },
  {
    firstName: "Tshepo",
    surname: "Motaung",
    institutionName: "Gordon Institute of Business Science (GIBS)",
    degreeDesignator: "MBA",
    degreeProgramme: "Business Administration",
    researchTitle:
      "Supply chain resilience in the South African automotive industry",
    referralSource: "Social Media (LinkedIn / Facebook / Instagram)",
    documentType: "Thesis/Dissertation",
    pages: 84,
    refPages: 6,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-checking"],
    stage: "closed",
    paymentOption: "full_payment",
    paidFraction: 1,
    workReady: true,
    mainGoal:
      "Final file was delivered and the project has been closed successfully.",
  },
  {
    firstName: "Fatima",
    surname: "Ismail",
    institutionName: "University of Cape Town (UCT)",
    degreeDesignator: "PhD",
    degreeProgramme: "Chemistry",
    researchTitle:
      "Cytotoxicity of medicinal plant extracts in breast cancer cell lines",
    referralSource: "Google Search",
    documentType: "Journal Article",
    pages: 28,
    refPages: 4,
    speed: "standard",
    serviceSlugs: ["journal-article-proposal-editing"],
    stage: "lost",
    paymentOption: "full_payment",
    paidFraction: 0,
    whyLost: "price",
    whyLostNotes:
      "Client accepted a lower quote from an internal university editor.",
    mainGoal:
      "Prepare the manuscript for submission to an international journal.",
  },
  {
    firstName: "Sibusiso",
    surname: "Zulu",
    institutionName: "University of Johannesburg (UJ)",
    degreeDesignator: "MCom",
    degreeProgramme: "Development Studies",
    researchTitle:
      "Youth unemployment and skills development programmes in Ekurhuleni",
    referralSource: "Colleague / Fellow Student Referral",
    documentType: "Proposal",
    pages: 42,
    refPages: 3,
    speed: "standard",
    serviceSlugs: ["academic-editing", "reference-checking"],
    stage: "lost",
    paymentOption: "payment_plan",
    paidFraction: 0,
    duplicate: true,
    whyLost: "no_reply",
    whyLostNotes:
      "No response after two follow-up emails and a WhatsApp nudge.",
    mainGoal:
      "Polish the research proposal before submission to the faculty committee.",
  },
  {
    firstName: "Anika",
    surname: "Pillay",
    institutionName: "University of Pretoria (UP)",
    degreeDesignator: "PhD",
    degreeProgramme: "Information Systems",
    researchTitle:
      "Big data analytics capability and firm performance in South African retail",
    referralSource: "Previous Client",
    documentType: "Thesis/Dissertation",
    pages: 176,
    refPages: 19,
    speed: "express",
    serviceSlugs: ["academic-editing", "formatting"],
    stage: "work_ready",
    paymentOption: "full_payment",
    paidFraction: 1,
    workReady: true,
    archived: true,
    mainGoal:
      "Archived after delivery to keep the active pipeline focused on current work.",
  },
  {
    firstName: "Kagiso",
    surname: "Sebola",
    institutionName: "University of Venda (UNIVEN)",
    degreeDesignator: "MSc",
    degreeProgramme: "Agricultural Economics",
    researchTitle: "Land reform and food security in Limpopo province",
    referralSource: "WhatsApp",
    documentType: "Proposal",
    pages: 56,
    refPages: 5,
    speed: "standard",
    serviceSlugs: ["academic-editing"],
    stage: "enquiry",
    paymentOption: "payment_plan",
    paidFraction: 0,
    mainGoal:
      "Improve the proposal's structure and academic language before supervisor review.",
  },
];

function dateAt(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function timestampAt(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

async function resetDemoProjects() {
  const demoProjectRows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(like(projects.accessToken, "demo-access-%"));
  const demoProjectIds = demoProjectRows.map((row) => row.id);

  if (demoProjectIds.length > 0) {
    await db
      .delete(payments)
      .where(inArray(payments.projectId, demoProjectIds));
    await db
      .delete(quoteItems)
      .where(inArray(quoteItems.projectId, demoProjectIds));
    await db.delete(quotes).where(inArray(quotes.projectId, demoProjectIds));
    await db
      .delete(certificates)
      .where(inArray(certificates.projectId, demoProjectIds));
    await db.delete(projects).where(inArray(projects.id, demoProjectIds));
  }

  await db
    .delete(clients)
    .where(like(clients.email, "demo.%@demo.tweaks.local"));
}

export async function seedDemoProjects() {
  await seedCrmDatabase();

  if (process.argv.includes("--reset")) {
    await resetDemoProjects();
    console.log("✓ Existing demo projects removed.");
  }

  const [institutionRows, degreeRows, serviceRows, ruleRows] =
    await Promise.all([
      db.select().from(institutions).where(eq(institutions.status, "approved")),
      db.select().from(degreeLevels).where(eq(degreeLevels.status, "approved")),
      db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(asc(services.sortOrder)),
      db
        .select()
        .from(rateCardRules)
        .where(eq(rateCardRules.isActive, true))
        .orderBy(asc(rateCardRules.priority)),
    ]);

  if (serviceRows.length === 0 || ruleRows.length === 0) {
    throw new Error(
      "Services and rate card rules must be seeded before demo projects.",
    );
  }

  let created = 0;
  let skipped = 0;

  for (const [index, demo] of DEMO_PROJECTS.entries()) {
    const number = index + 1;
    const suffix = pad(number);
    const email = `demo.${suffix}@demo.tweaks.local`;
    const accessToken = `demo-access-${suffix}`;

    const [existingProject] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.accessToken, accessToken))
      .limit(1);

    if (existingProject) {
      skipped++;
      continue;
    }

    const institution =
      institutionRows.find((row) => row.name === demo.institutionName) ??
      institutionRows[index % Math.max(institutionRows.length, 1)] ??
      null;
    const degreeLevel =
      degreeRows.find((row) => row.designator === demo.degreeDesignator) ??
      degreeRows[index % Math.max(degreeRows.length, 1)] ??
      null;

    const degreeDesignator = degreeLevel?.designator ?? demo.degreeDesignator;

    const quotePreview = calculateQuoteFromCatalog(
      {
        selectedServices: demo.serviceSlugs,
        pageCount: demo.pages,
        referencePageCount: demo.refPages,
        wordCount: demo.pages * 300,
        deliverySpeed: demo.speed,
        paymentOption: demo.paymentOption,
        requestedInstalmentMonths:
          demo.paymentOption === "payment_plan" ? 3 : undefined,
        degreeLevel: degreeDesignator,
      },
      serviceRows,
      ruleRows,
    );

    const createdOffset = -115 + index * 5;
    const createdAt = timestampAt(createdOffset);
    const isHistorical = ["complete", "closed", "lost"].includes(demo.stage);
    const acceptedAt =
      [
        "accepted",
        "in_progress",
        "work_ready",
        "review",
        "complete",
        "closed",
      ].includes(demo.stage) || demo.archived
        ? timestampAt(createdOffset + 1)
        : null;
    const dueDate = isHistorical
      ? dateAt(createdOffset + 5 + (index % 12))
      : dateAt(2 + (index % 18));
    const expectedSendDate = isHistorical
      ? dateAt(createdOffset + 2)
      : dateAt(-4 + (index % 7));

    const totalFeeCents = quotePreview.totalFeeCents;
    const paidCents = Math.round(totalFeeCents * demo.paidFraction);
    const balanceCents = totalFeeCents - paidCents;
    const poLogged = Boolean(demo.poNumber);
    const releaseWork = balanceCents === 0 || poLogged;
    const workReady =
      demo.workReady ??
      ["work_ready", "review", "complete", "closed"].includes(demo.stage);
    const isLost = demo.stage === "lost";

    const outcome: QuoteOutcome = isLost
      ? "declined"
      : demo.stage === "enquiry" || demo.stage === "quote_sent"
        ? "awaiting_reply"
        : "accepted";

    const supervisorSignOff = demo.supervisorNo ? "no" : "yes";
    const supervisorToken =
      demo.supervisorNo && demo.supervisorConfirmed
        ? `demo-supervisor-${suffix}`
        : null;
    const certificateId = demo.certificate ? `CERT-DEMO-${suffix}` : null;

    await db.transaction(async (tx) => {
      const [existingClient] = await tx
        .select()
        .from(clients)
        .where(eq(clients.email, email))
        .limit(1);

      let clientId = existingClient?.id;
      if (!clientId) {
        const [client] = await tx
          .insert(clients)
          .values({
            firstName: demo.firstName,
            surname: demo.surname,
            email,
            whatsapp: `+27 82 000 00${suffix}`,
            institutionId: institution?.id ?? null,
            institutionOther: institution ? null : demo.institutionName,
            department:
              demo.paymentOption === "institutional_funding"
                ? `Department of ${demo.degreeProgramme}`
                : null,
            billingContactName:
              demo.paymentOption === "institutional_funding"
                ? "Faculty Finance Officer"
                : null,
            billingContactEmail:
              demo.paymentOption === "institutional_funding"
                ? `finance.${suffix}@demo.tweaks.local`
                : null,
            referralSource: demo.referralSource,
            createdAt,
            updatedAt: createdAt,
          })
          .returning();
        clientId = client.id;
      }

      const [project] = await tx
        .insert(projects)
        .values({
          clientId,
          accessToken,
          isDuplicateFlag: Boolean(demo.duplicate),
          duplicateResolved: false,
          duplicateOfProjectId: null,
          institutionId: institution?.id ?? null,
          institutionOther: institution ? null : demo.institutionName,
          degreeLevel: degreeDesignator,
          degreeProgramme: demo.degreeProgramme,
          researchTitle: demo.researchTitle,
          referralSource: demo.referralSource,
          documentType: demo.documentType,
          wholeOrPart: "whole",
          whichPart: null,
          wordCount: demo.pages * 300,
          pageCount: demo.pages,
          referencePageCount: demo.refPages,
          referencingStyle:
            demo.documentType === "Journal Article" ? "Vancouver" : "APA 7th",
          deliverySpeed: demo.speed,
          expectedSendDate,
          requestedReturnDate: dueDate,
          mainGoal: demo.mainGoal,
          concerns: demo.concerns ?? null,
          trackedChanges:
            demo.stage === "enquiry"
              ? "Just the edited file is fine"
              : "Yes, both versions",
          certificateRequested: demo.certificate ?? false,
          additionalInfo: "Demo seed record — safe to delete.",
          uploadedFileName: "demo-manuscript.docx",
          uploadedFileUrl: DEMO_FILES.manuscript,
          paymentOption: demo.paymentOption,
          department:
            demo.paymentOption === "institutional_funding"
              ? `Department of ${demo.degreeProgramme}`
              : null,
          billingContactName:
            demo.paymentOption === "institutional_funding"
              ? "Faculty Finance Officer"
              : null,
          billingContactEmail:
            demo.paymentOption === "institutional_funding"
              ? `finance.${suffix}@demo.tweaks.local`
              : null,
          scopeDeclarationAccepted: true,
          scopeDeclaredAt: createdAt,
          supervisorSignOff,
          supervisorDisclaimerAck: supervisorSignOff === "no",
          supervisorName:
            supervisorSignOff === "no"
              ? `Prof. ${demo.surname} Supervisor`
              : null,
          supervisorEmail:
            supervisorSignOff === "no"
              ? `supervisor.${suffix}@demo.tweaks.local`
              : null,
          supervisorSignOffToken: supervisorToken,
          supervisorSignOffRequestedAt: supervisorToken ? createdAt : null,
          supervisorSignOffReceivedAt:
            supervisorToken && demo.supervisorConfirmed
              ? timestampAt(createdOffset + 3)
              : null,
          stage: demo.stage,
          releaseWork,
          workReady,
          workReadyAt: workReady ? timestampAt(createdOffset + 8) : null,
          editedDocUrl: workReady ? DEMO_FILES.editedDoc : null,
          editingReportUrl: workReady ? DEMO_FILES.editingReport : null,
          referencingReportUrl: workReady ? DEMO_FILES.referencingReport : null,
          walkthroughVideoUrl:
            demo.stage === "complete" || demo.stage === "review"
              ? DEMO_FILES.walkthrough
              : null,
          clientOpenedAt: demo.stage === "review" ? timestampAt(-1) : null,
          reviewClosesAt: demo.stage === "review" ? timestampAt(2) : null,
          accessExpiresAt: workReady ? dateAt(30) : null,
          completedAt:
            demo.stage === "complete" || demo.stage === "closed"
              ? timestampAt(createdOffset + 12)
              : null,
          archivedAt: demo.archived ? timestampAt(-2) : null,
          internalNotes: "Demo seed record — safe to delete.",
          createdAt,
          updatedAt: timestampAt(-1),
        })
        .returning();

      const [quote] = await tx
        .insert(quotes)
        .values({
          quoteNumber: `QT-DEMO-${suffix}`,
          projectId: project.id,
          clientId,
          token: `demo-quote-${suffix}`,
          deliverySpeed: demo.speed,
          subtotalCents: quotePreview.subtotalCents,
          expressSurchargeCents: quotePreview.expressSurchargeCents,
          discountCents: quotePreview.discountCents,
          totalFeeCents,
          currency: "ZAR",
          paymentOption: demo.paymentOption,
          maxInstalmentMonths: quotePreview.maxInstalmentMonths,
          selectedInstalmentMonths: quotePreview.selectedInstalmentMonths,
          depositPercentage: quotePreview.depositPercentage,
          depositRequiredCents: quotePreview.depositRequiredCents,
          paidToDateCents: paidCents,
          balanceCents,
          instalment1DueDate:
            demo.paymentOption === "payment_plan"
              ? dateAt(createdOffset + 30)
              : null,
          instalment1AmountCents:
            quotePreview.instalmentAmountsCents[0] ?? null,
          instalment2DueDate:
            demo.paymentOption === "payment_plan"
              ? dateAt(createdOffset + 60)
              : null,
          instalment2AmountCents:
            quotePreview.instalmentAmountsCents[1] ?? null,
          instalment3DueDate:
            quotePreview.maxInstalmentMonths >= 3
              ? dateAt(createdOffset + 90)
              : null,
          instalment3AmountCents:
            quotePreview.instalmentAmountsCents[2] ?? null,
          poNumber: demo.poNumber ?? null,
          poDate: demo.poNumber ? dateAt(createdOffset + 4) : null,
          paymentTermsDays: 30,
          invoiceDueDate: demo.poNumber
            ? addDaysToIsoDate(dateAt(createdOffset + 4), 30)
            : null,
          institutionalStatus:
            demo.paymentOption !== "institutional_funding"
              ? "not_applicable"
              : demo.poNumber
                ? balanceCents === 0
                  ? "paid"
                  : "awaiting_institution"
                : "awaiting_po",
          outcome,
          whyLost: isLost ? (demo.whyLost ?? "other") : null,
          whyLostNotes: isLost ? (demo.whyLostNotes ?? null) : null,
          sentAt: createdAt,
          validUntil: dateAt(createdOffset + 14),
          acceptedAt,
          createdAt,
          updatedAt: timestampAt(-1),
        })
        .returning();

      for (const item of quotePreview.items) {
        await tx.insert(quoteItems).values({
          quoteId: quote.id,
          projectId: project.id,
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

      if (paidCents > 0) {
        const paidAt = timestampAt(createdOffset + 3);
        if (demo.paymentOption === "payment_plan" && demo.paidFraction < 1) {
          await tx.insert(payments).values({
            projectId: project.id,
            quoteId: quote.id,
            clientId,
            paymentType: "deposit",
            amountCents: paidCents,
            currency: "ZAR",
            method: "eft",
            status: "success",
            paystackReference: `DEMO-PAY-${suffix}-A`,
            receiptNumber: `RCP-DEMO-${suffix}-A`,
            paidAt,
            notes: "Demo deposit payment",
          });
        } else if (demo.paymentOption === "payment_plan") {
          const depositCents = quotePreview.depositRequiredCents;
          const balancePaymentCents = totalFeeCents - depositCents;
          await tx.insert(payments).values([
            {
              projectId: project.id,
              quoteId: quote.id,
              clientId,
              paymentType: "deposit",
              amountCents: depositCents,
              currency: "ZAR",
              method: "eft",
              status: "success",
              paystackReference: `DEMO-PAY-${suffix}-A`,
              receiptNumber: `RCP-DEMO-${suffix}-A`,
              paidAt,
              notes: "Demo 50% deposit",
            },
            {
              projectId: project.id,
              quoteId: quote.id,
              clientId,
              paymentType: "balance",
              amountCents: balancePaymentCents,
              currency: "ZAR",
              method: "eft",
              status: "success",
              paystackReference: `DEMO-PAY-${suffix}-B`,
              receiptNumber: `RCP-DEMO-${suffix}-B`,
              paidAt: timestampAt(createdOffset + 9),
              notes: "Demo final balance",
            },
          ]);
        } else {
          await tx.insert(payments).values({
            projectId: project.id,
            quoteId: quote.id,
            clientId,
            paymentType: demo.paidFraction === 1 ? "full_payment" : "deposit",
            amountCents: paidCents,
            currency: "ZAR",
            method: index % 2 === 0 ? "eft" : "other",
            status: "success",
            paystackReference: `DEMO-PAY-${suffix}-A`,
            receiptNumber: `RCP-DEMO-${suffix}-A`,
            paidAt,
            notes: "Demo payment",
          });
        }
      }

      if (certificateId) {
        const completionDate = new Date(createdAt).toLocaleDateString("en-ZA", {
          month: "long",
          year: "numeric",
        });
        await tx
          .insert(certificates)
          .values({
            id: certificateId,
            token: `cert-demo-${suffix}`,
            projectId: project.id,
            status: "completed",
            researchTitle: demo.researchTitle,
            researcherName: `${demo.firstName} ${demo.surname}`,
            university: institution?.name ?? demo.institutionName,
            degreeLevel: degreeDesignator,
            degreeProgramme: demo.degreeProgramme,
            completionDate,
            recipientEmail: email,
            completedAt: timestampAt(createdOffset + 12),
          })
          .onConflictDoNothing({ target: certificates.id });
      }
    });

    created++;
  }

  console.log(
    `✓ Demo projects seeded: ${created} created, ${skipped} skipped (already existed).`,
  );
}

if (process.argv[1]?.endsWith("seed-projects.ts")) {
  seedDemoProjects()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed demo projects:", err);
      process.exit(1);
    });
}
