-- Estoque inicial dos produtos do seed (a coluna stock foi adicionada em 0017 com
-- default 0, depois do seed 0012). Só ajusta quem ainda está com stock 0, para não
-- sobrescrever ajustes feitos no admin.
UPDATE `products` SET `stock` = 50  WHERE `id` = 'essential-tee-280g' AND `stock` = 0;
UPDATE `products` SET `stock` = 30  WHERE `id` = 'urban-oversized'    AND `stock` = 0;
UPDATE `products` SET `stock` = 25  WHERE `id` = 'performance-pro'     AND `stock` = 0;
UPDATE `products` SET `stock` = 15  WHERE `id` = 'luxury-hoodie'       AND `stock` = 0;
UPDATE `products` SET `stock` = 100 WHERE `id` = 'classic-cotton'      AND `stock` = 0;
UPDATE `products` SET `stock` = 20  WHERE `id` = 'street-oversized'    AND `stock` = 0;
UPDATE `products` SET `stock` = 40  WHERE `id` = 'tech-dryfit'         AND `stock` = 0;
UPDATE `products` SET `stock` = 25  WHERE `id` = 'premium-cotton'      AND `stock` = 0;
UPDATE `products` SET `stock` = 35  WHERE `id` = 'oversized-comfort'   AND `stock` = 0;
UPDATE `products` SET `stock` = 10  WHERE `id` = 'hoodie-deluxe'       AND `stock` = 0;
UPDATE `products` SET `stock` = 60  WHERE `id` = 'dryfit-sport'        AND `stock` = 0;
UPDATE `products` SET `stock` = 80  WHERE `id` = 'cotton-classic'      AND `stock` = 0;
