CREATE TABLE `cashbackBalance` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalSpent` int NOT NULL DEFAULT 0,
	`availableBalance` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cashbackBalance_id` PRIMARY KEY(`id`),
	CONSTRAINT `cashbackBalance_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `cashbackTransactions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`type` enum('earned','spent') NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashbackTransactions_id` PRIMARY KEY(`id`)
);
