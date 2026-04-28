/**
 * Analytics Router
 * Procedures for tracking and reporting filter usage statistics
 */

import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { filterUsageLogs, orders } from "../../drizzle/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export const analyticsRouter = router({
  /**
   * Log filter usage when admin applies filters
   */
  logFilterUsage: adminProcedure
    .input(
      z.object({
        filterType: z.enum(["status", "date", "price", "sort"]),
        filterValue: z.record(z.string(), z.any()).optional(),
        resultsCount: z.number().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logId = `filter-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(filterUsageLogs).values({
        id: logId,
        userId: ctx.user.id,
        filterType: input.filterType,
        filterValue: input.filterValue ? JSON.stringify(input.filterValue) : "",
        resultsCount: input.resultsCount || 0,
        duration: input.duration || 0,
      } as any);

      return { success: true, logId };
    }),

  /**
   * Get filter usage statistics for a date range
   */
  getFilterStats: adminProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];

      if (input.dateFrom) {
        conditions.push(gte(filterUsageLogs.createdAt, new Date(input.dateFrom)));
      }

      if (input.dateTo) {
        const endDate = new Date(input.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(filterUsageLogs.createdAt, endDate));
      }

      let query: any = db.select().from(filterUsageLogs);
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      const logs = await query;

      // Calculate statistics
      const stats = {
        totalFilters: logs.length,
        byType: {
          status: logs.filter((l: any) => l.filterType === "status").length,
          date: logs.filter((l: any) => l.filterType === "date").length,
          price: logs.filter((l: any) => l.filterType === "price").length,
          sort: logs.filter((l: any) => l.filterType === "sort").length,
        },
        avgResults: logs.length > 0 ? Math.round(logs.reduce((sum: number, l: any) => sum + (l.resultsCount || 0), 0) / logs.length) : 0,
        avgDuration: logs.length > 0 ? Math.round(logs.reduce((sum: number, l: any) => sum + (l.duration || 0), 0) / logs.length) : 0,
        totalResults: logs.reduce((sum: number, l: any) => sum + (l.resultsCount || 0), 0),
      };

      return stats;
    }),

  /**
   * Get top used filters
   */
  getTopFilters: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];

      if (input.dateFrom) {
        conditions.push(gte(filterUsageLogs.createdAt, new Date(input.dateFrom)));
      }

      if (input.dateTo) {
        const endDate = new Date(input.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(filterUsageLogs.createdAt, endDate));
      }

      const logs = await db
        .select()
        .from(filterUsageLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(filterUsageLogs.createdAt));

      // Group by filter type and value
      const filterMap = new Map<string, { count: number; avgResults: number; avgDuration: number }>();

      logs.forEach((log: any) => {
        const key = `${log.filterType}:${log.filterValue || "all"}`;
        const existing = filterMap.get(key) || { count: 0, avgResults: 0, avgDuration: 0 };

        filterMap.set(key, {
          count: existing.count + 1,
          avgResults: (existing.avgResults * existing.count + (log.resultsCount || 0)) / (existing.count + 1),
          avgDuration: (existing.avgDuration * existing.count + (log.duration || 0)) / (existing.count + 1),
        });
      });

      const topFilters = Array.from(filterMap.entries())
        .map(([key, stats]) => {
          const [filterType, filterValue] = key.split(":");
          return {
            filterType,
            filterValue: filterValue === "all" ? null : filterValue,
            usageCount: stats.count,
            avgResults: Math.round(stats.avgResults),
            avgDuration: Math.round(stats.avgDuration),
          };
        })
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, input.limit);

      return topFilters;
    }),

  /**
   * Get filter usage trends over time
   */
  getFilterTrends: adminProcedure
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];

      if (input.dateFrom) {
        conditions.push(gte(filterUsageLogs.createdAt, new Date(input.dateFrom)));
      }

      if (input.dateTo) {
        const endDate = new Date(input.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(filterUsageLogs.createdAt, endDate));
      }

      const logs = await db
        .select()
        .from(filterUsageLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(filterUsageLogs.createdAt);

      // Group by time period
      const trendsMap = new Map<string, { status: number; date: number; price: number; sort: number; total: number }>();

      logs.forEach((log: any) => {
        const date = new Date(log.createdAt);
        let key: string;

        if (input.groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (input.groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week of ${weekStart.toISOString().split("T")[0]}`;
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        const existing = trendsMap.get(key) || { status: 0, date: 0, price: 0, sort: 0, total: 0 };

        trendsMap.set(key, {
          ...existing,
          [log.filterType]: existing[log.filterType as keyof typeof existing] + 1,
          total: existing.total + 1,
        });
      });

      const trends = Array.from(trendsMap.entries()).map(([period, data]) => ({
        period,
        ...data,
      }));

      return trends;
    }),

  /**
   * Get filter usage by user
   */
  getFilterUsageByUser: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];

      if (input.dateFrom) {
        conditions.push(gte(filterUsageLogs.createdAt, new Date(input.dateFrom)));
      }

      if (input.dateTo) {
        const endDate = new Date(input.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(filterUsageLogs.createdAt, endDate));
      }

      let query: any = db.select().from(filterUsageLogs);
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      const logs = await query;

      // Group by user
      const userMap = new Map<number, { count: number; filters: string[] }>();

      logs.forEach((log: any) => {
        const existing = userMap.get(log.userId) || { count: 0, filters: [] };
        const filters = new Set(existing.filters);
        filters.add(log.filterType);

        userMap.set(log.userId, {
          count: existing.count + 1,
          filters: Array.from(filters),
        });
      });

      const userUsage = Array.from(userMap.entries())
        .map(([userId, data]) => ({
          userId,
          usageCount: data.count,
          filterTypes: data.filters,
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, input.limit);

      return userUsage;
    }),
});
