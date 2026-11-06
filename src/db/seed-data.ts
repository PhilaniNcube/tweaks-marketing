import type {
  NewService,
  NewRateCardRule,
  NewDegreeLevel,
  NewInstitution,
  NewCrmSetting,
} from "./schema.ts";

/**
 * Default Service Catalog & Rate Card (Website as Source of Truth)
 */
export const DEFAULT_SERVICES: NewService[] = [
  {
    slug: "academic-editing",
    name: "Academic editing",
    description:
      "Comprehensive language, grammar, clarity, and academic tone editing for theses and dissertations.",
    pricingBasis: "per_page",
    standardRateCents: 4500, // R45.00 per page
    expressSurchargeCents: 1500, // +R15.00 per page
    hasExpressOption: true,
    standardTurnaroundMinDays: 3,
    standardTurnaroundMaxDays: 5,
    expressTurnaroundMinHours: 24,
    expressTurnaroundMaxHours: 48,
    includesReferencingReport: false,
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "reference-checking",
    name: "Reference checking",
    description:
      "Cross-checking in-text citations against your reference list for accuracy and consistency.",
    pricingBasis: "per_page",
    standardRateCents: 750, // R7.50 per page
    expressSurchargeCents: 300, // +R3.00 per page
    hasExpressOption: true,
    standardTurnaroundMinDays: 3,
    standardTurnaroundMaxDays: 5,
    expressTurnaroundMinHours: 24,
    expressTurnaroundMaxHours: 48,
    includesReferencingReport: true,
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: "reference-list-editing",
    name: "Reference list editing",
    description:
      "Detailed formatting and verification of every entry in your bibliography or reference list.",
    pricingBasis: "per_reference_page",
    standardRateCents: 5000, // R50.00 per reference page
    expressSurchargeCents: 2500, // +R25.00 per reference page
    hasExpressOption: true,
    standardTurnaroundMinDays: 2,
    standardTurnaroundMaxDays: 4,
    expressTurnaroundMinHours: 24,
    expressTurnaroundMaxHours: 24,
    includesReferencingReport: true,
    sortOrder: 3,
    isActive: true,
  },
  {
    slug: "formatting",
    name: "Formatting",
    description:
      "Document layout, headings, automated table of contents, list of figures/tables, and university style compliance.",
    pricingBasis: "flat_document",
    standardRateCents: 150000, // R1,500.00 flat per document
    expressSurchargeCents: 80000, // +R800.00 flat per document
    hasExpressOption: true,
    standardTurnaroundMinDays: 5,
    standardTurnaroundMaxDays: 7,
    expressTurnaroundMinHours: 48,
    expressTurnaroundMaxHours: 72,
    includesReferencingReport: false,
    sortOrder: 4,
    isActive: true,
  },
  {
    slug: "journal-article-proposal-editing",
    name: "Journal article and proposal editing",
    description:
      "Specialist academic editing for manuscripts, journal submissions, and postgraduate research proposals.",
    pricingBasis: "flat_article",
    standardRateCents: 220000, // R2,200.00 flat per article/proposal
    expressSurchargeCents: 150000, // +R1,500.00 flat per article/proposal
    hasExpressOption: true,
    standardTurnaroundMinDays: 7,
    standardTurnaroundMaxDays: 10,
    expressTurnaroundMinHours: 48,
    expressTurnaroundMaxHours: 72,
    includesReferencingReport: false,
    sortOrder: 5,
    isActive: true,
  },
  {
    slug: "abstract-editing",
    name: "Abstract editing",
    description:
      "Focused refinement of your abstract for clarity, conciseness, word limit, and academic impact.",
    pricingBasis: "flat_abstract",
    standardRateCents: 100000, // R1,000.00 flat per abstract
    expressSurchargeCents: 50000, // +R500.00 flat per abstract (total R1,500 express)
    hasExpressOption: true,
    standardTurnaroundMinDays: 3,
    standardTurnaroundMaxDays: 5,
    expressTurnaroundMinHours: 24,
    expressTurnaroundMaxHours: 48,
    includesReferencingReport: false,
    sortOrder: 6,
    isActive: true,
  },
];

/**
 * Default Conditional Rate Card & Payment Plan Rules
 */
