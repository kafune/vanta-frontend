CREATE TABLE `addresses` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(100),
	`recipient` varchar(255),
	`street` varchar(255) NOT NULL,
	`number` varchar(32),
	`complement` varchar(255),
	`city` varchar(128) NOT NULL,
	`state` varchar(64),
	`zipCode` varchar(20),
	`isDefault` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
