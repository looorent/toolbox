CREATE TABLE `scim_group` (
	`id` text PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`external_id` text,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `scim_server`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scim_group_server_id_idx` ON `scim_group` (`server_id`);--> statement-breakpoint
CREATE INDEX `scim_group_server_id_display_name_idx` ON `scim_group` (`server_id`,`display_name`);--> statement-breakpoint
CREATE TABLE `scim_group_member` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `scim_group`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `scim_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scim_group_member_user_id_idx` ON `scim_group_member` (`user_id`);--> statement-breakpoint
CREATE TABLE `scim_server` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bearer_token` text,
	`created_at` text NOT NULL,
	`last_used_at` text
);
--> statement-breakpoint
CREATE TABLE `scim_user` (
	`id` text PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`external_id` text,
	`user_name` text NOT NULL,
	`display_name` text,
	`given_name` text,
	`family_name` text,
	`middle_name` text,
	`formatted_name` text,
	`title` text,
	`preferred_language` text,
	`locale` text,
	`timezone` text,
	`active` integer DEFAULT true NOT NULL,
	`emails` text,
	`phone_numbers` text,
	`addresses` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `scim_server`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scim_user_server_id_idx` ON `scim_user` (`server_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `scim_user_server_id_user_name_idx` ON `scim_user` (`server_id`,`user_name`);