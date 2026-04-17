import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, lte, gte } from "drizzle-orm";
import mysql from "mysql2/promise";
import { coupons } from "./drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

async function testQuery() {
  try {
    console.log("Creating Drizzle connection...");
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);
    
    const now = new Date();
    console.log("Current time:", now.toISOString());
    console.log("Searching for OTTO10 with conditions:");
    console.log("  - code = 'OTTO10'");
    console.log("  - isActive = 1");
    console.log("  - validFrom <= now");
    console.log("  - validUntil >= now");
    
    const result = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, "OTTO10"),
          eq(coupons.isActive, 1),
          lte(coupons.validFrom, now),
          gte(coupons.validUntil, now)
        )
      )
      .limit(1);
    
    console.log("\nQuery result:", result);
    
    if (result.length === 0) {
      console.log("\n❌ Query returned no results!");
      
      // Try without date filters
      console.log("\nTrying without date filters...");
      const result2 = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, "OTTO10"),
            eq(coupons.isActive, 1)
          )
        )
        .limit(1);
      
      console.log("Result without date filters:", result2);
      
      if (result2.length > 0) {
        const c = result2[0];
        console.log("\n⚠️  Coupon found without date filters!");
        console.log("  validFrom:", c.validFrom);
        console.log("  validUntil:", c.validUntil);
        console.log("  now:", now);
        console.log("  validFrom <= now:", c.validFrom <= now);
        console.log("  validUntil >= now:", c.validUntil >= now);
      }
    } else {
      console.log("\n✓ Query successful!");
      console.log("Found coupon:", result[0]);
    }
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error);
    process.exit(1);
  }
}

testQuery();
