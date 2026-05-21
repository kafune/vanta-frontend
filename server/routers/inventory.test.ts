/**
 * Inventory Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const adminCaller = appRouter.createCaller({
  user: { id: 1, name: "Admin", email: "admin@example.com", role: "admin" },
  req: {} as any,
  res: {} as any,
});

const userCaller = appRouter.createCaller({
  user: { id: 2, name: "User", email: "user@example.com", role: "user" },
  req: {} as any,
  res: {} as any,
});

const publicCaller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Inventory Router", () => {
  describe("getInventory", () => {
    it("should return inventory for a product", async () => {
      const result = await publicCaller.inventory.getInventory({
        productId: "essential-tee-280g",
      });

      expect(result).toBeDefined();
      expect(result.productId).toBe("essential-tee-280g");
      expect(result.total).toBeGreaterThan(0);
      expect(result.available).toBeLessThanOrEqual(result.total);
      expect(result.status).toMatch(/in_stock|out_of_stock/);
    });

    it("should throw error for non-existent product", async () => {
      try {
        await publicCaller.inventory.getInventory({
          productId: "non-existent",
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("getInventoryBatch", () => {
    it("should return inventory for multiple products", async () => {
      const result = await publicCaller.inventory.getInventoryBatch({
        productIds: ["essential-tee-280g", "urban-oversized"],
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].productId).toBe("essential-tee-280g");
      expect(result[1].productId).toBe("urban-oversized");
    });
  });

  describe("checkAvailability", () => {
    it("should return available for sufficient quantity", async () => {
      const result = await publicCaller.inventory.checkAvailability({
        productId: "essential-tee-280g",
        quantity: 5,
      });

      expect(result.available).toBe(true);
    });

    it("should return unavailable for insufficient quantity", async () => {
      const result = await publicCaller.inventory.checkAvailability({
        productId: "essential-tee-280g",
        quantity: 1000,
      });

      expect(result.available).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe("reserveInventory", () => {
    it("should reserve inventory", async () => {
      const result = await userCaller.inventory.reserveInventory({
        productId: "essential-tee-280g",
        quantity: 5,
        orderId: "order-123",
      });

      expect(result.success).toBe(true);
      expect(result.reservedQuantity).toBe(5);
      expect(result.available).toBeLessThan(85);
    });

    it("should throw error for insufficient inventory", async () => {
      try {
        await userCaller.inventory.reserveInventory({
          productId: "essential-tee-280g",
          quantity: 1000,
          orderId: "order-456",
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("releaseInventory", () => {
    it("should release reserved inventory", async () => {
      const result = await userCaller.inventory.releaseInventory({
        productId: "essential-tee-280g",
        quantity: 5,
        orderId: "order-123",
      });

      expect(result.success).toBe(true);
      expect(result.releasedQuantity).toBe(5);
    });
  });

  describe("updateInventory", () => {
    it("should update inventory (admin only)", async () => {
      const result = await adminCaller.inventory.updateInventory({
        productId: "essential-tee-280g",
        totalQuantity: 200,
        reason: "Restock",
      });

      expect(result.success).toBe(true);
      expect(result.total).toBe(200);
    });

    it("should deny non-admin access", async () => {
      try {
        await userCaller.inventory.updateInventory({
          productId: "essential-tee-280g",
          totalQuantity: 200,
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("getLowStockAlerts", () => {
    it("should return low stock alerts (admin only)", async () => {
      const result = await adminCaller.inventory.getLowStockAlerts();

      expect(result).toBeDefined();
      expect(Array.isArray(result.alerts)).toBe(true);
      expect(typeof result.count).toBe("number");
    });
  });

  describe("getInventoryStats", () => {
    it("should return inventory statistics (admin only)", async () => {
      const result = await adminCaller.inventory.getInventoryStats();

      expect(result).toBeDefined();
      expect(result.totalItems).toBeGreaterThan(0);
      expect(result.availableItems).toBeGreaterThanOrEqual(0);
      expect(result.reservedItems).toBeGreaterThanOrEqual(0);
      expect(typeof result.utilizationRate).toBe("number");
    });
  });
});
