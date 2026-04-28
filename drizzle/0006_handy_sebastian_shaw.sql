CREATE TABLE `emailLogs` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`emailType` enum('order_confirmation','order_shipped','order_delivered','status_update') NOT NULL,
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`subject` text,
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailLogs_id` PRIMARY KEY(`id`)
);
