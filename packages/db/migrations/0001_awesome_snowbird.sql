ALTER TABLE `pending_registrations` ADD `email_verified_at` integer;--> statement-breakpoint
ALTER TABLE `pending_registrations` ADD `verification_token_hash` text;