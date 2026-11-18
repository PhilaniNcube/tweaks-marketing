ALTER TABLE `projects` ADD `archived_at` text;--> statement-breakpoint
ALTER TABLE `services` ADD `service_group` text DEFAULT 'thesis' NOT NULL;