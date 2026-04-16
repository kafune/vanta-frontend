CREATE TABLE `orderItems` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`productName` text NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`color` varchar(64),
	`size` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pendente','confirmado','enviado','entregue','cancelado') NOT NULL DEFAULT 'pendente',
	`totalPrice` int NOT NULL,
	`trackingNumber` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`comment` text,
	`verified` int NOT NULL DEFAULT 0,
	`helpful` int NOT NULL DEFAULT 0,
	`unhelpful` int NOT NULL DEFAULT 0,
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
