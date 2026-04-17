import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

async function testQuery() {
  try {
    console.log("Creating connection...");
    const connection = await mysql.createConnection(DATABASE_URL);
    
    const now = new Date();
    console.log("Current time:", now.toISOString());
    
    // Test 1: Raw SQL with current timestamp
    console.log("\n=== Test 1: Raw SQL ===");
    const [rows1] = await connection.execute(
      `SELECT id, code, isActive, validFrom, validUntil, currentUses 
       FROM coupons 
       WHERE code = 'OTTO10' 
       AND isActive = 1 
       AND validFrom <= NOW() 
       AND validUntil >= NOW()`
    );
    
    console.log("Result:", rows1);
    
    // Test 2: Raw SQL with JavaScript Date
    console.log("\n=== Test 2: Raw SQL with JS Date ===");
    const [rows2] = await connection.execute(
      `SELECT id, code, isActive, validFrom, validUntil, currentUses 
       FROM coupons 
       WHERE code = 'OTTO10' 
       AND isActive = 1 
       AND validFrom <= ? 
       AND validUntil >= ?`,
      [now, now]
    );
    
    console.log("Result:", rows2);
    
    // Test 3: Check actual values in DB
    console.log("\n=== Test 3: Actual DB values ===");
    const [rows3] = await connection.execute(
      `SELECT id, code, isActive, validFrom, validUntil, UNIX_TIMESTAMP(validFrom) as validFrom_unix, UNIX_TIMESTAMP(validUntil) as validUntil_unix, UNIX_TIMESTAMP(NOW()) as now_unix
       FROM coupons 
       WHERE code = 'OTTO10'`
    );
    
    console.log("Result:", rows3);
    
    if (rows3.length > 0) {
      const row = rows3[0];
      console.log("\nComparison:");
      console.log("  validFrom_unix:", row.validFrom_unix);
      console.log("  now_unix:", row.now_unix);
      console.log("  validUntil_unix:", row.validUntil_unix);
      console.log("  validFrom <= now:", row.validFrom_unix <= row.now_unix);
      console.log("  validUntil >= now:", row.validUntil_unix >= row.now_unix);
    }
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
}

testQuery();
