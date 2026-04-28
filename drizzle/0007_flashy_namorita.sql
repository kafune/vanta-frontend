CREATE TABLE `filterUsageLogs` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`filterType` varchar(64) NOT NULL,
	`filterValue` text,
	`resultsCount` int DEFAULT 0,
	`duration` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `filterUsageLogs_id` PRIMARY KEY(`id`)
);
