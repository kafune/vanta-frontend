import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { coupons, orders, orderItems } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Admin procedure - check if user is admin
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return next();
});

export const adminRouter = router({
  // Coupons management
  coupons: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allCoupons = await db
        .select()
        .from(coupons)
        .orderBy(desc(coupons.createdAt));

      return allCoupons;
    }),

    create: adminProcedure
      .input(
        z.object({
          code: z.string().min(3).max(50),
          description: z.string().optional(),
          discountType: z.enum(["percentage", "fixed"]),
          discountValue: z.number().min(0),
          minPurchaseAmount: z.number().min(0).default(0),
          maxUses: z.number().optional(),
          validFrom: z.date(),
          validUntil: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const id = `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.insert(coupons).values({
          id,
          code: input.code.toUpperCase(),
          description: input.description,
          discountType: input.discountType,
          discountValue: input.discountValue,
          minPurchaseAmount: input.minPurchaseAmount,
          maxUses: input.maxUses,
          currentUses: 0,
          validFrom: input.validFrom,
          validUntil: input.validUntil,
          isActive: 1,
        });

        return { success: true, id };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          isActive: z.number().optional(),
          maxUses: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: any = {};
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.maxUses !== undefined) updateData.maxUses = input.maxUses;

        await db.update(coupons).set(updateData).where(eq(coupons.id, input.id));

        return { success: true };
      }),
  }),

  // Sales analytics
  sales: router({
    summary: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allOrders = await db.select().from(orders);

      const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalOrders = allOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const statusBreakdown = {
        pendente: allOrders.filter((o) => o.status === "pendente").length,
        confirmado: allOrders.filter((o) => o.status === "confirmado").length,
        enviado: allOrders.filter((o) => o.status === "enviado").length,
        entregue: allOrders.filter((o) => o.status === "entregue").length,
        cancelado: allOrders.filter((o) => o.status === "cancelado").length,
      };

      return {
        totalRevenue: totalRevenue / 100, // Convert from cents
        totalOrders,
        averageOrderValue: averageOrderValue / 100,
        statusBreakdown,
      };
    }),

    recentOrders: adminProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const recentOrders = await db
          .select()
          .from(orders)
          .orderBy(desc(orders.createdAt))
          .limit(input.limit);

        return recentOrders.map((order) => ({
          ...order,
          totalPrice: order.totalPrice / 100,
        }));
      }),
  }),

  // Orders management
  orders: router({
    list: adminProcedure
      .input(
        z.object({
          status: z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"]).optional(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const whereCondition = input.status ? eq(orders.status, input.status) : undefined;

        const allOrders = await db
          .select()
          .from(orders)
          .where(whereCondition)
          .orderBy(desc(orders.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return allOrders.map((order) => ({
          ...order,
          totalPrice: order.totalPrice / 100,
        }));
      }),

    getDetails: adminProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order || order.length === 0) {
          throw new Error("Order not found");
        }

        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, input.orderId));

        return {
          ...order[0],
          totalPrice: order[0].totalPrice / 100,
          items: items.map((item) => ({
            ...item,
            price: item.price / 100,
          })),
        };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          orderId: z.string(),
          status: z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(orders)
          .set({ status: input.status })
          .where(eq(orders.id, input.orderId));

        return { success: true };
      }),
  }),
});
