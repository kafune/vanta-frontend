/**
 * Orders Router
 * Handles order creation, retrieval, and management
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { orders, orderItems } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export const ordersRouter = {
  // Create a new order with items
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            productName: z.string(),
            quantity: z.number().min(1),
            price: z.number().min(0),
            color: z.string().optional(),
            size: z.string().optional(),
            customImageUrl: z.string().optional(),
          })
        ),
        totalPrice: z.number().min(0),
        paymentMethod: z.enum(["stripe", "pix"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const orderId = randomUUID();
      const now = new Date();

      try {
        // Create order
        await db.insert(orders).values({
          id: orderId,
          userId: ctx.user.id,
          status: "pendente",
          totalPrice: Math.round(input.totalPrice * 100), // Store in cents
          createdAt: now,
          updatedAt: now,
        });

        // Create order items
        const itemsToInsert = input.items.map((item) => ({
          id: randomUUID(),
          orderId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: Math.round(item.price * 100), // Store in cents
          color: item.color || null,
          size: item.size || null,
          customImageUrl: item.customImageUrl || null,
          createdAt: now,
        }));

        await db.insert(orderItems).values(itemsToInsert);

        return {
          success: true,
          orderId,
          totalPrice: input.totalPrice,
        };
      } catch (error) {
        console.error("[Orders] Error creating order:", error);
        throw new Error("Failed to create order");
      }
    }),

  // Get user's orders
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    try {
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, ctx.user.id));

      return userOrders;
    } catch (error) {
      console.error("[Orders] Error fetching user orders:", error);
      return [];
    }
  }),

  // Get order details with items
  getById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const order = await db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.id, input.orderId),
              eq(orders.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!order.length) return null;

        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, input.orderId));

        return {
          ...order[0],
          items,
        };
      } catch (error) {
        console.error("[Orders] Error fetching order:", error);
        return null;
      }
    }),

  // Update order status (admin only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"]),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        await db
          .update(orders)
          .set({
            status: input.status,
            trackingNumber: input.trackingNumber,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));

        return { success: true };
      } catch (error) {
        console.error("[Orders] Error updating order status:", error);
        throw new Error("Failed to update order status");
      }
    }),

  // Get all orders (admin only)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Check if user is admin
    if (ctx.user.role !== "admin") {
      return [];
    }

    try {
      const allOrders = await db.select().from(orders);
      return allOrders;
    } catch (error) {
      console.error("[Orders] Error fetching all orders:", error);
      return [];
    }
  }),

  // Get order statistics (admin only)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Check if user is admin
    if (ctx.user.role !== "admin") {
      return null;
    }

    try {
      const allOrders = await db.select().from(orders);

      const stats = {
        totalOrders: allOrders.length,
        totalRevenue: allOrders.reduce((sum, order) => sum + order.totalPrice, 0) / 100, // Convert from cents
        byStatus: {
          pendente: allOrders.filter((o) => o.status === "pendente").length,
          confirmado: allOrders.filter((o) => o.status === "confirmado").length,
          enviado: allOrders.filter((o) => o.status === "enviado").length,
          entregue: allOrders.filter((o) => o.status === "entregue").length,
          cancelado: allOrders.filter((o) => o.status === "cancelado").length,
        },
      };

      return stats;
    } catch (error) {
      console.error("[Orders] Error fetching order stats:", error);
      return null;
    }
  }),
};
