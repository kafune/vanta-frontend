/**
 * GDPR Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const mockUserContext = {
  user: {
    id: 1,
    openId: "test-user-1",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  },
  req: {} as any,
  res: {} as any,
};

describe("GDPR Router", () => {
  it("should export user data", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.gdpr.exportData();

    expect(result.success).toBe(true);
    expect(result.exportId).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.user).toBeDefined();
    expect(result.data.orders).toBeDefined();
    expect(result.data.reviews).toBeDefined();
    expect(result.data.wishlist).toBeDefined();
  });

  it("should get export status", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const exportResult = await caller.gdpr.exportData();
    const statusResult = await caller.gdpr.getExportStatus({
      exportId: exportResult.exportId,
    });

    expect(statusResult.exportId).toBe(exportResult.exportId);
    expect(statusResult.status).toBe("completed");
    expect(statusResult.userId).toBe(mockUserContext.user.id);
  });

  it("should request account deletion", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.gdpr.requestDeletion({
      reason: "No longer needed",
      confirmDeletion: true,
    });

    expect(result.success).toBe(true);
    expect(result.deletionId).toBeDefined();
    expect(result.message).toBe("Account deletion request submitted");
    expect(result.deletionScheduledFor).toBeDefined();
  });

  it("should prevent deletion without confirmation", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    try {
      await caller.gdpr.requestDeletion({
        reason: "No longer needed",
        confirmDeletion: false,
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should cancel deletion request", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Request deletion
    const deletionResult = await caller.gdpr.requestDeletion({
      reason: "No longer needed",
      confirmDeletion: true,
    });

    // Cancel deletion
    const cancelResult = await caller.gdpr.cancelDeletion({
      deletionId: deletionResult.deletionId,
    });

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.message).toBe("Account deletion cancelled");
  });

  it("should get data processing information", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.gdpr.getDataProcessingInfo();

    expect(result.userId).toBe(mockUserContext.user.id);
    expect(result.dataCollected).toBeDefined();
    expect(Array.isArray(result.dataCollected)).toBe(true);
    expect(result.purposes).toBeDefined();
    expect(result.retention).toBeDefined();
    expect(result.rights).toBeDefined();
  });

  it("should get privacy policy", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.gdpr.getPrivacyPolicy();

    expect(result.version).toBeDefined();
    expect(result.lastUpdated).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it("should get deletion status", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Request deletion
    const deletionResult = await caller.gdpr.requestDeletion({
      reason: "No longer needed",
      confirmDeletion: true,
    });

    // Get status
    const statusResult = await caller.gdpr.getDeletionStatus({
      deletionId: deletionResult.deletionId,
    });

    expect(statusResult.deletionId).toBe(deletionResult.deletionId);
    expect(statusResult.status).toBe("pending");
    expect(statusResult.userId).toBe(mockUserContext.user.id);
    expect(statusResult.canCancel).toBe(true);
  });

  it("should include all required data in export", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.gdpr.exportData();

    expect(result.data.user).toBeDefined();
    expect(result.data.orders).toBeDefined();
    expect(result.data.orderItems).toBeDefined();
    expect(result.data.reviews).toBeDefined();
    expect(result.data.wishlist).toBeDefined();
    expect(result.data.emailLogs).toBeDefined();
    expect(result.data.exportedAt).toBeDefined();
  });

  it("should include retention information", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.gdpr.getDataProcessingInfo();

    expect(result.retention.orders).toBeDefined();
    expect(result.retention.reviews).toBeDefined();
    expect(result.retention.emailLogs).toBeDefined();
    expect(result.retention.activityLogs).toBeDefined();
  });
});
