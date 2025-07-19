CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`hand_id` text NOT NULL,
	`street` integer NOT NULL,
	`sequence` integer NOT NULL,
	`name` text NOT NULL,
	`amount` real,
	`amount2` real,
	`card1` text,
	`card2` text,
	`text` text,
	`hand_player_id` text NOT NULL,
	FOREIGN KEY (`hand_id`) REFERENCES `hands`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hand_player_id`) REFERENCES `hand_players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `actions_hand_id_idx` ON `actions` (`hand_id`);--> statement-breakpoint
CREATE INDEX `actions_street_idx` ON `actions` (`street`);--> statement-breakpoint
CREATE TABLE `community_cards` (
	`hand_id` text PRIMARY KEY NOT NULL,
	`flop1` text,
	`flop2` text,
	`flop3` text,
	`turn` text,
	`river` text,
	FOREIGN KEY (`hand_id`) REFERENCES `hands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hand_player_cards` (
	`hand_player_id` text PRIMARY KEY NOT NULL,
	`card1` text NOT NULL,
	`card2` text NOT NULL,
	FOREIGN KEY (`hand_player_id`) REFERENCES `hand_players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hand_players` (
	`id` text PRIMARY KEY NOT NULL,
	`hand_id` text NOT NULL,
	`seat` integer NOT NULL,
	`position` text,
	`name` text NOT NULL,
	`chips` real NOT NULL,
	`chips_after_hand` real NOT NULL,
	`is_sitting_out` integer DEFAULT false NOT NULL,
	`is_hero` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`hand_id`) REFERENCES `hands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `hand_players_hand_id_idx` ON `hand_players` (`hand_id`);--> statement-breakpoint
CREATE TABLE `hands` (
	`id` text PRIMARY KEY NOT NULL,
	`poker_client_hand_id` text,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`table_name` text NOT NULL,
	`small_blind` real NOT NULL,
	`max_players` integer NOT NULL,
	`dealer_seat` integer NOT NULL,
	`total_pot` real NOT NULL,
	`main_pot` real NOT NULL,
	`side_pot` real DEFAULT 0 NOT NULL,
	`side_pot2` real DEFAULT 0 NOT NULL,
	`rake` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `range_chart_hands` (
	`id` text PRIMARY KEY NOT NULL,
	`range_chart_id` text NOT NULL,
	`hand` text NOT NULL,
	`action` text NOT NULL,
	FOREIGN KEY (`range_chart_id`) REFERENCES `range_charts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `range_charts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`for_position` text NOT NULL,
	`against_position` text
);
