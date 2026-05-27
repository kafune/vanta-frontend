/**
 * Newsletter Subscription Router Tests
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

const mockAdminContext = {
  user: {
    id: 2,
    openId: "test-admin-1",
    name: "Test Admin",
    email: "admin@example.com",
    role: "admin" as const,
  },
  req: {} as any,
  res: {} as any,
};

describe("Newsletter Router", () => {
  it("should subscribe to newsletter", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.newsletter.subscribe({
      email: "subscriber@example.com",
      preferences: ["promotions", "updates"],
    });

    expect(result.success).toBe(true);
    expect(result.subscriptionId).toBeDefined();
    expect(result.message).toBe("Successfully subscribed to newsletter");
  });

  it("should subscribe with default preferences", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.newsletter.subscribe({
      email: "subscriber2@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("should prevent duplicate subscriptions", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // First subscription
    await caller.newsletter.subscribe({
      email: "duplicate@example.com",
    });

    // Try duplicate
    try {
      await caller.newsletter.subscribe({
        email: "duplicate@example.com",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should unsubscribe from newsletter", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Subscribe first
    await caller.newsletter.subscribe({
      email: "unsubscribe@example.com",
    });

    // Unsubscribe
    const result = await caller.newsletter.unsubscribe({
      email: "unsubscribe@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Successfully unsubscribed from newsletter");
  });

  it("should get subscription status", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Subscribe
    await caller.newsletter.subscribe({
      email: "status@example.com",
      preferences: ["promotions"],
    });

    // Get status
    const result = await caller.newsletter.getStatus({
      email: "status@example.com",
    });

    expect(result.isSubscribed).toBe(true);
    expect(result.email).toBe("status@example.com");
  });

  it("should return not subscribed for unknown email", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.newsletter.getStatus({
      email: "unknown@example.com",
    });

    expect(result.isSubscribed).toBe(false);
  });

  it("should update subscription preferences", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.newsletter.updatePreferences({
      preferences: ["promotions", "sales"],
    });

    expect(result.success).toBe(true);
    expect(result.preferences).toContain("promotions");
    expect(result.preferences).toContain("sales");
  });

  it("should get user's subscription info", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.newsletter.getMySubscription();

    expect(result).not.toBeNull();
    expect(result?.email).toBeDefined();
    expect(result?.isSubscribed).toBeDefined();
  });

  it("should get subscription count (admin only)", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.newsletter.getSubscriptionCount();

    expect(result).not.toBeNull();
    expect(result?.totalSubscriptions).toBeDefined();
    expect(result?.byPreference).toBeDefined();
  });

  it("should prevent non-admin from getting subscription count", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    try {
      await caller.newsletter.getSubscriptionCount();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});
