/**
 * Inventory Router
 * Handles inventory tracking, stock levels, and availability management
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Mock inventory data
const inventoryData: Record<string, { total: number; reserved: number; available: number }> = {
  "essential-tee-280g": { total: 100, reserved: 15, available: 85 },
  "urban-oversized": { total: 50, reserved: 10, available: 40 },
  "performance-pro": { total: 75, reserved: 20, available: 55 },
  "luxury-hoodie": { total: 30, reserved: 5, available: 25 },
  "classic-cotton": { total: 120, reserved: 25, available: 95 },
  "street-oversized": { total: 60, reserved: 12, available: 48 },
};

export const inventoryRouter = router({
  /**
   * Get inventory for a product
   */
  getInventory: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ input }) => {
      const inventory = inventoryData[input.productId];

      if (!inventory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return {
        productId: input.productId,
        ...inventory,
        status: inventory.available > 0 ? "in_stock" : "out_of_stock",
        lowStock: inventory.available < 10,
      };
    }),

  /**
   * Get inventory for multiple products
   */
  getInventoryBatch: publicProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .query(({ input }) => {
      return input.productIds.map((productId) => {
        const inventory = inventoryData[productId];
        return {
          productId,
          ...inventory,
          status: inventory?.available > 0 ? "in_stock" : "out_of_stock",
          lowStock: inventory?.available < 10,
        };
      });
    }),

  /**
   * Check if product is available with quantity
   */
  checkAvailability: publicProcedure
    .input(z.object({ productId: z.string(), quantity: z.number().int().positive() }))
    .query(({ input }) => {
      const inventory = inventoryData[input.productId];

      if (!inventory) {
        return { available: false, reason: "Product not found" };
      }

      if (inventory.available < input.quantity) {
        return {
          available: false,
          reason: `Only ${inventory.available} items available`,
          availableQuantity: inventory.available,
        };
      }

      return { available: true };
    }),

  /**
   * Update inventory (admin only)
   */
  updateInventory: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        totalQuantity: z.number().int().positive(),
        reason: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const inventory = inventoryData[input.productId];

      if (!inventory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      inventory.total = input.totalQuantity;
      inventory.available = input.totalQuantity - inventory.reserved;

      return {
        success: true,
        productId: input.productId,
        ...inventory,
      };
    }),

  /**
   * Reserve inventory (internal use)
   */
  reserveInventory: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        orderId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const inventory = inventoryData[input.productId];

      if (!inventory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (inventory.available < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient inventory. Available: ${inventory.available}`,
        });
      }

      inventory.reserved += input.quantity;
      inventory.available -= input.quantity;

      return {
        success: true,
        productId: input.productId,
        reservedQuantity: input.quantity,
        orderId: input.orderId,
        ...inventory,
      };
    }),

  /**
   * Release reserved inventory
   */
  releaseInventory: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        orderId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const inventory = inventoryData[input.productId];

      if (!inventory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (inventory.reserved < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot release more than reserved",
        });
      }

      inventory.reserved -= input.quantity;
      inventory.available += input.quantity;

      return {
        success: true,
        productId: input.productId,
        releasedQuantity: input.quantity,
        orderId: input.orderId,
        ...inventory,
      };
    }),

  /**
   * Get low stock alerts
   */
  getLowStockAlerts: adminProcedure.query(() => {
    const alerts = Object.entries(inventoryData)
      .filter(([, inventory]) => inventory.available < 10)
      .map(([productId, inventory]) => ({
        productId,
        ...inventory,
        alertLevel: inventory.available < 5 ? "critical" : "warning",
      }));

    return {
      alerts,
      count: alerts.length,
    };
  }),

  /**
   * Get inventory statistics
   */
  getInventoryStats: adminProcedure.query(() => {
    const stats = Object.entries(inventoryData).reduce(
      (acc, [, inventory]) => ({
        totalItems: acc.totalItems + inventory.total,
        reservedItems: acc.reservedItems + inventory.reserved,
        availableItems: acc.availableItems + inventory.available,
        lowStockCount: acc.lowStockCount + (inventory.available < 10 ? 1 : 0),
        outOfStockCount: acc.outOfStockCount + (inventory.available === 0 ? 1 : 0),
      }),
      { totalItems: 0, reservedItems: 0, availableItems: 0, lowStockCount: 0, outOfStockCount: 0 }
    );

    return {
      ...stats,
      utilizationRate: stats.totalItems > 0 ? ((stats.totalItems - stats.availableItems) / stats.totalItems) * 100 : 0,
    };
  }),
});
