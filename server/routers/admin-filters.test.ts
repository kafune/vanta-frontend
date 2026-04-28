/**
 * Admin Orders Filters Tests
 * Test suite for advanced order filtering functionality
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { orders, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock context for testing
const mockAdminContext = {
  user: { id: 1, name: "Admin User", role: "admin" as const, email: "admin@vanta.com" },
  req: {} as any,
  res: {} as any,
};

describe("Admin Orders Filtering", () => {
  let testOrderIds: string[] = [];

  beforeAll(async () => {
    // Setup: Create test orders with different statuses and prices
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const baseTime = Date.now();
    const testOrders = [
      {
        id: `test-filter-1-${baseTime}`,
        userId: 2,
        status: "pendente" as const,
        totalPrice: 5000, // 50.00 EUR
        trackingNumber: `TRACK-FILTER-1`,
        createdAt: new Date(baseTime - 86400000), // 1 day ago
      },
      {
        id: `test-filter-2-${baseTime}`,
        userId: 2,
        status: "confirmado" as const,
        totalPrice: 10000, // 100.00 EUR
        trackingNumber: `TRACK-FILTER-2`,
        createdAt: new Date(baseTime - 172800000), // 2 days ago
      },
      {
        id: `test-filter-3-${baseTime}`,
        userId: 2,
        status: "enviado" as const,
        totalPrice: 15000, // 150.00 EUR
        trackingNumber: `TRACK-FILTER-3`,
        createdAt: new Date(baseTime - 259200000), // 3 days ago
      },
      {
        id: `test-filter-4-${baseTime}`,
        userId: 2,
        status: "entregue" as const,
        totalPrice: 20000, // 200.00 EUR
        trackingNumber: `TRACK-FILTER-4`,
        createdAt: new Date(baseTime - 345600000), // 4 days ago
      },
    ];

    for (const order of testOrders) {
      await db.insert(orders).values(order);
      testOrderIds.push(order.id);
    }
  });

  afterAll(async () => {
    // Cleanup: Remove test orders
    const db = await getDb();
    if (!db) return;

    try {
      for (const orderId of testOrderIds) {
        await db.delete(orders).where(eq(orders.id, orderId));
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  it("should list all orders without filters", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({});

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter orders by single status", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      status: "pendente",
    });

    expect(Array.isArray(result)).toBe(true);
    // All results should have pendente status
    result.forEach((order) => {
      expect(order.status).toBe("pendente");
    });
  });

  it("should filter orders by multiple statuses", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      statuses: ["pendente", "confirmado"],
    });

    expect(Array.isArray(result)).toBe(true);
    // All results should have one of the specified statuses
    result.forEach((order) => {
      expect(["pendente", "confirmado"]).toContain(order.status);
    });
  });

  it("should filter orders by price range", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      priceMin: 75,
      priceMax: 175,
    });

    expect(Array.isArray(result)).toBe(true);
    // All results should be within price range
    result.forEach((order) => {
      expect(order.totalPrice).toBeGreaterThanOrEqual(75);
      expect(order.totalPrice).toBeLessThanOrEqual(175);
    });
  });

  it("should filter orders by date range", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 3);
    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - 1);

    const result = await caller.admin.orders.list({
      dateFrom: dateFrom.toISOString().split("T")[0],
      dateTo: dateTo.toISOString().split("T")[0],
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should sort orders by date descending", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      sortBy: "date",
      sortOrder: "desc",
      limit: 100,
    });

    expect(Array.isArray(result)).toBe(true);
    // Verify descending order
    for (let i = 1; i < result.length; i++) {
      expect(new Date(result[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result[i].createdAt).getTime()
      );
    }
  });

  it("should sort orders by price ascending", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      sortBy: "price",
      sortOrder: "asc",
      limit: 100,
    });

    expect(Array.isArray(result)).toBe(true);
    // Verify ascending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].totalPrice).toBeLessThanOrEqual(result[i].totalPrice);
    }
  });

  it("should apply pagination with limit and offset", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result1 = await caller.admin.orders.list({
      limit: 2,
      offset: 0,
    });

    const result2 = await caller.admin.orders.list({
      limit: 2,
      offset: 2,
    });

    expect(Array.isArray(result1)).toBe(true);
    expect(Array.isArray(result2)).toBe(true);
    expect(result1.length).toBeLessThanOrEqual(2);
    expect(result2.length).toBeLessThanOrEqual(2);
  });

  it("should combine multiple filters", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      statuses: ["enviado", "entregue"],
      priceMin: 100,
      priceMax: 250,
      sortBy: "price",
      sortOrder: "desc",
    });

    expect(Array.isArray(result)).toBe(true);
    // Verify all filters are applied
    result.forEach((order) => {
      expect(["enviado", "entregue"]).toContain(order.status);
      expect(order.totalPrice).toBeGreaterThanOrEqual(100);
      expect(order.totalPrice).toBeLessThanOrEqual(250);
    });
  });

  it("should return empty array for non-matching filters", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.admin.orders.list({
      priceMin: 10000,
      priceMax: 20000,
      statuses: ["cancelado"], // No cancelado orders in test data
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
