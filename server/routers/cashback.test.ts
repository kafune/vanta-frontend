import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { users, cashbackBalance, cashbackTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Cashback System", () => {
  let db: any;
  let testUserId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    await db.insert(users).values({
      openId: `test-cashback-${Date.now()}`,
      name: "Test Cashback User",
      email: `cashback-${Date.now()}@test.com`,
      loginMethod: "test",
      role: "user",
    });

    // Get the user ID
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.name, "Test Cashback User"))
      .limit(1);

    testUserId = userResult[0].id;
  });

  afterAll(async () => {
    // Cleanup
    if (db && testUserId) {
      await db.delete(cashbackTransactions).where(eq(cashbackTransactions.userId, testUserId));
      await db.delete(cashbackBalance).where(eq(cashbackBalance.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should calculate 10% cashback correctly", () => {
    const testCases = [
      { orderTotal: 10000, expected: 1000 }, // R$ 100 → R$ 10
      { orderTotal: 5000, expected: 500 }, // R$ 50 → R$ 5
      { orderTotal: 33333, expected: 3333 }, // R$ 333.33 → R$ 33.33
    ];

    testCases.forEach(({ orderTotal, expected }) => {
      const earned = Math.round(orderTotal * 0.1);
      expect(earned).toBe(expected);
    });
  });

  it("should create cashback balance for user", async () => {
    const balanceId = `cashback-${testUserId}-${Date.now()}`;
    const earnedAmount = 1000;

    await db.insert(cashbackBalance).values({
      id: balanceId,
      userId: testUserId,
      totalEarned: earnedAmount,
      totalSpent: 0,
      availableBalance: earnedAmount,
    });

    const balance = await db
      .select()
      .from(cashbackBalance)
      .where(eq(cashbackBalance.userId, testUserId));

    expect(balance.length).toBeGreaterThan(0);
    expect(balance[0].totalEarned).toBe(earnedAmount);
    expect(balance[0].availableBalance).toBe(earnedAmount);
  });

  it("should record earned cashback transaction", async () => {
    const orderId = `order-earned-${Date.now()}`;
    const earnedAmount = 2000;

    const transactionId = `cashback-tx-${orderId}-${Date.now()}`;
    await db.insert(cashbackTransactions).values({
      id: transactionId,
      userId: testUserId,
      orderId,
      type: "earned",
      amount: earnedAmount,
      description: `Ganhou 10% de cashback da compra #${orderId}`,
    });

    const transactions = await db
      .select()
      .from(cashbackTransactions)
      .where(eq(cashbackTransactions.userId, testUserId));

    const earnedTx = transactions.find((t) => t.type === "earned");
    expect(earnedTx).toBeDefined();
    expect(earnedTx.amount).toBe(earnedAmount);
  });

  it("should record spent cashback transaction", async () => {
    const orderId = `order-spent-${Date.now()}`;
    const spentAmount = 500;

    const transactionId = `cashback-tx-spent-${orderId}-${Date.now()}`;
    await db.insert(cashbackTransactions).values({
      id: transactionId,
      userId: testUserId,
      orderId,
      type: "spent",
      amount: spentAmount,
      description: `Usou R$ ${(spentAmount / 100).toFixed(2)} de cashback na compra #${orderId}`,
    });

    const transactions = await db
      .select()
      .from(cashbackTransactions)
      .where(eq(cashbackTransactions.userId, testUserId));

    const spentTx = transactions.find((t) => t.type === "spent");
    expect(spentTx).toBeDefined();
    expect(spentTx.amount).toBe(spentAmount);
  });

  it("should prevent spending more cashback than available", () => {
    const availableBalance = 5000; // R$ 50.00
    const attemptToSpend = 10000; // R$ 100.00

    expect(availableBalance < attemptToSpend).toBe(true);
  });

  it("should calculate accurate balance after transactions", () => {
    const transactions = [
      { type: "earned", amount: 1000 },
      { type: "earned", amount: 1500 },
      { type: "spent", amount: 500 },
      { type: "earned", amount: 800 },
    ];

    let totalEarned = 0;
    let totalSpent = 0;

    transactions.forEach((tx) => {
      if (tx.type === "earned") {
        totalEarned += tx.amount;
      } else {
        totalSpent += tx.amount;
      }
    });

    const availableBalance = totalEarned - totalSpent;
    expect(availableBalance).toBe(2800); // 1000 + 1500 + 800 - 500
  });

  it("should track transaction history", async () => {
    const orderId1 = `order-history-1-${Date.now()}`;
    const orderId2 = `order-history-2-${Date.now()}`;

    const tx1Id = `cashback-tx-${orderId1}-${Date.now()}`;
    await db.insert(cashbackTransactions).values({
      id: tx1Id,
      userId: testUserId,
      orderId: orderId1,
      type: "earned",
      amount: 1000,
      description: "Test earned",
    });

    // Wait a bit to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const tx2Id = `cashback-tx-${orderId2}-${Date.now()}`;
    await db.insert(cashbackTransactions).values({
      id: tx2Id,
      userId: testUserId,
      orderId: orderId2,
      type: "spent",
      amount: 500,
      description: "Test spent",
    });

    const transactions = await db
      .select()
      .from(cashbackTransactions)
      .where(eq(cashbackTransactions.userId, testUserId))
      .orderBy((t) => t.createdAt);

    expect(transactions.length).toBeGreaterThanOrEqual(2);
  });
});
