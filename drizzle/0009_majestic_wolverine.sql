CREATE TABLE `pixPayments` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`pixKey` varchar(255) NOT NULL,
	`qrCode` text NOT NULL,
	`brCode` text NOT NULL,
	`status` enum('pending','confirmed','failed','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pixPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pixTransactions` (
	`id` varchar(64) NOT NULL,
	`pixPaymentId` varchar(64) NOT NULL,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pixTransactions_id` PRIMARY KEY(`id`)
);
