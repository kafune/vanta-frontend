CREATE TABLE `searchQueries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`query` varchar(100) NOT NULL,
	`userId` int,
	`resultsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchQueries_id` PRIMARY KEY(`id`)
);
