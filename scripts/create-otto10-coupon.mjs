#!/usr/bin/env node

/**
 * Script to create OTTO10 coupon in the database
 * Usage: node scripts/create-otto10-coupon.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import schema
const schemaPath = join(__dirname, "../drizzle/schema.ts");

// We'll use dynamic import with the DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function createOTTO10Coupon() {
  try {
    console.log("Connecting to database...");
    const db = drizzle(DATABASE_URL);

    // Import schema after DB is ready
    const { coupons } = await import("../drizzle/schema.ts");

    console.log("Checking if OTTO10 already exists...");
    const existing = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, "OTTO10"))
      .limit(1);

    if (existing.length > 0) {
      console.log("✓ OTTO10 coupon already exists in database");
      console.log(`  ID: ${existing[0].id}`);
      console.log(`  Discount: ${existing[0].discountValue}%`);
      console.log(`  Uses: ${existing[0].currentUses}/${existing[0].maxUses || "∞"}`);
      process.exit(0);
    }

    console.log("Creating OTTO10 coupon...");
    const couponId = `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await db.insert(coupons).values({
      id: couponId,
      code: "OTTO10",
      description: "Desconto de 10% - Uma única vez por usuário",
      discountType: "percentage",
      discountValue: 10,
      minPurchaseAmount: 0,
      maxUses: null, // unlimited global uses
      currentUses: 0,
      validFrom: now,
      validUntil: validUntil,
      isActive: 1,
    });

    console.log("✓ OTTO10 coupon created successfully!");
    console.log(`  ID: ${couponId}`);
    console.log(`  Code: OTTO10`);
    console.log(`  Discount: 10%`);
    console.log(`  Valid until: ${validUntil.toLocaleDateString("pt-PT")}`);
    console.log(`  Per-user limit: 1 (enforced at application time)`);
    console.log(`\nCoupon is now ready to use!`);

    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("\nDatabase connection failed. Please check:");
      console.error("1. DATABASE_URL is correctly set");
      console.error("2. Database server is accessible");
      console.error("3. Network connectivity to the database");
    }
    process.exit(1);
  }
}

createOTTO10Coupon();
