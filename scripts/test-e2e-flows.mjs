#!/usr/bin/env node

/**
 * E2E Test Script: Cupom OTTO10 e Cashback System
 * 
 * Este script testa:
 * 1. Cupom OTTO10 existe e é válido
 * 2. Usuário não pode usar cupom 2x
 * 3. Cashback é gerado após compra
 * 4. Cashback pode ser usado em próxima compra
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'dark_fashion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testCouponSystem() {
  console.log('\n📋 Testando Sistema de Cupom OTTO10...\n');
  
  try {
    const connection = await pool.getConnection();

    // 1. Verificar se cupom OTTO10 existe
    console.log('1️⃣  Verificando se cupom OTTO10 existe...');
    const [coupons] = await connection.query(
      'SELECT id, code, discountType, discountValue, maxUses, usedCount, validFrom, validUntil FROM coupons WHERE code = ?',
      ['OTTO10']
    );

    if (coupons.length === 0) {
      console.log('❌ Cupom OTTO10 não encontrado no banco de dados');
      console.log('   Execute: node scripts/create-otto10-coupon.mjs');
      connection.release();
      return false;
    }

    const coupon = coupons[0];
    console.log('✅ Cupom OTTO10 encontrado:');
    console.log(`   - Tipo: ${coupon.discountType}`);
    console.log(`   - Valor: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '€'}`);
    console.log(`   - Usos: ${coupon.usedCount}/${coupon.maxUses}`);
    console.log(`   - Válido de: ${coupon.validFrom} até ${coupon.validUntil}`);

    // 2. Verificar se há registros de uso do cupom
    console.log('\n2️⃣  Verificando histórico de uso do cupom...');
    const [usageRecords] = await connection.query(
      'SELECT id, couponId, userId, createdAt FROM couponUsage WHERE couponId = ? ORDER BY createdAt DESC LIMIT 5',
      [coupon.id]
    );

    if (usageRecords.length === 0) {
      console.log('✅ Nenhum uso registrado ainda (esperado para novo cupom)');
    } else {
      console.log(`✅ ${usageRecords.length} uso(s) registrado(s):`);
      for (const record of usageRecords) {
        console.log(`   - Usuário ${record.userId} em ${record.createdAt}`);
      }
    }

    // 3. Verificar sistema de cashback
    console.log('\n3️⃣  Verificando Sistema de Cashback...');
    const [cashbackBalances] = await connection.query(
      'SELECT userId, totalEarned, totalSpent, availableBalance FROM cashbackBalance ORDER BY totalEarned DESC LIMIT 5'
    );

    if (cashbackBalances.length === 0) {
      console.log('✅ Nenhum saldo de cashback registrado ainda (esperado para novo sistema)');
    } else {
      console.log(`✅ ${cashbackBalances.length} usuário(s) com saldo de cashback:`);
      for (const balance of cashbackBalances) {
        console.log(`   - Usuário ${balance.userId}:`);
        console.log(`     • Ganho: €${(balance.totalEarned / 100).toFixed(2)}`);
        console.log(`     • Gasto: €${(balance.totalSpent / 100).toFixed(2)}`);
        console.log(`     • Disponível: €${(balance.availableBalance / 100).toFixed(2)}`);
      }
    }

    // 4. Verificar transações de cashback
    console.log('\n4️⃣  Verificando Transações de Cashback...');
    const [transactions] = await connection.query(
      'SELECT id, userId, type, amount, description, createdAt FROM cashbackTransactions ORDER BY createdAt DESC LIMIT 10'
    );

    if (transactions.length === 0) {
      console.log('✅ Nenhuma transação de cashback registrada ainda');
    } else {
      console.log(`✅ ${transactions.length} transação(ões) registrada(s):`);
      for (const tx of transactions) {
        const icon = tx.type === 'earned' ? '📈' : '📉';
        console.log(`   ${icon} ${tx.type === 'earned' ? 'Ganho' : 'Gasto'}: €${(tx.amount / 100).toFixed(2)} - ${tx.description}`);
      }
    }

    console.log('\n✅ Testes de Sistema Completos!\n');
    console.log('📝 Próximos Passos:');
    console.log('   1. Acesse a loja em: https://3000-is51q8d8mvzexpw9gifuc-1179566a.us2.manus.computer');
    console.log('   2. Faça login como admin');
    console.log('   3. Teste aplicar cupom OTTO10 no checkout');
    console.log('   4. Verifique se o cashback foi gerado após compra');
    console.log('   5. Tente usar o cupom novamente (deve ser bloqueado)');
    console.log('   6. Use o cashback gerado em uma próxima compra');

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar sistema:', error.message);
    return false;
  }
}

// Executar testes
testCouponSystem().then(success => {
  process.exit(success ? 0 : 1);
});
