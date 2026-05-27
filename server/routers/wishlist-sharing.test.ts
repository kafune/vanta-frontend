/**
 * Wishlist Sharing Router Tests
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

const mockUser2Context = {
  user: {
    id: 2,
    openId: "test-user-2",
    name: "Test User 2",
    email: "test2@example.com",
    role: "user" as const,
  },
  req: {} as any,
  res: {} as any,
};

describe("Wishlist Sharing Router", () => {
  it("should create a wishlist share", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.wishlistSharing.createShare({
      expiresIn: "7days",
    });

    expect(result.success).toBe(true);
    expect(result.shareToken).toBeDefined();
    expect(result.shareUrl).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });

  it("should create a share that never expires", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.wishlistSharing.createShare({
      expiresIn: "never",
    });

    expect(result.success).toBe(true);
    expect(result.expiresAt).toBeNull();
  });

  it("should get shared wishlist", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Create share
    const shareResult = await caller.wishlistSharing.createShare({
      expiresIn: "30days",
    });

    // Get shared wishlist
    const getResult = await caller.wishlistSharing.getSharedWishlist({
      shareToken: shareResult.shareToken,
    });

    expect(getResult).not.toBeNull();
    expect(getResult?.shareToken).toBe(shareResult.shareToken);
    expect(Array.isArray(getResult?.wishlistItems)).toBe(true);
  });

  it("should reject invalid share token", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.wishlistSharing.getSharedWishlist({
      shareToken: "INVALID",
    });

    expect(result).toBeNull();
  });

  it("should get user's active shares", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Create shares
    await caller.wishlistSharing.createShare({ expiresIn: "7days" });
    await caller.wishlistSharing.createShare({ expiresIn: "never" });

    // Get user's shares
    const result = await caller.wishlistSharing.getMyShares();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should revoke a share", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Create share
    const shareResult = await caller.wishlistSharing.createShare({
      expiresIn: "7days",
    });

    // Revoke share
    const revokeResult = await caller.wishlistSharing.revokeShare({
      shareToken: shareResult.shareToken,
    });

    expect(revokeResult.success).toBe(true);

    // Try to get revoked share
    const getResult = await caller.wishlistSharing.getSharedWishlist({
      shareToken: shareResult.shareToken,
    });

    expect(getResult).toBeNull();
  });

  it("should prevent revoking another user's share", async () => {
    const caller1 = appRouter.createCaller(mockUserContext);
    const caller2 = appRouter.createCaller(mockUser2Context);

    // User 1 creates share
    const shareResult = await caller1.wishlistSharing.createShare({
      expiresIn: "7days",
    });

    // User 2 tries to revoke it
    try {
      await caller2.wishlistSharing.revokeShare({
        shareToken: shareResult.shareToken,
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should get share info", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Create share
    const shareResult = await caller.wishlistSharing.createShare({
      expiresIn: "7days",
    });

    // Get share info
    const infoResult = await caller.wishlistSharing.getShareInfo({
      shareToken: shareResult.shareToken,
    });

    expect(infoResult).not.toBeNull();
    expect(infoResult?.isValid).toBe(true);
    expect(infoResult?.isExpired).toBe(false);
  });

  it("should check if share is valid", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Create share
    const shareResult = await caller.wishlistSharing.createShare({
      expiresIn: "7days",
    });

    // Check validity
    const isValid = await caller.wishlistSharing.isShareValid({
      shareToken: shareResult.shareToken,
    });

    expect(isValid).toBe(true);
  });

  it("should return false for invalid share token", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const isValid = await caller.wishlistSharing.isShareValid({
      shareToken: "INVALID",
    });

    expect(isValid).toBe(false);
  });
});
