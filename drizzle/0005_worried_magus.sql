CREATE TABLE `wishlist` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`productId` varchar(64) NOT NULL,
	`productName` text NOT NULL,
	`productImage` text,
	`productPrice` int NOT NULL,
	`productCategory` varchar(64),
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_id` PRIMARY KEY(`id`)
);
