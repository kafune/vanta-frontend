import mysql from 'mysql2/promise';
import { nanoid } from 'nanoid';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'dark_fashion',
});

try {
  // Check if OTTO10 already exists
  const [existing] = await connection.execute(
    'SELECT id FROM coupons WHERE code = ?',
    ['OTTO10']
  );

  if (existing.length > 0) {
    console.log('✓ Cupom OTTO10 já existe no banco de dados');
    await connection.end();
    process.exit(0);
  }

  // Insert OTTO10 coupon
  const couponId = nanoid();
  const validFrom = new Date();
  const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  await connection.execute(
    `INSERT INTO coupons (id, code, description, discountType, discountValue, minPurchaseAmount, maxUses, currentUses, validFrom, validUntil, isActive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      couponId,
      'OTTO10',
      'Desconto de 10% - Uma única vez por usuário',
      'percentage',
      10,
      0,
      null, // unlimited uses globally
      0,
      validFrom,
      validUntil,
      1,
    ]
  );

  console.log('✓ Cupom OTTO10 criado com sucesso!');
  console.log('  - Código: OTTO10');
  console.log('  - Desconto: 10%');
  console.log('  - Válido até:', validUntil.toLocaleDateString('pt-PT'));

  await connection.end();
} catch (error) {
  console.error('✗ Erro ao criar cupom:', error.message);
  process.exit(1);
}
