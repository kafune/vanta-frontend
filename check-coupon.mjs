import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

async function checkCoupon() {
  try {
    console.log("Connecting to database...");
    const connection = await mysql.createConnection(DATABASE_URL);
    
    console.log("Checking for OTTO10 coupon...");
    const [rows] = await connection.execute(
      "SELECT id, code, isActive, validFrom, validUntil, currentUses, maxUses FROM coupons WHERE code = 'OTTO10'"
    );
    
    if (rows.length === 0) {
      console.log("❌ OTTO10 coupon NOT found in database");
      console.log("\nCreating OTTO10 coupon...");
      
      const couponId = `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      await connection.execute(
        `INSERT INTO coupons (id, code, description, discountType, discountValue, minPurchaseAmount, maxUses, currentUses, validFrom, validUntil, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [couponId, "OTTO10", "Desconto de 10% - Uma única vez por usuário", "percentage", 10, 0, null, 0, now, validUntil, 1]
      );
      
      console.log("✓ OTTO10 coupon created!");
      console.log(`  ID: ${couponId}`);
      console.log(`  Valid from: ${now.toISOString()}`);
      console.log(`  Valid until: ${validUntil.toISOString()}`);
    } else {
      const coupon = rows[0];
      console.log("✓ OTTO10 coupon found:");
      console.log(`  ID: ${coupon.id}`);
      console.log(`  Active: ${coupon.isActive}`);
      console.log(`  Valid from: ${coupon.validFrom}`);
      console.log(`  Valid until: ${coupon.validUntil}`);
      console.log(`  Uses: ${coupon.currentUses}/${coupon.maxUses || "∞"}`);
      
      const now = new Date();
      console.log(`\nCurrent time: ${now.toISOString()}`);
      console.log(`validFrom <= now: ${coupon.validFrom <= now}`);
      console.log(`validUntil >= now: ${coupon.validUntil >= now}`);
    }
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
}

checkCoupon();
