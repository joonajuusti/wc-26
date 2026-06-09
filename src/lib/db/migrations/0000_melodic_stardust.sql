CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`match_number` integer NOT NULL,
	`home_team_id` integer,
	`away_team_id` integer,
	`home_label` text NOT NULL,
	`away_label` text NOT NULL,
	`stage` text NOT NULL,
	`kickoff_utc` integer NOT NULL,
	`result` text,
	`locked` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matches_match_number_unique` ON `matches` (`match_number`);--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`match_id` integer NOT NULL,
	`pick` text NOT NULL,
	`points_earned` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_match_idx` ON `predictions` (`user_id`,`match_id`);--> statement-breakpoint
CREATE TABLE `scoring_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stage` text NOT NULL,
	`points` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scoring_rules_stage_unique` ON `scoring_rules` (`stage`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`flag_emoji` text NOT NULL,
	`group_letter` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`session_token` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_invite_code_unique` ON `users` (`invite_code`);