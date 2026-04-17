CREATE TABLE `couponUsage` (
	`id` varchar(64) NOT NULL,
	`couponId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `couponUsage_id` PRIMARY KEY(`id`)
);