export const DEFAULT_RATE_CARD_RULES: NewRateCardRule[] = [
  {
    name: "Payment Plan Under R3,000 (Max 2 Months)",
    description:
      "If the total service cost is less than R3,000, the client can have a maximum of 2 monthly instalments after the 50% deposit.",
    ruleCategory: "payment_plan",
    conditionField: "total_fee_cents",
    operator: "lt",
    conditionValue: "300000", // R3,000.00 in cents
    effectType: "max_instalment_months",
    effectValue: "2",
    priority: 10,
    isActive: true,
  },
  {
    name: "Payment Plan R3,000 and Above (Max 3 Months)",
    description:
      "If the total service cost is R3,000 or more, the client can have up to a 3-month payment plan after the 50% deposit.",
    ruleCategory: "payment_plan",
    conditionField: "total_fee_cents",
    operator: "gte",
    conditionValue: "300000", // R3,000.00 in cents
    effectType: "max_instalment_months",
    effectValue: "3",
    priority: 20,
    isActive: true,
  },
];

/**
 * 34 Common South African Degree Designators
 */
export const DEFAULT_DEGREE_LEVELS: NewDegreeLevel[] = [
  // Honours
  { designator: "BA Hons", category: "honours", sortOrder: 1 },
  { designator: "BSc Hons", category: "honours", sortOrder: 2 },
  { designator: "BCom Hons", category: "honours", sortOrder: 3 },
  { designator: "BEd Hons", category: "honours", sortOrder: 4 },
  { designator: "BSocSci Hons", category: "honours", sortOrder: 5 },
  { designator: "BAdmin Hons", category: "honours", sortOrder: 6 },
  { designator: "BTech", category: "honours", sortOrder: 7 },
  // Postgraduate Diplomas
  { designator: "PGDip", category: "pgdip", sortOrder: 8 },
  { designator: "PGCE", category: "pgdip", sortOrder: 9 },
  { designator: "AdvDip", category: "pgdip", sortOrder: 10 },
  // Master's
  { designator: "MA", category: "masters", sortOrder: 11 },
  { designator: "MSc", category: "masters", sortOrder: 12 },
  { designator: "MCom", category: "masters", sortOrder: 13 },
  { designator: "MEd", category: "masters", sortOrder: 14 },
  { designator: "MBA", category: "masters", sortOrder: 15 },
  { designator: "MPhil", category: "masters", sortOrder: 16 },
  { designator: "LLM", category: "masters", sortOrder: 17 },
  { designator: "MEng", category: "masters", sortOrder: 18 },
  { designator: "MTech", category: "masters", sortOrder: 19 },
  { designator: "MPH", category: "masters", sortOrder: 20 },
  { designator: "MSocSci", category: "masters", sortOrder: 21 },
  { designator: "MAdmin", category: "masters", sortOrder: 22 },
  { designator: "MCur", category: "masters", sortOrder: 23 },
  { designator: "MMed", category: "masters", sortOrder: 24 },
  { designator: "MTh", category: "masters", sortOrder: 25 },
  { designator: "MPA", category: "masters", sortOrder: 26 },
  // Doctoral
  { designator: "PhD", category: "doctoral", sortOrder: 27 },
  { designator: "DPhil", category: "doctoral", sortOrder: 28 },
  { designator: "DEd", category: "doctoral", sortOrder: 29 },
  { designator: "DBA", category: "doctoral", sortOrder: 30 },
  { designator: "LLD", category: "doctoral", sortOrder: 31 },
  { designator: "DTech", category: "doctoral", sortOrder: 32 },
  { designator: "DLitt", category: "doctoral", sortOrder: 33 },
  { designator: "DCom", category: "doctoral", sortOrder: 34 },
];

/**
 * Editable Policy Wording & Operational Settings
 */
