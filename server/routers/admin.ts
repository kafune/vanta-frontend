import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { coupons, orders, orderItems, users } from "../../drizzle/schema";
import { eq, and, gte, lte, desc, or, SQL } from "drizzle-orm";

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
          code: input.code,
          description: input.description,
          discountType: input.discountType,
          discountValue: input.discountValue,
          minPurchaseAmount: Math.round(input.minPurchaseAmount * 100),
          maxUses: input.maxUses,
          validFrom: input.validFrom,
          validUntil: input.validUntil,
          isActive: 1,
          currentUses: 0,
        });

        return { success: true, couponId: id };
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
        totalRevenue: totalRevenue / 100,
        totalOrders,
        averageOrderValue: averageOrderValue / 100,
        statusBreakdown,
      };
    }),
  }),

  // Orders management
  orders: router({
    list: adminProcedure
      .input(
        z.object({
          status: z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"]).optional(),
          statuses: z.array(z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"])).optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          priceMin: z.number().optional(),
          priceMax: z.number().optional(),
          sortBy: z.enum(["date", "price", "status"]).default("date"),
          sortOrder: z.enum(["asc", "desc"]).default("desc"),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Build where conditions
        const conditions: any[] = [];

        // Status filter (support both single and multiple)
        if (input.status) {
          conditions.push(eq(orders.status, input.status));
        } else if (input.statuses && input.statuses.length > 0) {
          // Create OR condition for multiple statuses
          const statusConditions = input.statuses.map((s) => eq(orders.status, s));
          if (statusConditions.length === 1) {
            conditions.push(statusConditions[0]);
          } else {
            conditions.push(or(...statusConditions));
          }
        }

        // Date range filter
        if (input.dateFrom) {
          const dateFrom = new Date(input.dateFrom);
          conditions.push(gte(orders.createdAt, dateFrom));
        }
        if (input.dateTo) {
          const dateTo = new Date(input.dateTo);
          dateTo.setHours(23, 59, 59, 999);
          conditions.push(lte(orders.createdAt, dateTo));
        }

        // Price range filter (stored in cents)
        if (input.priceMin !== undefined) {
          conditions.push(gte(orders.totalPrice, Math.round(input.priceMin * 100)));
        }
        if (input.priceMax !== undefined) {
          conditions.push(lte(orders.totalPrice, Math.round(input.priceMax * 100)));
        }

        // Build where clause
        let whereClause = undefined;
        if (conditions.length > 0) {
          whereClause = and(...conditions);
        }

        // Build order by clause
        let orderByClause;
        if (input.sortBy === "price") {
          orderByClause = input.sortOrder === "desc" 
            ? desc(orders.totalPrice)
            : orders.totalPrice;
        } else if (input.sortBy === "status") {
          orderByClause = input.sortOrder === "desc"
            ? desc(orders.status)
            : orders.status;
        } else {
          orderByClause = input.sortOrder === "desc"
            ? desc(orders.createdAt)
            : orders.createdAt;
        }

        // Execute query
        const allOrders = await db
          .select()
          .from(orders)
          .where(whereClause)
          .orderBy(orderByClause)
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
          items,
        };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          orderId: z.string(),
          status: z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"]),
          sendNotification: z.boolean().default(false),
          notificationMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(orders)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));

        return { success: true };
      }),
  }),
});
