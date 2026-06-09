PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` integer PRIMARY KEY NOT NULL,
	`home_team_id` text,
	`away_team_id` text,
	`stage` text NOT NULL,
	`kickoff_utc` integer NOT NULL,
	`result` text,
	`locked` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_matches`("id", "home_team_id", "away_team_id", "stage", "kickoff_utc", "result", "locked") SELECT "id", "home_team_id", "away_team_id", "stage", "kickoff_utc", "result", "locked" FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`flag_emoji` text NOT NULL,
	`group_letter` text
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "name", "flag_emoji", "group_letter") SELECT "id", "name", "flag_emoji", "group_letter" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;