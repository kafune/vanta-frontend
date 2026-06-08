/**
 * Monitoring Router
 * Métricas de negócio derivadas do banco (receita/produtos/usuários) e métricas
 * reais do processo (uptime/memória). Sem números de infra inventados — as que
 * não têm instrumentação real (latência de API, pool, cache hit) foram removidas.
 */

import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { orders, orderItems, users } from "../../drizzle/schema";
import { desc, gte, ne, sql } from "drizzle-orm";

// Log de erros de runtime (mecanismo real, em memória — não é mock de dados).
const errorLogs: Array<{
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  stack?: string;
  userId?: number;
}> = [];

const round = (n: number) => Math.round(n * 100) / 100;

export const monitoringRouter = router({
  // Métricas reais do processo Node (uptime e memória).
  getPerformanceMetrics: adminProcedure.query(() => {
    const mem = process.memoryUsage();
    return {
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssMb: round(mem.rss / 1024 / 1024),
      memoryHeapUsedMb: round(mem.heapUsed / 1024 / 1024),
      memoryHeapTotalMb: round(mem.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
      timestamp: new Date(),
    };
  }),

  // Saúde do sistema: ping real no banco + uptime do processo.
  getSystemHealth: adminProcedure.query(async () => {
    let database: "healthy" | "down" = "down";
    const db = await getDb();
    if (db) {
      try {
        await db.select({ ok: sql<number>`1` }).from(users).limit(1);
        database = "healthy";
      } catch {
        database = "down";
      }
    }
    return {
      database,
      api: "healthy" as const,
      uptimeSeconds: Math.round(process.uptime()),
      allHealthy: database === "healthy",
      timestamp: new Date(),
    };
  }),

  // Logs de erro (mais recentes), com filtro opcional por nível.
  getErrorLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        level: z.enum(["error", "warning", "info"]).optional(),
      })
    )
    .query(({ input }) => {
      let logs = [...errorLogs];
      if (input.level) {
        logs = logs.filter((log) => log.level === input.level);
      }
      return { logs: logs.slice(-input.limit), total: errorLogs.length };
    }),

  // Registra um erro de runtime (chamado pelo client/servidor).
  logError: publicProcedure
    .input(
      z.object({
        level: z.enum(["error", "warning", "info"]),
        message: z.string(),
        stack: z.string().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const errorLog = { id: `err_${errorLogs.length + 1}_${Math.round(process.uptime() * 1000)}`, timestamp: new Date(), ...input };
      errorLogs.push(errorLog);
      if (errorLogs.length > 1000) errorLogs.shift();
      return { success: true, errorId: errorLog.id };
    }),

  // Atividade de usuários derivada da tabela users.
  getUserActivityMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    const base = { totalUsers: 0, activeUsers: 0, newUsersToday: 0, timestamp: new Date() };
    if (!db) return base;

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [{ total = 0 } = {}] = await db.select({ total: sql<number>`count(*)` }).from(users);
    const [{ active = 0 } = {}] = await db
      .select({ active: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.lastSignedIn, last30));
    const [{ created = 0 } = {}] = await db
      .select({ created: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, startToday));

    return {
      totalUsers: Number(total),
      activeUsers: Number(active),
      newUsersToday: Number(created),
      timestamp: new Date(),
    };
  }),

  // Receita real a partir de pedidos não cancelados.
  getRevenueMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    const base = {
      totalRevenue: 0,
      revenueToday: 0,
      revenueThisWeek: 0,
      revenueThisMonth: 0,
      averageOrderValue: 0,
      orderCount: 0,
      timestamp: new Date(),
    };
    if (!db) return base;

    const rows = await db
      .select({ total: orders.totalPrice, createdAt: orders.createdAt })
      .from(orders)
      .where(ne(orders.status, "cancelado"));

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sumReais = (rs: typeof rows) => rs.reduce((s, r) => s + r.total, 0) / 100;
    const totalRevenue = sumReais(rows);
    const orderCount = rows.length;

    return {
      totalRevenue: round(totalRevenue),
      revenueToday: round(sumReais(rows.filter((r) => new Date(r.createdAt) >= startToday))),
      revenueThisWeek: round(sumReais(rows.filter((r) => new Date(r.createdAt) >= startWeek))),
      revenueThisMonth: round(sumReais(rows.filter((r) => new Date(r.createdAt) >= startMonth))),
      averageOrderValue: orderCount > 0 ? round(totalRevenue / orderCount) : 0,
      orderCount,
      timestamp: new Date(),
    };
  }),

  // Desempenho de produtos real a partir dos itens de pedido.
  getProductMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { topProducts: [], lowPerformingProducts: [], timestamp: new Date() };

    const rows = await db
      .select({
        productId: orderItems.productId,
        sales: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<number>`sum(${orderItems.price} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId)
      .orderBy(desc(sql`sum(${orderItems.quantity})`));

    const mapped = rows.map((r) => ({
      productId: r.productId,
      sales: Number(r.sales),
      revenue: round(Number(r.revenue) / 100),
    }));

    return {
      topProducts: mapped.slice(0, 5),
      lowPerformingProducts: [...mapped].reverse().slice(0, 5),
      timestamp: new Date(),
    };
  }),

  // Configuração de alertas (limiares operacionais).
  getAlertConfig: adminProcedure.query(() => {
    return {
      errorRateThreshold: 0.05,
      responseTimeThreshold: 500,
      downtimeThreshold: 1,
      lowStockThreshold: 10,
      alertChannels: ["email"],
      timestamp: new Date(),
    };
  }),
});
