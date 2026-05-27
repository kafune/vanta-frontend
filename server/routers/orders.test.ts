/**
 * Orders Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const mockUserContext = {
  user: {
    id: 1,
    openId: "test-user-1",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  },
  req: {} as any,
  res: {} as any,
};

const mockAdminContext = {
  user: {
    id: 2,
    openId: "test-admin-1",
    name: "Test Admin",
    email: "admin@example.com",
    role: "admin" as const,
  },
  req: {} as any,
  res: {} as any,
};

describe("Orders Router", () => {
  it("should create a new order", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.orders.create({
      items: [
        {
          productId: "prod-1",
          productName: "Test Product",
          quantity: 2,
          price: 99.90,
          color: "Preto",
          size: "M",
        },
      ],
      totalPrice: 199.80,
      paymentMethod: "stripe",
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
    expect(result.totalPrice).toBe(199.80);
  });

  it("should get user's orders", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.orders.getByUser();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get order by id", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // First create an order
    const createResult = await caller.orders.create({
      items: [
        {
          productId: "prod-1",
          productName: "Test Product",
          quantity: 1,
          price: 99.90,
        },
      ],
      totalPrice: 99.90,
    });

    // Then fetch it
    const getResult = await caller.orders.getById({
      orderId: createResult.orderId,
    });

    expect(getResult).not.toBeNull();
    expect(getResult?.id).toBe(createResult.orderId);
    expect(getResult?.items).toBeDefined();
    expect(Array.isArray(getResult?.items)).toBe(true);
  });

  it("should update order status (admin only)", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.orders.updateStatus({
      orderId: "test-order-1",
      status: "confirmado",
      trackingNumber: "ABC123",
    });

    expect(result.success).toBe(true);
  });

  it("should prevent non-admin from updating order status", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    try {
      await caller.orders.updateStatus({
        orderId: "test-order-1",
        status: "confirmado",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should get all orders (admin only)", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.orders.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should prevent non-admin from getting all orders", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.orders.getAll();
    expect(result).toEqual([]);
  });

  it("should get order statistics (admin only)", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.orders.getStats();
    expect(result).not.toBeNull();
    expect(result?.totalOrders).toBeDefined();
    expect(result?.totalRevenue).toBeDefined();
    expect(result?.byStatus).toBeDefined();
  });

  it("should prevent non-admin from getting order statistics", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.orders.getStats();
    expect(result).toBeNull();
  });
});
