CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`surname` text NOT NULL,
	`email` text NOT NULL,
	`whatsapp` text NOT NULL,
	`institution_id` text,
	`institution_other` text,
	`department` text,
	`billing_contact_name` text,
	`billing_contact_email` text,
	`referral_source` text,
	`quickbooks_customer_id` text,
	`paystack_customer_code` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_email_unique` ON `clients` (`email`);--> statement-breakpoint
CREATE INDEX `idx_clients_email` ON `clients` (`email`);--> statement-breakpoint
CREATE TABLE `crm_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `degree_levels` (
	`id` text PRIMARY KEY NOT NULL,
	`designator` text NOT NULL,
	`category` text DEFAULT 'masters' NOT NULL,
	`status` text DEFAULT 'approved' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `degree_levels_designator_unique` ON `degree_levels` (`designator`);--> statement-breakpoint
CREATE TABLE `degree_programmes` (
	`id` text PRIMARY KEY NOT NULL,
	`institution_id` text,
	`degree_level` text,
	`name` text NOT NULL,
	`usage_count` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'approved' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_degree_programmes_inst` ON `degree_programmes` (`institution_id`);--> statement-breakpoint
CREATE INDEX `idx_degree_programmes_name` ON `degree_programmes` (`name`);--> statement-breakpoint
CREATE TABLE `editors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`whatsapp` text,
	`role` text DEFAULT 'editor' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `editors_email_unique` ON `editors` (`email`);--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`institution_type` text DEFAULT 'public_university' NOT NULL,
	`email_domains` text,
	`default_payment_terms_days` integer DEFAULT 30 NOT NULL,
	`status` text DEFAULT 'approved' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `institutions_name_unique` ON `institutions` (`name`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`quote_id` text NOT NULL,
	`client_id` text NOT NULL,
	`payment_type` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`method` text DEFAULT 'paystack' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paystack_reference` text,
	`paystack_transaction_id` text,
	`paystack_access_code` text,
	`paystack_channel` text,
	`paystack_fees_cents` integer,
	`quickbooks_payment_id` text,
	`receipt_number` text,
	`receipt_pdf_url` text,
	`paid_at` text,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_paystack_reference_unique` ON `payments` (`paystack_reference`);--> statement-breakpoint
CREATE INDEX `idx_payments_quote` ON `payments` (`quote_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_project` ON `payments` (`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`access_token` text NOT NULL,
	`is_duplicate_flag` integer DEFAULT false NOT NULL,
	`duplicate_of_project_id` text,
	`duplicate_resolved` integer DEFAULT false NOT NULL,
	`institution_id` text,
	`institution_other` text,
	`degree_level` text,
	`degree_level_other` text,
	`degree_programme` text NOT NULL,
	`research_title` text NOT NULL,
	`referral_source` text NOT NULL,
	`document_type` text NOT NULL,
	`document_type_other` text,
	`whole_or_part` text NOT NULL,
	`which_part` text,
	`word_count` integer NOT NULL,
	`page_count` integer NOT NULL,
	`reference_page_count` integer DEFAULT 0 NOT NULL,
	`referencing_style` text NOT NULL,
	`referencing_style_other` text,
	`delivery_speed` text NOT NULL,
	`expected_send_date` text NOT NULL,
	`requested_return_date` text NOT NULL,
	`main_goal` text NOT NULL,
	`concerns` text,
	`tracked_changes` text NOT NULL,
	`tracked_changes_other` text,
	`certificate_requested` integer DEFAULT true NOT NULL,
	`additional_info` text,
	`uploaded_file_name` text,
	`uploaded_file_url` text,
	`payment_option` text DEFAULT 'full_payment' NOT NULL,
	`department` text,
	`billing_contact_name` text,
	`billing_contact_email` text,
	`scope_declaration_accepted` integer NOT NULL,
	`scope_declared_at` text NOT NULL,
	`supervisor_sign_off` text NOT NULL,
	`supervisor_disclaimer_ack` integer DEFAULT false NOT NULL,
	`supervisor_name` text,
	`supervisor_email` text,
	`supervisor_sign_off_token` text,
	`supervisor_sign_off_requested_at` text,
	`supervisor_sign_off_received_at` text,
	`stage` text DEFAULT 'enquiry' NOT NULL,
	`assigned_editor_id` text,
	`release_work` integer DEFAULT false NOT NULL,
	`work_ready` integer DEFAULT false NOT NULL,
	`work_ready_at` text,
	`drive_folder_id` text,
	`package_link` text,
	`edited_doc_url` text,
	`editing_report_url` text,
	`referencing_report_url` text,
	`walkthrough_video_url` text,
	`client_opened_at` text,
	`review_closes_at` text,
	`access_expires_at` text,
	`completed_at` text,
	`internal_notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assigned_editor_id`) REFERENCES `editors`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_access_token_unique` ON `projects` (`access_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_supervisor_sign_off_token_unique` ON `projects` (`supervisor_sign_off_token`);--> statement-breakpoint
CREATE INDEX `idx_projects_client` ON `projects` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_stage` ON `projects` (`stage`);--> statement-breakpoint
CREATE INDEX `idx_projects_created` ON `projects` (`created_at`);--> statement-breakpoint
CREATE TABLE `quickbooks_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`realm_id` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`access_token_expires_at` text NOT NULL,
	`refresh_token_expires_at` text NOT NULL,
	`environment` text DEFAULT 'sandbox' NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quickbooks_tokens_realm_id_unique` ON `quickbooks_tokens` (`realm_id`);--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text,
	`project_id` text NOT NULL,
	`service_id` text NOT NULL,
	`service_name` text NOT NULL,
	`pricing_basis` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_standard_rate_cents` integer NOT NULL,
	`unit_express_surcharge_cents` integer DEFAULT 0 NOT NULL,
	`applied_adjustment_cents` integer DEFAULT 0 NOT NULL,
	`line_total_cents` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_number` text NOT NULL,
	`project_id` text NOT NULL,
	`client_id` text NOT NULL,
	`token` text NOT NULL,
	`delivery_speed` text NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`express_surcharge_cents` integer DEFAULT 0 NOT NULL,
	`discount_cents` integer DEFAULT 0 NOT NULL,
	`total_fee_cents` integer NOT NULL,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`payment_option` text DEFAULT 'full_payment' NOT NULL,
	`max_instalment_months` integer DEFAULT 2 NOT NULL,
	`selected_instalment_months` integer DEFAULT 2 NOT NULL,
	`deposit_percentage` integer DEFAULT 100 NOT NULL,
	`deposit_required_cents` integer NOT NULL,
	`paid_to_date_cents` integer DEFAULT 0 NOT NULL,
	`balance_cents` integer NOT NULL,
	`instalment_1_due_date` text,
	`instalment_1_amount_cents` integer,
	`instalment_2_due_date` text,
	`instalment_2_amount_cents` integer,
	`instalment_3_due_date` text,
	`instalment_3_amount_cents` integer,
	`po_number` text,
	`po_date` text,
	`payment_terms_days` integer DEFAULT 30 NOT NULL,
	`invoice_due_date` text,
	`institutional_status` text DEFAULT 'not_applicable' NOT NULL,
	`outcome` text DEFAULT 'draft' NOT NULL,
	`why_lost` text,
	`why_lost_notes` text,
	`sent_at` text,
	`valid_until` text,
	`accepted_at` text,
	`quickbooks_estimate_id` text,
	`quickbooks_invoice_id` text,
	`quickbooks_sync_status` text DEFAULT 'not_synced' NOT NULL,
	`quickbooks_sync_error` text,
	`quickbooks_last_synced_at` text,
	`quote_pdf_url` text,
	`invoice_pdf_url` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_quote_number_unique` ON `quotes` (`quote_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_token_unique` ON `quotes` (`token`);--> statement-breakpoint
CREATE INDEX `idx_quotes_project` ON `quotes` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_quotes_outcome` ON `quotes` (`outcome`);--> statement-breakpoint
CREATE TABLE `rate_card_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text,
	`name` text NOT NULL,
	`description` text,
	`rule_category` text NOT NULL,
	`condition_field` text NOT NULL,
	`operator` text NOT NULL,
	`condition_value` text NOT NULL,
	`effect_type` text NOT NULL,
	`effect_value` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reminder_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`quote_id` text,
	`trigger_type` text NOT NULL,
	`recipient_role` text NOT NULL,
	`recipient_address` text NOT NULL,
	`channel` text NOT NULL,
	`sent_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_reminder_logs_project` ON `reminder_logs` (`project_id`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pricing_basis` text NOT NULL,
	`standard_rate_cents` integer NOT NULL,
	`express_surcharge_cents` integer DEFAULT 0 NOT NULL,
	`has_express_option` integer DEFAULT true NOT NULL,
	`standard_turnaround_min_days` integer NOT NULL,
	`standard_turnaround_max_days` integer NOT NULL,
	`express_turnaround_min_hours` integer NOT NULL,
	`express_turnaround_max_hours` integer NOT NULL,
	`includes_referencing_report` integer DEFAULT false NOT NULL,
	`quickbooks_item_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `services_name_unique` ON `services` (`name`);--> statement-breakpoint
ALTER TABLE `certificates` ADD `project_id` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `degree_level` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `degree_programme` text;