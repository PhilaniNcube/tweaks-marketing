CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`research_title` text,
	`researcher_name` text,
	`university` text,
	`completion_date` text,
	`recipient_email` text,
	`note` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_token_unique` ON `certificates` (`token`);