/**
 * Inventory Router
 * Estoque real a partir de `products.stock` (não há coluna de "reservado", então
 * reservar = baixar estoque; liberar = devolver). Sem dados mockados.
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { products as productsTable } from "../../drizzle/schema";
import { eq, inArray, sql } from "drizzle-orm";

const LOW_STOCK_THRESHOLD = 10;

function shape(productId: string, stock: number) {
  return {
    productId,
    total: stock,
    reserved: 0,
    available: stock,
    status: stock > 0 ? "in_stock" : "out_of_stock",
    lowStock: stock < LOW_STOCK_THRESHOLD,
  };
}

async function readStock(productId: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ stock: productsTable.stock })
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  return rows.length > 0 ? rows[0].stock : null;
}

export const inventoryRouter = router({
  // Estoque de um produto.
  getInventory: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const stock = await readStock(input.productId);
      if (stock === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      return shape(input.productId, stock);
    }),

  // Estoque de vários produtos.
  getInventoryBatch: publicProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db || input.productIds.length === 0) {
        return input.productIds.map((id) => shape(id, 0));
      }
      const rows = await db
        .select({ id: productsTable.id, stock: productsTable.stock })
        .from(productsTable)
        .where(inArray(productsTable.id, input.productIds));
      const byId = new Map(rows.map((r) => [r.id, r.stock]));
      return input.productIds.map((id) => shape(id, byId.get(id) ?? 0));
    }),

  // Disponibilidade para uma quantidade.
  checkAvailability: publicProcedure
    .input(z.object({ productId: z.string(), quantity: z.number().int().positive() }))
    .query(async ({ input }) => {
      const stock = await readStock(input.productId);
      if (stock === null) {
        return { available: false, reason: "Product not found" };
      }
      if (stock < input.quantity) {
        return {
          available: false,
          reason: `Only ${stock} items available`,
          availableQuantity: stock,
        };
      }
      return { available: true };
    }),

  // Define o estoque total (admin).
  updateInventory: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        totalQuantity: z.number().int().min(0),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const current = await readStock(input.productId);
      if (current === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      await db
        .update(productsTable)
        .set({ stock: input.totalQuantity })
        .where(eq(productsTable.id, input.productId));
      return { success: true, ...shape(input.productId, input.totalQuantity) };
    }),

  // Reserva estoque (baixa do disponível).
  reserveInventory: protectedProcedure
    .input(z.object({ productId: z.string(), quantity: z.number().int().positive(), orderId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const stock = await readStock(input.productId);
      if (stock === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      if (stock < input.quantity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient inventory. Available: ${stock}` });
      }
      const newStock = stock - input.quantity;
      await db.update(productsTable).set({ stock: newStock }).where(eq(productsTable.id, input.productId));
      return {
        success: true,
        reservedQuantity: input.quantity,
        orderId: input.orderId,
        ...shape(input.productId, newStock),
      };
    }),

  // Libera estoque reservado (devolve ao disponível).
  releaseInventory: protectedProcedure
    .input(z.object({ productId: z.string(), quantity: z.number().int().positive(), orderId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const stock = await readStock(input.productId);
      if (stock === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      const newStock = stock + input.quantity;
      await db.update(productsTable).set({ stock: newStock }).where(eq(productsTable.id, input.productId));
      return {
        success: true,
        releasedQuantity: input.quantity,
        orderId: input.orderId,
        ...shape(input.productId, newStock),
      };
    }),

  // Alertas de estoque baixo (admin).
  getLowStockAlerts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { alerts: [], count: 0 };
    const rows = await db
      .select({ id: productsTable.id, stock: productsTable.stock })
      .from(productsTable)
      .where(sql`${productsTable.stock} < ${LOW_STOCK_THRESHOLD}`);
    const alerts = rows.map((r) => ({
      ...shape(r.id, r.stock),
      alertLevel: r.stock < 5 ? "critical" : "warning",
    }));
    return { alerts, count: alerts.length };
  }),

  // Estatísticas de estoque (admin).
  getInventoryStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { totalItems: 0, reservedItems: 0, availableItems: 0, lowStockCount: 0, outOfStockCount: 0, utilizationRate: 0 };
    }
    const [agg = { total: 0, low: 0, out: 0 }] = await db
      .select({
        total: sql<number>`coalesce(sum(${productsTable.stock}), 0)`,
        low: sql<number>`sum(case when ${productsTable.stock} < ${LOW_STOCK_THRESHOLD} then 1 else 0 end)`,
        out: sql<number>`sum(case when ${productsTable.stock} = 0 then 1 else 0 end)`,
      })
      .from(productsTable)
      .where(eq(productsTable.active, 1));
    const totalItems = Number(agg.total);
    return {
      totalItems,
      reservedItems: 0,
      availableItems: totalItems,
      lowStockCount: Number(agg.low),
      outOfStockCount: Number(agg.out),
      utilizationRate: 0,
    };
  }),
});
