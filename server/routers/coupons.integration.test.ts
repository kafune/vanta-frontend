import { describe, it, expect, beforeEach, vi } from "vitest";
import { couponsRouter } from "./coupons";
import { getDb } from "../db";
import { nanoid } from "nanoid";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("Coupons Integration Tests", () => {
  let mockDb: any;
  let couponId: string;
  let userId1: number;
  let userId2: number;
  let orderId1: string;

  beforeEach(() => {
    couponId = `coupon-${Date.now()}`;
    userId1 = 1;
    userId2 = 2;
    orderId1 = `order-${Date.now()}`;

    mockDb = {
      select: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe("Complete coupon lifecycle", () => {
    it("should allow first user to apply coupon, record usage, and block reuse", async () => {
      const now = new Date();
      const coupon = {
        id: couponId,
        code: "OTTO10",
        description: "10% discount",
        discountType: "percentage",
        discountValue: 10,
        minPurchaseAmount: 0,
        maxUses: null,
        currentUses: 0,
        validFrom: new Date(now.getTime() - 1000),
        validUntil: new Date(now.getTime() + 1000),
        isActive: 1,
      };

      // Step 1: First user validates coupon (should succeed)
      const mockSelect1 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect1.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]); // No usage yet

      mockDb.select.mockReturnValue(mockSelect1);

      const caller1 = couponsRouter.createCaller({
        user: { id: userId1, name: "User 1", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const validateResult = await caller1.validate({ code: "OTTO10" });
      expect(validateResult.valid).toBe(true);
      expect(validateResult.coupon?.code).toBe("OTTO10");

      // Step 2: First user applies coupon (should succeed)
      const mockSelect2 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect2.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]); // No usage yet

      mockDb.select.mockReturnValue(mockSelect2);

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(mockUpdate);

      const applyResult = await caller1.applyCoupon({
        code: "OTTO10",
        cartTotal: 10000,
      });

      expect(applyResult.success).toBe(true);
      expect(applyResult.discount).toBe(1000);
      expect(applyResult.couponId).toBe(couponId);

      // Step 3: Record usage for first user
      const mockInsert = {
        values: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.insert.mockReturnValue(mockInsert);

      const recordResult = await caller1.recordUsage({
        couponId,
        orderId: orderId1,
      });

      expect(recordResult.success).toBe(true);
      expect(mockInsert.values).toHaveBeenCalled();

      const usageRecord = mockInsert.values.mock.calls[0][0];
      expect(usageRecord.userId).toBe(userId1);
      expect(usageRecord.couponId).toBe(couponId);

      // Step 4: First user tries to apply coupon again (should fail)
      const mockSelect3 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect3.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([usageRecord]); // Usage exists now

      mockDb.select.mockReturnValue(mockSelect3);

      const revalidateResult = await caller1.validate({ code: "OTTO10" });
      expect(revalidateResult.valid).toBe(false);
      expect(revalidateResult.error).toBe("Você já utilizou este cupom");

      // Step 5: Second user can apply the same coupon
      const mockSelect4 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect4.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]); // No usage for user 2

      mockDb.select.mockReturnValue(mockSelect4);

      const caller2 = couponsRouter.createCaller({
        user: { id: userId2, name: "User 2", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const user2ValidateResult = await caller2.validate({ code: "OTTO10" });
      expect(user2ValidateResult.valid).toBe(true);
      expect(user2ValidateResult.coupon?.code).toBe("OTTO10");
    });

    it("should handle multiple users independently", async () => {
      const now = new Date();
      const coupon = {
        id: couponId,
        code: "OTTO10",
        description: "10% discount",
        discountType: "percentage",
        discountValue: 10,
        minPurchaseAmount: 0,
        maxUses: null,
        currentUses: 2, // Already used twice globally
        validFrom: new Date(now.getTime() - 1000),
        validUntil: new Date(now.getTime() + 1000),
        isActive: 1,
      };

      // User 1 has already used the coupon
      const user1Usage = {
        id: `usage-1`,
        couponId,
        userId: userId1,
        orderId: `order-1`,
        usedAt: new Date(),
      };

      // User 2 has already used the coupon
      const user2Usage = {
        id: `usage-2`,
        couponId,
        userId: userId2,
        orderId: `order-2`,
        usedAt: new Date(),
      };

      // User 3 hasn't used the coupon yet
      const userId3 = 3;

      // User 1 tries to apply (should fail)
      const mockSelect1 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect1.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([user1Usage]); // User 1 has used it

      mockDb.select.mockReturnValue(mockSelect1);

      const caller1 = couponsRouter.createCaller({
        user: { id: userId1, name: "User 1", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller1.applyCoupon({ code: "OTTO10", cartTotal: 10000 })
      ).rejects.toThrow("Você já utilizou este cupom");

      // User 3 tries to apply (should succeed despite global usage count)
      const mockSelect2 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect2.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]); // User 3 hasn't used it

      mockDb.select.mockReturnValue(mockSelect2);

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(mockUpdate);

      const caller3 = couponsRouter.createCaller({
        user: { id: userId3, name: "User 3", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const applyResult = await caller3.applyCoupon({
        code: "OTTO10",
        cartTotal: 10000,
      });

      expect(applyResult.success).toBe(true);
      expect(applyResult.discount).toBe(1000);
    });
  });
});