export const DEFAULT_CRM_SETTINGS: NewCrmSetting[] = [
  {
    key: "scope_declaration_text",
    value:
      "I understand that Tweaks edits and improves my own writing. Tweaks does not write, research, rewrite or restructure my content, does not run similarity or plagiarism checks, and does not guarantee a mark, a pass or publication. I confirm the work I am submitting is my own.",
    description:
      "Mandatory scope declaration wording ticked by the client before brief submission.",
  },
  {
    key: "supervisor_disclaimer_text",
    value:
      "Your supervisor has not yet signed off on this document. We are happy to edit it now, but a supervisor who later asks for structural or content changes will undo part of the editing, and a second edit would be charged again. We recommend waiting for sign-off before sending work for editing.",
    description:
      "Disclaimer shown when a client selects 'No' to supervisor sign-off obtained.",
  },
  {
    key: "supervisor_confirmation_text",
    value:
      "I confirm that I am aware this student is submitting this work for professional language editing, and that I approve it going for editing at this stage.",
    description:
      "Wording shown on the tokenised supervisor sign-off confirmation page.",
  },
  {
    key: "institutional_release_text",
    value:
      "We release your edited work once your institution's purchase order reaches us. You do not wait for the invoice to be paid. The invoice stays due on your institution's usual terms, and we deal with your finance office directly.",
    description:
      "Wording displayed on the quote page when Option 3 (Institutional funding) is selected.",
  },
  {
    key: "words_per_page",
    value: "300",
    description: "Standard word count per A4 page conversion factor.",
  },
  {
    key: "deposit_percentage",
    value: "50",
    description: "Deposit percentage required for Option 2 (Payment plan).",
  },
  {
    key: "payment_plan_3_month_threshold_cents",
    value: "300000",
    description:
      "Threshold in ZAR cents (R3,000) above which a 3-month payment plan is offered instead of 2 months.",
  },
  {
    key: "quote_validity_days",
    value: "14",
    description: "Number of days a published quote link remains valid.",
  },
  {
    key: "review_window_hours",
    value: "72",
    description:
      "Hours after the client first opens the delivered package before the review window closes.",
  },
  {
    key: "access_expiry_days",
    value: "30",
    description:
      "Days after project completion before package download links expire.",
  },
];

/**
 * Core South African Higher Education Institutions (Public Universities, UoTs, and Major Private Institutions)
 */
