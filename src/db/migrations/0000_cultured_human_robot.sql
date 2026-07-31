CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`rating` integer NOT NULL,
	`feedback` text NOT NULL,
	`author_name` text,
	`author_email` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
