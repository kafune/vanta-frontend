-- Estoque inicial dos produtos do seed (a coluna stock foi adicionada em 0017 com
-- default 0, depois do seed 0012). Só ajusta quem ainda está com stock 0, para não
-- sobrescrever ajustes feitos no admin. Comando UNICO (CASE) de proposito: varios
-- UPDATEs soltos no mesmo arquivo travam o drizzle-kit migrate.
UPDATE `products` SET `stock` = CASE `id`
	WHEN 'essential-tee-280g' THEN 50
	WHEN 'urban-oversized' THEN 30
	WHEN 'performance-pro' THEN 25
	WHEN 'luxury-hoodie' THEN 15
	WHEN 'classic-cotton' THEN 100
	WHEN 'street-oversized' THEN 20
	WHEN 'tech-dryfit' THEN 40
	WHEN 'premium-cotton' THEN 25
	WHEN 'oversized-comfort' THEN 35
	WHEN 'hoodie-deluxe' THEN 10
	WHEN 'dryfit-sport' THEN 60
	WHEN 'cotton-classic' THEN 80
	ELSE `stock`
END
WHERE `stock` = 0 AND `id` IN (
	'essential-tee-280g','urban-oversized','performance-pro','luxury-hoodie',
	'classic-cotton','street-oversized','tech-dryfit','premium-cotton',
	'oversized-comfort','hoodie-deluxe','dryfit-sport','cotton-classic'
);