export const DEFAULT_INSTITUTIONS: NewInstitution[] = [
  // Public Universities & Comprehensive Universities (26)
  {
    name: "University of Cape Town (UCT)",
    shortName: "UCT",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["uct.ac.za", "myuct.ac.za"]),
  },
  {
    name: "University of the Witwatersrand (Wits)",
    shortName: "Wits",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["wits.ac.za", "students.wits.ac.za"]),
  },
  {
    name: "Stellenbosch University (SU)",
    shortName: "SU",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["sun.ac.za"]),
  },
  {
    name: "University of Pretoria (UP)",
    shortName: "UP",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["up.ac.za", "tuks.co.za"]),
  },
  {
    name: "University of KwaZulu-Natal (UKZN)",
    shortName: "UKZN",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["ukzn.ac.za", "stu.ukzn.ac.za"]),
  },
  {
    name: "University of Johannesburg (UJ)",
    shortName: "UJ",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["uj.ac.za", "student.uj.ac.za"]),
  },
  {
    name: "University of South Africa (UNISA)",
    shortName: "UNISA",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["unisa.ac.za", "mylife.unisa.ac.za"]),
  },
  {
    name: "North-West University (NWU)",
    shortName: "NWU",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["nwu.ac.za", "mynwu.info"]),
  },
  {
    name: "University of the Western Cape (UWC)",
    shortName: "UWC",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["uwc.ac.za", "myuwc.ac.za"]),
  },
  {
    name: "University of the Free State (UFS)",
    shortName: "UFS",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["ufs.ac.za", "ufs4life.ac.za"]),
  },
  {
    name: "Rhodes University (RU)",
    shortName: "RU",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["ru.ac.za", "campus.ru.ac.za"]),
  },
  {
    name: "Nelson Mandela University (NMU)",
    shortName: "NMU",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["mandela.ac.za"]),
  },
  {
    name: "University of Limpopo (UL)",
    shortName: "UL",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["ul.ac.za", "keyaka.ul.ac.za"]),
  },
  {
    name: "University of Fort Hare (UFH)",
    shortName: "UFH",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["ufh.ac.za"]),
  },
  {
    name: "University of Venda (UNIVEN)",
    shortName: "UNIVEN",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["univen.ac.za", "mvula.univen.ac.za"]),
  },
  {
    name: "University of Zululand (UNIZULU)",
    shortName: "UNIZULU",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["unizulu.ac.za"]),
  },
  {
    name: "Walter Sisulu University (WSU)",
    shortName: "WSU",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["wsu.ac.za"]),
  },
  {
    name: "Sefako Makgatho Health Sciences University (SMU)",
    shortName: "SMU",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["smu.ac.za"]),
  },
  {
    name: "Sol Plaatje University (SPU)",
    shortName: "SPU",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["spu.ac.za"]),
  },
  {
    name: "University of Mpumalanga (UMP)",
    shortName: "UMP",
    institutionType: "comprehensive_university",
    emailDomains: JSON.stringify(["ump.ac.za"]),
  },
  // Universities of Technology (6)
  {
    name: "Tshwane University of Technology (TUT)",
    shortName: "TUT",
    institutionType: "university_of_technology",
    emailDomains: JSON.stringify(["tut.ac.za", "tut4life.ac.za"]),
  },
  {
    name: "Cape Peninsula University of Technology (CPUT)",
    shortName: "CPUT",
    institutionType: "university_of_technology",
    emailDomains: JSON.stringify(["cput.ac.za", "mycput.ac.za"]),
  },
  {
    name: "Durban University of Technology (DUT)",
    shortName: "DUT",
    institutionType: "university_of_technology",
    emailDomains: JSON.stringify(["dut.ac.za", "dut4life.ac.za"]),
  },
  {
    name: "Central University of Technology (CUT)",
    shortName: "CUT",
    institutionType: "university_of_technology",
    emailDomains: JSON.stringify(["cut.ac.za", "stud.cut.ac.za"]),
  },
  {
    name: "Vaal University of Technology (VUT)",
    shortName: "VUT",
    institutionType: "university_of_technology",
    emailDomains: JSON.stringify(["vut.ac.za", "edu.vut.ac.za"]),
  },
  {
    name: "Mangosuthu University of Technology (MUT)",
    shortName: "MUT",
    institutionType: "university_of_technology",
    emailDomains: JSON.stringify(["mut.ac.za"]),
  },
  // Major Business Schools & Private Higher Education Institutions
  {
    name: "Gordon Institute of Business Science (GIBS)",
    shortName: "GIBS",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["gibs.co.za"]),
  },
  {
    name: "UCT Graduate School of Business (UCT GSB)",
    shortName: "UCT GSB",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["gsb.uct.ac.za"]),
  },
  {
    name: "Wits Business School (WBS)",
    shortName: "WBS",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["wits.ac.za"]),
  },
  {
    name: "Stellenbosch Business School (SBS)",
    shortName: "SBS",
    institutionType: "public_university",
    emailDomains: JSON.stringify(["usb.ac.za", "sun.ac.za"]),
  },
  {
    name: "Henley Business School Africa",
    shortName: "Henley",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["henleysa.ac.za"]),
  },
  {
    name: "MANCOSA",
    shortName: "MANCOSA",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["mancosa.co.za"]),
  },
  {
    name: "Regent Business School",
    shortName: "Regent",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["regent.ac.za"]),
  },
  {
    name: "Milpark Education",
    shortName: "Milpark",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["milpark.ac.za"]),
  },
  {
    name: "IIE Varsity College",
    shortName: "Varsity College",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["varsitycollege.co.za", "iie.ac.za"]),
  },
  {
    name: "IIE MSA (Monash South Africa)",
    shortName: "IIE MSA",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["iiemsa.co.za", "iie.ac.za"]),
  },
  {
    name: "IIE Vega School",
    shortName: "Vega",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["vegaschool.com", "iie.ac.za"]),
  },
  {
    name: "IIE Rosebank College",
    shortName: "Rosebank College",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["rosebankcollege.co.za"]),
  },
  {
    name: "STADIO Higher Education",
    shortName: "STADIO",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["stadio.ac.za"]),
  },
  {
    name: "Eduvos",
    shortName: "Eduvos",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["eduvos.com"]),
  },
  {
    name: "Richfield Graduate Institute of Technology",
    shortName: "Richfield",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["richfield.ac.za"]),
  },
  {
    name: "Da Vinci Institute",
    shortName: "Da Vinci",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["davinci.ac.za"]),
  },
  {
    name: "Boston City Campus",
    shortName: "Boston",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["boston.co.za"]),
  },
  {
    name: "Cornerstone Institute",
    shortName: "Cornerstone",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["cornerstone.ac.za"]),
  },
  {
    name: "Helderberg College of Higher Education",
    shortName: "Helderberg",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["hche.ac.za"]),
  },
  {
    name: "AFDA",
    shortName: "AFDA",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["afda.co.za"]),
  },
  {
    name: "SACAP (South African College of Applied Psychology)",
    shortName: "SACAP",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["sacap.edu.za"]),
  },
  {
    name: "TSIBA Business School",
    shortName: "TSIBA",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["tsiba.ac.za"]),
  },
  {
    name: "South African Theological Seminary (SATS)",
    shortName: "SATS",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["sats.ac.za"]),
  },
  {
    name: "St Augustine College of South Africa",
    shortName: "St Augustine",
    institutionType: "private_institution",
    emailDomains: JSON.stringify(["staugustine.ac.za"]),
  },
];

