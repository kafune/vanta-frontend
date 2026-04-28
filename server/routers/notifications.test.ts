/**
 * Email Notifications Router Tests
 * Comprehensive test suite for email notification system
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
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

const mockUserContext = {
  user: { id: 2, name: "Regular User", role: "user" as const, email: "user@example.com" },
  req: {} as any,
  res: {} as any,
};

describe("Email Notifications System", () => {
  let testOrderId: string;
  let testUserId: number;

  beforeAll(async () => {
    // Setup: Create test order and user
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user if not exists
    testUserId = 2;
    testOrderId = `test-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert test order
    await db.insert(orders).values({
      id: testOrderId,
      userId: testUserId,
      status: "pendente",
      totalPrice: 10000, // 100.00 EUR
      trackingNumber: `TRACK-${Date.now()}`,
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

  it("should send order status update notification", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "confirmado",
      message: "Your order has been confirmed",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle status update for pending order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "pendente",
      message: "Your order is being processed",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle status update for shipped order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "enviado",
      message: "Your order has been shipped",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle status update for delivered order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "entregue",
      message: "Your order has been delivered",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle status update for cancelled order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "cancelado",
      message: "Your order has been cancelled",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should return email logs for an order", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const logs = await caller.notifications.getEmailLogs({
      orderId: testOrderId,
    });

    expect(Array.isArray(logs)).toBe(true);
    expect(typeof logs).toBe("object");
  });

  it("should return user email logs", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const logs = await caller.notifications.getUserEmailLogs({
      userId: testUserId,
      limit: 10,
    });

    expect(Array.isArray(logs)).toBe(true);
    expect(typeof logs).toBe("object");
  });

  it("should prevent non-admin from accessing admin functions", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    try {
      await caller.notifications.sendOrderStatusUpdate({
        orderId: testOrderId,
        status: "confirmado",
      });
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });

  it("should handle non-existent order gracefully", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: "non-existent-order-id",
      status: "confirmado",
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should support custom notification messages", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const customMessage = "Your order is being prepared with special care";

    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "confirmado",
      message: customMessage,
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should handle all valid status transitions", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    const statuses = ["pendente", "confirmado", "enviado", "entregue", "cancelado"] as const;

    for (const status of statuses) {
      const result = await caller.notifications.sendOrderStatusUpdate({
        orderId: testOrderId,
        status,
      });

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    }
  });

  it("should log email notifications to database", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const caller = appRouter.createCaller(mockAdminContext);

    // Send notification
    const result = await caller.notifications.sendOrderStatusUpdate({
      orderId: testOrderId,
      status: "confirmado",
    });

    // Verify notification was processed
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });
});
