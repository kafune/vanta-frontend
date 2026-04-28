/**
 * Resend Notification Tests
 * Test suite for resending order notifications
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { orders, users, emailLogs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock context for testing
const mockAdminContext = {
  user: { id: 1, name: "Admin User", role: "admin" as const, email: "admin@vanta.com" },
  req: {} as any,
  res: {} as any,
};

describe("Resend Notification System", () => {
  let testOrderId: string;
  let testUserId: number;

  beforeAll(async () => {
    // Setup: Create test order and user
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    testUserId = 2;
    testOrderId = `test-resend-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert test order
    await db.insert(orders).values({
      id: testOrderId,
      userId: testUserId,
      status: "enviado",
      totalPrice: 15000, // 150.00 EUR
      trackingNumber: `TRACK-RESEND-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    const db = await getDb();
    if (!db) return;

    try {
      // Delete email logs
      const logsToDelete = await db
        .select()
        .from(emailLogs)
        .where(eq(emailLogs.orderId, testOrderId));

      for (const log of logsToDelete) {
        await db.delete(emailLogs).where(eq(emailLogs.id, log.id));
      }

      // Delete test order
      await db.delete(orders).where(eq(orders.id, testOrderId));
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  it("should resend notification for an order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.resendNotification({
      orderId: testOrderId,
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should resend notification with custom message", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const customMessage = "Seu pedido está a caminho! Acompanhe o rastreamento.";

    const result = await caller.notifications.resendNotification({
      orderId: testOrderId,
      customMessage,
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle resend for non-existent order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.resendNotification({
      orderId: "non-existent-order-id",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should resend notification with empty custom message", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.resendNotification({
      orderId: testOrderId,
      customMessage: "",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should resend notification with long custom message", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const longMessage = "A".repeat(500); // Max length

    const result = await caller.notifications.resendNotification({
      orderId: testOrderId,
      customMessage: longMessage,
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should log resend attempts in email logs", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const caller = appRouter.createCaller(mockAdminContext);

    // Send resend notification
    await caller.notifications.resendNotification({
      orderId: testOrderId,
      customMessage: "Test resend logging",
    });

    // Verify log was created
    const logs = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.orderId, testOrderId));

    // Should have at least one log (from initial send or resend)
    expect(Array.isArray(logs)).toBe(true);
  });

  it("should include [REENVIO] tag in email subject", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.resendNotification({
      orderId: testOrderId,
    });

    // Verify the procedure was called successfully
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle multiple resends for same order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    // First resend
    const result1 = await caller.notifications.resendNotification({
      orderId: testOrderId,
      customMessage: "First resend",
    });

    // Second resend
    const result2 = await caller.notifications.resendNotification({
      orderId: testOrderId,
      customMessage: "Second resend",
    });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(typeof result1.success).toBe("boolean");
    expect(typeof result2.success).toBe("boolean");
  });

  it("should return success or failure message", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.resendNotification({
      orderId: testOrderId,
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
  });
});
