/**
 * Analytics Router Tests
 * Test suite for filter usage tracking and analytics
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { filterUsageLogs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock context for testing
const mockAdminContext = {
  user: { id: 1, name: "Admin User", role: "admin" as const, email: "admin@vanta.com" },
  req: {} as any,
  res: {} as any,
};

describe("Analytics Router", () => {
  let testLogIds: string[] = [];

  beforeAll(async () => {
    // Setup: Create test filter usage logs
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const baseTime = Date.now();
    const testLogs = [
      {
        id: `log-status-1-${baseTime}`,
        userId: 1,
        filterType: "status" as const,
        filterValue: JSON.stringify({ statuses: ["pendente"] }),
        resultsCount: 10,
        duration: 150,
      },
      {
        id: `log-status-2-${baseTime}`,
        userId: 1,
        filterType: "status" as const,
        filterValue: JSON.stringify({ statuses: ["confirmado"] }),
        resultsCount: 5,
        duration: 120,
      },
      {
        id: `log-date-1-${baseTime}`,
        userId: 1,
        filterType: "date" as const,
        filterValue: JSON.stringify({ dateFrom: "2026-04-01" }),
        resultsCount: 20,
        duration: 200,
      },
      {
        id: `log-price-1-${baseTime}`,
        userId: 1,
        filterType: "price" as const,
        filterValue: JSON.stringify({ priceMin: 50, priceMax: 200 }),
        resultsCount: 8,
        duration: 180,
      },
      {
        id: `log-sort-1-${baseTime}`,
        userId: 1,
        filterType: "sort" as const,
        filterValue: JSON.stringify({ sortBy: "price", sortOrder: "asc" }),
        resultsCount: 15,
        duration: 100,
      },
    ];

    for (const log of testLogs) {
      await db.insert(filterUsageLogs).values(log as any);
      testLogIds.push(log.id);
    }
  });

  afterAll(async () => {
    // Cleanup: Remove test logs
    const db = await getDb();
    if (!db) return;

    try {
      for (const logId of testLogIds) {
        await db.delete(filterUsageLogs).where(eq(filterUsageLogs.id, logId));
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  it("should log filter usage", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.analytics.logFilterUsage({
      filterType: "status",
      filterValue: { statuses: ["enviado"] },
      resultsCount: 12,
      duration: 140,
    });

    expect(result.success).toBe(true);
    expect(result.logId).toBeDefined();

    // Cleanup
    if (result.logId) {
      testLogIds.push(result.logId);
    }
  });

  it("should get filter statistics", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const stats = await caller.analytics.getFilterStats({});

    expect(stats).toBeDefined();
    expect(stats.totalFilters).toBeGreaterThan(0);
    expect(stats.byType).toBeDefined();
    expect(stats.avgResults).toBeGreaterThan(0);
    expect(stats.avgDuration).toBeGreaterThan(0);
  });

  it("should get top used filters", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const topFilters = await caller.analytics.getTopFilters({ limit: 5 });

    expect(Array.isArray(topFilters)).toBe(true);
    expect(topFilters.length).toBeGreaterThan(0);

    // Verify structure
    topFilters.forEach((filter) => {
      expect(filter.filterType).toBeDefined();
      expect(filter.usageCount).toBeGreaterThan(0);
      expect(filter.avgResults).toBeGreaterThanOrEqual(0);
      expect(filter.avgDuration).toBeGreaterThanOrEqual(0);
    });
  });

  it("should get filter trends", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const trends = await caller.analytics.getFilterTrends({ groupBy: "day" });

    expect(Array.isArray(trends)).toBe(true);

    // Verify structure
    trends.forEach((trend) => {
      expect(trend.period).toBeDefined();
      expect(trend.total).toBeGreaterThanOrEqual(0);
    });
  });

  it("should get filter usage by user", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const userUsage = await caller.analytics.getFilterUsageByUser({ limit: 10 });

    expect(Array.isArray(userUsage)).toBe(true);

    // Verify structure
    userUsage.forEach((user) => {
      expect(user.userId).toBeGreaterThan(0);
      expect(user.usageCount).toBeGreaterThan(0);
      expect(Array.isArray(user.filterTypes)).toBe(true);
    });
  });

  it("should filter statistics by date range", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const today = new Date().toISOString().split("T")[0];
    const stats = await caller.analytics.getFilterStats({
      dateFrom: today,
      dateTo: today,
    });

    expect(stats).toBeDefined();
    expect(stats.totalFilters).toBeGreaterThanOrEqual(0);
  });

  it("should return empty results for non-matching date range", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const pastDate = new Date();
    pastDate.setFullYear(2020);

    const stats = await caller.analytics.getFilterStats({
      dateFrom: pastDate.toISOString().split("T")[0],
      dateTo: pastDate.toISOString().split("T")[0],
    });

    expect(stats.totalFilters).toBe(0);
  });

  it("should calculate correct statistics breakdown", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const stats = await caller.analytics.getFilterStats({});

    expect(stats.byType.status).toBeGreaterThanOrEqual(0);
    expect(stats.byType.date).toBeGreaterThanOrEqual(0);
    expect(stats.byType.price).toBeGreaterThanOrEqual(0);
    expect(stats.byType.sort).toBeGreaterThanOrEqual(0);

    const total = stats.byType.status + stats.byType.date + stats.byType.price + stats.byType.sort;
    expect(total).toBe(stats.totalFilters);
  });

  it("should respect limit parameter in top filters", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const topFilters5 = await caller.analytics.getTopFilters({ limit: 5 });
    const topFilters10 = await caller.analytics.getTopFilters({ limit: 10 });

    expect(topFilters5.length).toBeLessThanOrEqual(5);
    expect(topFilters10.length).toBeLessThanOrEqual(10);
  });
});
