import { describe, it, expect, beforeEach, vi } from "vitest";
import { couponsRouter } from "./coupons";
import { getDb } from "../db";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("Coupons Router", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe("validate procedure", () => {
    it("should return invalid for non-existent coupon", async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelect);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.validate({ code: "INVALID" });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Cupom inválido ou expirado");
    });

    it("should return invalid if user already used the coupon", async () => {
      const now = new Date();
      const coupon = {
        id: "coupon-1",
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

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      // First call returns the coupon, second call returns coupon usage
      mockSelect.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([{ id: "usage-1" }]);

      mockDb.select.mockReturnValue(mockSelect);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.validate({ code: "OTTO10" });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Você já utilizou este cupom");
    });

    it("should return valid coupon for authenticated user who hasn't used it", async () => {
      const now = new Date();
      const coupon = {
        id: "coupon-1",
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

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      // First call returns the coupon, second call returns no usage
      mockSelect.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]);

      mockDb.select.mockReturnValue(mockSelect);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.validate({ code: "OTTO10" });

      expect(result.valid).toBe(true);
      expect(result.coupon?.code).toBe("OTTO10");
      expect(result.coupon?.discountValue).toBe(10);
    });

    it("should return valid coupon for unauthenticated user", async () => {
      const now = new Date();
      const coupon = {
        id: "coupon-1",
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

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([coupon]),
      };

      mockDb.select.mockReturnValue(mockSelect);

      const caller = couponsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.validate({ code: "OTTO10" });

      expect(result.valid).toBe(true);
      expect(result.coupon?.code).toBe("OTTO10");
    });
  });

  describe("applyCoupon mutation", () => {
    it("should throw error if user already used the coupon", async () => {
      const now = new Date();
      const coupon = {
        id: "coupon-1",
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

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      // First call returns the coupon, second call returns coupon usage
      mockSelect.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([{ id: "usage-1" }]);

      mockDb.select.mockReturnValue(mockSelect);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.applyCoupon({ code: "OTTO10", cartTotal: 10000 })
      ).rejects.toThrow("Você já utilizou este cupom");
    });

    it("should calculate percentage discount correctly", async () => {
      const now = new Date();
      const coupon = {
        id: "coupon-1",
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

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      // First call returns the coupon, second call returns no usage
      mockSelect.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]);

      mockDb.select.mockReturnValue(mockSelect);

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(mockUpdate);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.applyCoupon({
        code: "OTTO10",
        cartTotal: 10000, // €100 in cents
      });

      expect(result.success).toBe(true);
      expect(result.discount).toBe(1000); // 10% of 10000
      expect(result.discountType).toBe("percentage");
      expect(result.couponId).toBe("coupon-1");
    });

    it("should increment coupon usage count", async () => {
      const now = new Date();
      const coupon = {
        id: "coupon-1",
        code: "OTTO10",
        description: "10% discount",
        discountType: "percentage",
        discountValue: 10,
        minPurchaseAmount: 0,
        maxUses: null,
        currentUses: 5,
        validFrom: new Date(now.getTime() - 1000),
        validUntil: new Date(now.getTime() + 1000),
        isActive: 1,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSelect.limit
        .mockResolvedValueOnce([coupon])
        .mockResolvedValueOnce([]);

      mockDb.select.mockReturnValue(mockSelect);

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(mockUpdate);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      await caller.applyCoupon({
        code: "OTTO10",
        cartTotal: 10000,
      });

      expect(mockUpdate.set).toHaveBeenCalledWith({ currentUses: 6 });
    });
  });

  describe("recordUsage mutation", () => {
    it("should throw error if user is not authenticated", async () => {
      const caller = couponsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.recordUsage({
          couponId: "coupon-1",
          orderId: "order-1",
        })
      ).rejects.toThrow("User not authenticated");
    });

    it("should record coupon usage for authenticated user", async () => {
      const mockInsert = {
        values: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.insert.mockReturnValue(mockInsert);

      const caller = couponsRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.recordUsage({
        couponId: "coupon-1",
        orderId: "order-1",
      });

      expect(result.success).toBe(true);
      expect(mockInsert.values).toHaveBeenCalled();

      const callArgs = mockInsert.values.mock.calls[0][0];
      expect(callArgs.couponId).toBe("coupon-1");
      expect(callArgs.userId).toBe(1);
      expect(callArgs.orderId).toBe("order-1");
    });
  });
});
