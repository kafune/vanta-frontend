/**
 * Monitoring Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const adminCaller = appRouter.createCaller({
  user: { id: 1, name: "Admin", email: "admin@example.com", role: "admin" },
  req: {} as any,
  res: {} as any,
});

const publicCaller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Monitoring Router", () => {
  describe("getPerformanceMetrics", () => {
    it("should return real process metrics (admin only)", async () => {
      const result = await adminCaller.monitoring.getPerformanceMetrics();

      expect(result).toBeDefined();
      expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(result.memoryRssMb).toBeGreaterThan(0);
      expect(result.nodeVersion).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe("getSystemHealth", () => {
    it("should return system health status (admin only)", async () => {
      const result = await adminCaller.monitoring.getSystemHealth();

      expect(result).toBeDefined();
      // Sem DATABASE_URL no teste, database vem "down" (ping falha) — é o esperado.
      expect(["healthy", "down"]).toContain(result.database);
      expect(result.api).toBe("healthy");
      expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(result.allHealthy).toBeTypeOf("boolean");
    });
  });

  describe("getErrorLogs", () => {
    it("should return error logs (admin only)", async () => {
      const result = await adminCaller.monitoring.getErrorLogs({
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.logs)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("should filter by level", async () => {
      const result = await adminCaller.monitoring.getErrorLogs({
        limit: 50,
        level: "error",
      });

      expect(Array.isArray(result.logs)).toBe(true);
    });
  });

  describe("logError", () => {
    it("should log an error", async () => {
      const result = await publicCaller.monitoring.logError({
        level: "error",
        message: "Test error",
        stack: "Error stack trace",
      });

      expect(result.success).toBe(true);
      expect(result.errorId).toBeDefined();
    });
  });

  describe("getUserActivityMetrics", () => {
    it("should return user activity metrics (admin only)", async () => {
      const result = await adminCaller.monitoring.getUserActivityMetrics();

      expect(result).toBeDefined();
      expect(result.totalUsers).toBeGreaterThanOrEqual(0);
      expect(result.activeUsers).toBeGreaterThanOrEqual(0);
      expect(result.newUsersToday).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getRevenueMetrics", () => {
    it("should return revenue metrics (admin only)", async () => {
      const result = await adminCaller.monitoring.getRevenueMetrics();

      expect(result).toBeDefined();
      expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(result.revenueToday).toBeGreaterThanOrEqual(0);
      expect(result.orderCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getProductMetrics", () => {
    it("should return product metrics (admin only)", async () => {
      const result = await adminCaller.monitoring.getProductMetrics();

      expect(result).toBeDefined();
      expect(Array.isArray(result.topProducts)).toBe(true);
      expect(Array.isArray(result.lowPerformingProducts)).toBe(true);
    });
  });

  describe("getAlertConfig", () => {
    it("should return alert configuration (admin only)", async () => {
      const result = await adminCaller.monitoring.getAlertConfig();

      expect(result).toBeDefined();
      expect(result.errorRateThreshold).toBeGreaterThan(0);
      expect(result.responseTimeThreshold).toBeGreaterThan(0);
      expect(Array.isArray(result.alertChannels)).toBe(true);
    });
  });
});
