import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// 1. EXISTING TABLES (Reviews & Certificates - Extended for CRM)
// ============================================================================

export const reviews = sqliteTable("reviews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  rating: integer("rating").notNull(),
  feedback: text("feedback").notNull(),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  university: text("university"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export const certificates = sqliteTable("certificates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `CERT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`),
  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id"),
  status: text("status", { enum: ["pending", "completed"] })
    .default("pending")
    .notNull(),
  researchTitle: text("research_title"),
  researcherName: text("researcher_name"),
  university: text("university"),
  degreeLevel: text("degree_level"),
  degreeProgramme: text("degree_programme"),
  completionDate: text("completion_date"),
  recipientEmail: text("recipient_email"),
  note: text("note"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  completedAt: text("completed_at"),
});

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

// ============================================================================
// 2. SERVICE CATALOG & CONDITIONAL RATE CARD
// ============================================================================

export const pricingBasisValues = [
  "per_page",
  "per_reference_page",
  "flat_document",
  "flat_article",
  "flat_abstract",
] as const;
export type PricingBasis = (typeof pricingBasisValues)[number];

export const services = sqliteTable("services", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().unique(),
  description: text("description"),
  pricingBasis: text("pricing_basis", { enum: pricingBasisValues }).notNull(),
  /** Standard rate in ZAR cents (e.g. R45.00 = 4500, R7.50 = 750, R1,500 = 150000) */
  standardRateCents: integer("standard_rate_cents").notNull(),
  /** Express surcharge in ZAR cents (e.g. R15.00 = 1500, R3.00 = 300, R800 = 80000) */
  expressSurchargeCents: integer("express_surcharge_cents").default(0).notNull(),
  hasExpressOption: integer("has_express_option", { mode: "boolean" })
    .default(true)
    .notNull(),
  standardTurnaroundMinDays: integer("standard_turnaround_min_days").notNull(),
  standardTurnaroundMaxDays: integer("standard_turnaround_max_days").notNull(),
  expressTurnaroundMinHours: integer("express_turnaround_min_hours").notNull(),
  expressTurnaroundMaxHours: integer("express_turnaround_max_hours").notNull(),
  /** Whether purchasing this service includes a Referencing Report in the handover package */
  includesReferencingReport: integer("includes_referencing_report", {
    mode: "boolean",
  })
    .default(false)
    .notNull(),
  /** QuickBooks Online Product/Service Item ID for automated Estimate/Invoice generation */
  quickbooksItemId: text("quickbooks_item_id"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export const rateCardRules = sqliteTable("rate_card_rules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** Null means the rule applies at the quote/order level (e.g. payment plan rules or bundle discounts) */
  serviceId: text("service_id").references(() => services.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  ruleCategory: text("rule_category", {
    enum: ["payment_plan", "pricing", "discount"],
  }).notNull(),
  conditionField: text("condition_field", {
    enum: [
      "total_fee_cents",
      "page_count",
      "reference_page_count",
      "word_count",
      "degree_level",
      "service_count",
      "delivery_speed",
    ],
  }).notNull(),
  operator: text("operator", {
    enum: ["lt", "lte", "gt", "gte", "eq", "in", "between"],
  }).notNull(),
  /** Value to compare against (e.g. "300000" for R3,000 in cents, or JSON array) */
  conditionValue: text("condition_value").notNull(),
  effectType: text("effect_type", {
    enum: [
      "max_instalment_months",
      "rate_multiplier",
      "flat_adjustment_cents",
      "override_unit_rate_cents",
      "percentage_discount",
    ],
  }).notNull(),
  /** Effect value (e.g. "2" for max 2 months when < R3,000; "3" for max 3 months when >= R3,000) */
  effectValue: text("effect_value").notNull(),
  priority: integer("priority").default(0).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type RateCardRule = typeof rateCardRules.$inferSelect;
export type NewRateCardRule = typeof rateCardRules.$inferInsert;

// ============================================================================
// 3. LOOKUP & AUTOCOMPLETE TABLES (Institutions, Degrees, Programmes, Settings)
// ============================================================================

export const reviewQueueStatusValues = [
  "approved",
  "pending_review",
  "rejected",
] as const;

export const institutions = sqliteTable("institutions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  shortName: text("short_name"),
  institutionType: text("institution_type", {
    enum: [
      "public_university",
      "university_of_technology",
      "comprehensive_university",
      "private_institution",
      "other",
    ],
  })
    .default("public_university")
    .notNull(),
  /** JSON array of institutional email domains (e.g. '["uct.ac.za", "myuct.ac.za"]') */
  emailDomains: text("email_domains"),
  /** Default payment terms in days for Option 3 Institutional POs (30 days by default) */
  defaultPaymentTermsDays: integer("default_payment_terms_days")
    .default(30)
    .notNull(),
  status: text("status", { enum: reviewQueueStatusValues })
    .default("approved")
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type Institution = typeof institutions.$inferSelect;
export type NewInstitution = typeof institutions.$inferInsert;

export const degreeLevels = sqliteTable("degree_levels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** Exact designator printed on certificate (e.g., MSc, MCom, MEd, PhD) */
  designator: text("designator").notNull().unique(),
  category: text("category", {
    enum: ["honours", "pgdip", "masters", "doctoral", "other"],
  })
    .default("masters")
    .notNull(),
  status: text("status", { enum: reviewQueueStatusValues })
    .default("approved")
    .notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type DegreeLevel = typeof degreeLevels.$inferSelect;
export type NewDegreeLevel = typeof degreeLevels.$inferInsert;

export const degreeProgrammes = sqliteTable(
  "degree_programmes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    institutionId: text("institution_id").references(() => institutions.id, {
      onDelete: "set null",
    }),
    degreeLevel: text("degree_level"),
    /** Programme title (e.g. "Chemistry", "Educational Psychology", "Sociology") */
    name: text("name").notNull(),
    /** Incremented each time a client submits this programme */
    usageCount: integer("usage_count").default(1).notNull(),
    status: text("status", { enum: reviewQueueStatusValues })
      .default("approved")
      .notNull(),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    index("idx_degree_programmes_inst").on(table.institutionId),
    index("idx_degree_programmes_name").on(table.name),
  ]
);

export type DegreeProgramme = typeof degreeProgrammes.$inferSelect;
export type NewDegreeProgramme = typeof degreeProgrammes.$inferInsert;

export const editors = sqliteTable("editors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  whatsapp: text("whatsapp"),
  role: text("role", { enum: ["admin", "editor"] })
    .default("editor")
    .notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type Editor = typeof editors.$inferSelect;
export type NewEditor = typeof editors.$inferInsert;

export const crmSettings = sqliteTable("crm_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type CrmSetting = typeof crmSettings.$inferSelect;
export type NewCrmSetting = typeof crmSettings.$inferInsert;

// ============================================================================
// 4. CLIENTS & PROJECTS (BRIEFS / TRACKER)
// ============================================================================

export const clients = sqliteTable(
  "clients",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    firstName: text("first_name").notNull(),
    surname: text("surname").notNull(),
    email: text("email").notNull().unique(),
    whatsapp: text("whatsapp").notNull(),
    institutionId: text("institution_id").references(() => institutions.id, {
      onDelete: "set null",
    }),
    institutionOther: text("institution_other"),
    department: text("department"),
    billingContactName: text("billing_contact_name"),
    billingContactEmail: text("billing_contact_email"),
    referralSource: text("referral_source"),
    quickbooksCustomerId: text("quickbooks_customer_id"),
    paystackCustomerCode: text("paystack_customer_code"),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [index("idx_clients_email").on(table.email)]
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export const projectStageValues = [
  "enquiry",
  "quote_sent",
  "accepted",
  "in_progress",
  "work_ready",
  "review",
  "complete",
  "closed",
  "lost",
] as const;
export type ProjectStage = (typeof projectStageValues)[number];

export const paymentOptionValues = [
  "full_payment",
  "payment_plan",
  "institutional_funding",
] as const;
export type PaymentOption = (typeof paymentOptionValues)[number];

export const projects = sqliteTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    /** Private unguessable token for the client's quote, status, and delivery page */
    accessToken: text("access_token")
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),

    // --- Duplicate Flagging (24h same email + document type check) ---
    isDuplicateFlag: integer("is_duplicate_flag", { mode: "boolean" })
      .default(false)
      .notNull(),
    duplicateOfProjectId: text("duplicate_of_project_id"),
    duplicateResolved: integer("duplicate_resolved", { mode: "boolean" })
      .default(false)
      .notNull(),

    // --- Academic Context ---
    institutionId: text("institution_id").references(() => institutions.id, {
      onDelete: "set null",
    }),
    institutionOther: text("institution_other"),
    degreeLevel: text("degree_level"),
    degreeLevelOther: text("degree_level_other"),
    degreeProgramme: text("degree_programme").notNull(),
    researchTitle: text("research_title").notNull(),
    referralSource: text("referral_source").notNull(),

    // --- Document & Scope Details ---
    documentType: text("document_type").notNull(),
    documentTypeOther: text("document_type_other"),
    wholeOrPart: text("whole_or_part", { enum: ["whole", "part"] }).notNull(),
    whichPart: text("which_part"),
    wordCount: integer("word_count").notNull(),
    /** Auto-calculated from wordCount at 300 words/page, editable by client/admin */
    pageCount: integer("page_count").notNull(),
    /** 0 to 500 pages, billing unit for Reference List Editing */
    referencePageCount: integer("reference_page_count").default(0).notNull(),
    referencingStyle: text("referencing_style").notNull(),
    referencingStyleOther: text("referencing_style_other"),
    deliverySpeed: text("delivery_speed", {
      enum: ["standard", "express"],
    }).notNull(),
    /** "When will you send us the document" */
    expectedSendDate: text("expected_send_date").notNull(),
    /** "When do you need it back" - validated against expectedSendDate + service turnaround */
    requestedReturnDate: text("requested_return_date").notNull(),
    mainGoal: text("main_goal").notNull(),
    concerns: text("concerns"),
    trackedChanges: text("tracked_changes").notNull(),
    trackedChangesOther: text("tracked_changes_other"),
    certificateRequested: integer("certificate_requested", { mode: "boolean" })
      .default(true)
      .notNull(),
    additionalInfo: text("additional_info"),
    uploadedFileName: text("uploaded_file_name"),
    uploadedFileUrl: text("uploaded_file_url"),

    // --- Funding & Institutional Details ---
    paymentOption: text("payment_option", {
      enum: paymentOptionValues,
    })
      .default("full_payment")
      .notNull(),
    department: text("department"),
    billingContactName: text("billing_contact_name"),
    billingContactEmail: text("billing_contact_email"),

    // --- Declarations & Supervisor Sign-Off ---
    scopeDeclarationAccepted: integer("scope_declaration_accepted", {
      mode: "boolean",
    }).notNull(),
    scopeDeclaredAt: text("scope_declared_at").notNull(),
    supervisorSignOff: text("supervisor_sign_off", {
      enum: ["yes", "no"],
    }).notNull(),
    supervisorDisclaimerAck: integer("supervisor_disclaimer_ack", {
      mode: "boolean",
    })
      .default(false)
      .notNull(),
    supervisorName: text("supervisor_name"),
    supervisorEmail: text("supervisor_email"),
    supervisorSignOffToken: text("supervisor_sign_off_token").unique(),
    supervisorSignOffRequestedAt: text("supervisor_sign_off_requested_at"),
    /** Non-null timestamp proves supervisor confirmed via token link vs student self-declaration */
    supervisorSignOffReceivedAt: text("supervisor_sign_off_received_at"),

    // --- CRM Workflow, Delivery & Handover Gate ---
    stage: text("stage", { enum: projectStageValues })
      .default("enquiry")
      .notNull(),
    assignedEditorId: text("assigned_editor_id").references(() => editors.id, {
      onDelete: "set null",
    }),
    /** Gate: true only when balance == 0 (Options 1 & 2) OR when PO number is recorded (Option 3) */
    releaseWork: integer("release_work", { mode: "boolean" })
      .default(false)
      .notNull(),
    /** Explicit editor mark that triggers client notification and publishes package */
    workReady: integer("work_ready", { mode: "boolean" })
      .default(false)
      .notNull(),
    workReadyAt: text("work_ready_at"),
    driveFolderId: text("drive_folder_id"),
    packageLink: text("package_link"),
    editedDocUrl: text("edited_doc_url"),
    editingReportUrl: text("editing_report_url"),
    referencingReportUrl: text("referencing_report_url"),
    walkthroughVideoUrl: text("walkthrough_video_url"),
    /** Stamped when client first opens the delivered package; starts 72-hour review clock */
    clientOpenedAt: text("client_opened_at"),
    reviewClosesAt: text("review_closes_at"),
    accessExpiresAt: text("access_expires_at"),
    completedAt: text("completed_at"),
    internalNotes: text("internal_notes"),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    index("idx_projects_client").on(table.clientId),
    index("idx_projects_stage").on(table.stage),
    index("idx_projects_created").on(table.createdAt),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// ============================================================================
// 5. QUOTES, LINE ITEMS & INSTITUTIONAL PO TRACKING
// ============================================================================

export const quoteOutcomeValues = [
  "draft",
  "awaiting_reply",
  "accepted",
  "declined",
  "expired",
] as const;
export type QuoteOutcome = (typeof quoteOutcomeValues)[number];

export const whyLostValues = [
  "price",
  "turnaround",
  "went_elsewhere",
  "no_reply",
  "scope_changed",
  "other",
] as const;
export type WhyLost = (typeof whyLostValues)[number];

export const quotes = sqliteTable(
  "quotes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** Used as the payment reference on Paystack and EFT bank transfers */
    quoteNumber: text("quote_number").notNull().unique(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    /** Unguessable token for the interactive quote page */
    token: text("token")
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    deliverySpeed: text("delivery_speed", {
      enum: ["standard", "express"],
    }).notNull(),

    // --- Totals (in ZAR cents) ---
    subtotalCents: integer("subtotal_cents").notNull(),
    expressSurchargeCents: integer("express_surcharge_cents")
      .default(0)
      .notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    totalFeeCents: integer("total_fee_cents").notNull(),
    currency: text("currency").default("ZAR").notNull(),

    // --- Payment Option & Conditional Payment Plan (< R3000 = max 2 months; >= R3000 = max 3 months) ---
    paymentOption: text("payment_option", {
      enum: paymentOptionValues,
    })
      .default("full_payment")
      .notNull(),
    /** Determined by rate card rule: 2 months if totalFeeCents < 300000 (R3,000), 3 months if >= 300000 */
    maxInstalmentMonths: integer("max_instalment_months").default(2).notNull(),
    selectedInstalmentMonths: integer("selected_instalment_months")
      .default(2)
      .notNull(),
    /** 50% on payment_plan, 100% on full_payment, 0% on institutional_funding */
    depositPercentage: integer("deposit_percentage").default(100).notNull(),
    depositRequiredCents: integer("deposit_required_cents").notNull(),
    paidToDateCents: integer("paid_to_date_cents").default(0).notNull(),
    balanceCents: integer("balance_cents").notNull(),

    // --- Instalment Schedule (calculated once 50% deposit lands) ---
    instalment1DueDate: text("instalment_1_due_date"),
    instalment1AmountCents: integer("instalment_1_amount_cents"),
    instalment2DueDate: text("instalment_2_due_date"),
    instalment2AmountCents: integer("instalment_2_amount_cents"),
    instalment3DueDate: text("instalment_3_due_date"),
    instalment3AmountCents: integer("instalment_3_amount_cents"),

    // --- Option 3: Institutional Funding / Purchase Order ---
    poNumber: text("po_number"),
    poDate: text("po_date"),
    paymentTermsDays: integer("payment_terms_days").default(30).notNull(),
    invoiceDueDate: text("invoice_due_date"),
    institutionalStatus: text("institutional_status", {
      enum: [
        "not_applicable",
        "awaiting_po",
        "awaiting_institution",
        "paid",
        "overdue",
      ],
    })
      .default("not_applicable")
      .notNull(),

    // --- Quote Tracking & Outcome ---
    outcome: text("outcome", { enum: quoteOutcomeValues })
      .default("draft")
      .notNull(),
    whyLost: text("why_lost", { enum: whyLostValues }),
    whyLostNotes: text("why_lost_notes"),
    sentAt: text("sent_at"),
    validUntil: text("valid_until"),
    acceptedAt: text("accepted_at"),

    // --- QuickBooks Online Integration ---
    quickbooksEstimateId: text("quickbooks_estimate_id"),
    quickbooksInvoiceId: text("quickbooks_invoice_id"),
    quickbooksSyncStatus: text("quickbooks_sync_status", {
      enum: ["not_synced", "pending", "synced", "error"],
    })
      .default("not_synced")
      .notNull(),
    quickbooksSyncError: text("quickbooks_sync_error"),
    quickbooksLastSyncedAt: text("quickbooks_last_synced_at"),
    quotePdfUrl: text("quote_pdf_url"),
    invoicePdfUrl: text("invoice_pdf_url"),

    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    index("idx_quotes_project").on(table.projectId),
    index("idx_quotes_outcome").on(table.outcome),
  ]
);

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

export const quoteItems = sqliteTable("quote_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quoteId: text("quote_id").references(() => quotes.id, {
    onDelete: "cascade",
  }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),
  /** Snapshot of service name at quote time */
  serviceName: text("service_name").notNull(),
  pricingBasis: text("pricing_basis", { enum: pricingBasisValues }).notNull(),
  /** Page count, reference page count, or 1 for flat-rate services */
  quantity: integer("quantity").notNull(),
  unitStandardRateCents: integer("unit_standard_rate_cents").notNull(),
  unitExpressSurchargeCents: integer("unit_express_surcharge_cents")
    .default(0)
    .notNull(),
  appliedAdjustmentCents: integer("applied_adjustment_cents")
    .default(0)
    .notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;

// ============================================================================
// 6. PAYMENTS (Paystack Gateway & EFT Reconciliation)
// ============================================================================

export const payments = sqliteTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    quoteId: text("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    paymentType: text("payment_type", {
      enum: [
        "deposit",
        "instalment_1",
        "instalment_2",
        "instalment_3",
        "full_payment",
        "balance",
      ],
    }).notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("ZAR").notNull(),
    method: text("method", {
      enum: ["paystack", "eft", "cash", "other"],
    })
      .default("paystack")
      .notNull(),
    status: text("status", {
      enum: ["pending", "success", "failed", "refunded"],
    })
      .default("pending")
      .notNull(),
    /** Unique Paystack reference (derived from quoteNumber) */
    paystackReference: text("paystack_reference").unique(),
    paystackTransactionId: text("paystack_transaction_id"),
    paystackAccessCode: text("paystack_access_code"),
    paystackChannel: text("paystack_channel"),
    paystackFeesCents: integer("paystack_fees_cents"),
    quickbooksPaymentId: text("quickbooks_payment_id"),
    receiptNumber: text("receipt_number"),
    receiptPdfUrl: text("receipt_pdf_url"),
    paidAt: text("paid_at"),
    notes: text("notes"),
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    index("idx_payments_quote").on(table.quoteId),
    index("idx_payments_project").on(table.projectId),
  ]
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// ============================================================================
// 7. QUICKBOOKS OAUTH TOKENS & AUTOMATED REMINDER LOGS
// ============================================================================

export const quickbooksTokens = sqliteTable("quickbooks_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  realmId: text("realm_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  accessTokenExpiresAt: text("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: text("refresh_token_expires_at").notNull(),
  environment: text("environment", { enum: ["sandbox", "production"] })
    .default("sandbox")
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type QuickbooksToken = typeof quickbooksTokens.$inferSelect;
export type NewQuickbooksToken = typeof quickbooksTokens.$inferInsert;

export const reminderLogs = sqliteTable(
  "reminder_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    quoteId: text("quote_id").references(() => quotes.id, {
      onDelete: "set null",
    }),
    triggerType: text("trigger_type", {
      enum: [
        "quote_nudge_1",
        "quote_nudge_2",
        "quote_expired",
        "supervisor_signoff_chase",
        "editor_due_soon",
        "editor_overdue",
        "work_ready_balance_due",
        "review_window_closing",
        "access_expiring_soon",
        "institutional_invoice_overdue",
      ],
    }).notNull(),
    recipientRole: text("recipient_role", {
      enum: ["client", "editor", "supervisor", "admin", "billing_contact"],
    }).notNull(),
    recipientAddress: text("recipient_address").notNull(),
    channel: text("channel", { enum: ["email", "whatsapp"] }).notNull(),
    sentAt: text("sent_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [index("idx_reminder_logs_project").on(table.projectId)]
);

export type ReminderLog = typeof reminderLogs.$inferSelect;
export type NewReminderLog = typeof reminderLogs.$inferInsert;

// ============================================================================
// 8. DRIZZLE RELATIONS
// ============================================================================

export const servicesRelations = relations(services, ({ many }) => ({
  rateCardRules: many(rateCardRules),
  quoteItems: many(quoteItems),
}));

export const rateCardRulesRelations = relations(rateCardRules, ({ one }) => ({
  service: one(services, {
    fields: [rateCardRules.serviceId],
    references: [services.id],
  }),
}));

export const institutionsRelations = relations(institutions, ({ many }) => ({
  clients: many(clients),
  projects: many(projects),
  degreeProgrammes: many(degreeProgrammes),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [clients.institutionId],
    references: [institutions.id],
  }),
  projects: many(projects),
  quotes: many(quotes),
  payments: many(payments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  institution: one(institutions, {
    fields: [projects.institutionId],
    references: [institutions.id],
  }),
  assignedEditor: one(editors, {
    fields: [projects.assignedEditorId],
    references: [editors.id],
  }),
  quotes: many(quotes),
  quoteItems: many(quoteItems),
  payments: many(payments),
  reminderLogs: many(reminderLogs),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  project: one(projects, {
    fields: [quotes.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
  items: many(quoteItems),
  payments: many(payments),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
  project: one(projects, {
    fields: [quoteItems.projectId],
    references: [projects.id],
  }),
  service: one(services, {
    fields: [quoteItems.serviceId],
    references: [services.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
  quote: one(quotes, {
    fields: [payments.quoteId],
    references: [quotes.id],
  }),
  client: one(clients, {
    fields: [payments.clientId],
    references: [clients.id],
  }),
}));
