CREATE TABLE `promotions` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(32) NOT NULL,
	`discount` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1,
	`applicableCategories` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`rewardPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailSubscribers` (
	`email` varchar(320) NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1,
	`tags` text,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailSubscribers_email` PRIMARY KEY(`email`)
);
--> statement-breakpoint
CREATE TABLE `emailCampaigns` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`recipientCount` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailCampaigns_id` PRIMARY KEY(`id`)
);
