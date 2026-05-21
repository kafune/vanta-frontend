/**
 * Monitoring Router
 * Handles performance monitoring, error tracking, and system health
 */

import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Mock monitoring data
const performanceMetrics = {
  pageLoadTime: 1250,
  apiResponseTime: 145,
  databaseQueryTime: 89,
  cacheHitRate: 0.87,
  errorRate: 0.02,
};

const errorLogs: Array<{
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  stack?: string;
  userId?: number;
}> = [];

const systemHealth = {
  database: "healthy",
  cache: "healthy",
  api: "healthy",
  storage: "healthy",
  uptime: 99.98,
};

export const monitoringRouter = router({
  /**
   * Get performance metrics
   */
  getPerformanceMetrics: adminProcedure.query(() => {
    return {
      ...performanceMetrics,
      timestamp: new Date(),
    };
  }),

  /**
   * Get system health status
   */
  getSystemHealth: adminProcedure.query(() => {
    return {
      ...systemHealth,
      timestamp: new Date(),
      allHealthy: Object.values(systemHealth).every(
        (v) => v === "healthy" || typeof v === "number"
      ),
    };
  }),

  /**
   * Get error logs
   */
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

      return {
        logs: logs.slice(-input.limit),
        total: errorLogs.length,
      };
    }),

  /**
   * Log an error
   */
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
      const errorLog = {
        id: `err_${Date.now()}`,
        timestamp: new Date(),
        ...input,
      };

      errorLogs.push(errorLog);

      // Keep only last 1000 errors
      if (errorLogs.length > 1000) {
        errorLogs.shift();
      }

      return { success: true, errorId: errorLog.id };
    }),

  /**
   * Get API response time statistics
   */
  getApiStats: adminProcedure.query(() => {
    return {
      averageResponseTime: 145,
      p95ResponseTime: 320,
      p99ResponseTime: 580,
      requestsPerSecond: 125,
      totalRequests: 1250000,
      timestamp: new Date(),
    };
  }),

  /**
   * Get database performance metrics
   */
  getDatabaseStats: adminProcedure.query(() => {
    return {
      averageQueryTime: 89,
      slowQueries: 12,
      totalQueries: 450000,
      cacheHitRate: 0.87,
      connectionPoolSize: 10,
      activeConnections: 3,
      timestamp: new Date(),
    };
  }),

  /**
   * Get user activity metrics
   */
  getUserActivityMetrics: adminProcedure.query(() => {
    return {
      activeUsers: 342,
      newUsersToday: 45,
      sessionsToday: 1250,
      averageSessionDuration: 8.5, // minutes
      bounceRate: 0.32,
      timestamp: new Date(),
    };
  }),

  /**
   * Get revenue metrics
   */
  getRevenueMetrics: adminProcedure.query(() => {
    return {
      totalRevenue: 125000,
      revenueToday: 3450,
      revenueThisWeek: 24500,
      revenueThisMonth: 98000,
      averageOrderValue: 245.5,
      conversionRate: 0.035,
      timestamp: new Date(),
    };
  }),

  /**
   * Get product performance metrics
   */
  getProductMetrics: adminProcedure.query(() => {
    return {
      topProducts: [
        { productId: "essential-tee-280g", sales: 450, revenue: 22500 },
        { productId: "urban-oversized", sales: 320, revenue: 19200 },
        { productId: "performance-pro", sales: 280, revenue: 18200 },
      ],
      lowPerformingProducts: [
        { productId: "luxury-hoodie", sales: 15, revenue: 1500 },
        { productId: "classic-cotton", sales: 8, revenue: 400 },
      ],
      timestamp: new Date(),
    };
  }),

  /**
   * Get alert configuration
   */
  getAlertConfig: adminProcedure.query(() => {
    return {
      errorRateThreshold: 0.05,
      responseTimeThreshold: 500,
      downtimeThreshold: 1, // minutes
      lowStockThreshold: 10,
      alertChannels: ["email", "slack"],
      timestamp: new Date(),
    };
  }),
});
