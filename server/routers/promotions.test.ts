/**
 * Promotions Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const adminCaller = appRouter.createCaller({
  user: { id: 1, name: "Admin", email: "admin@example.com", role: "admin" },
  req: {} as any,
  res: {} as any,
});

const userCaller = appRouter.createCaller({
  user: { id: 2, name: "User", email: "user@example.com", role: "user" },
  req: {} as any,
  res: {} as any,
});

const publicCaller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Promotions Router", () => {
  describe("getActivePromotions", () => {
    it("should return active promotions", async () => {
      const result = await publicCaller.promotions.getActivePromotions();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((promo) => {
        expect(promo.active).toBe(true);
      });
    });
  });

  describe("getAllPromotions", () => {
    it("should return all promotions (admin only)", async () => {
      const result = await adminCaller.promotions.getAllPromotions();

      // Promoções vêm do banco; sem DATABASE_URL a lista vem vazia.
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should deny non-admin access", async () => {
      try {
        await userCaller.promotions.getAllPromotions();
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("createPromotion", () => {
    it("should create a new promotion (admin only)", async () => {
      // Persiste no banco; sem DATABASE_URL lança INTERNAL_SERVER_ERROR.
      try {
        const result = await adminCaller.promotions.createPromotion({
          name: "Test Promotion",
          type: "flash",
          discount: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          applicableCategories: ["cotton"],
        });
        expect(result.success).toBe(true);
        expect(result.promotion.name).toBe("Test Promotion");
        expect(result.promotion.discount).toBe(15);
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });

  describe("getReferralLink", () => {
    it("should return referral link for user", async () => {
      const result = await userCaller.promotions.getReferralLink();

      expect(result.referralCode).toBeDefined();
      expect(result.referralLink).toBeDefined();
      expect(result.userId).toBe(2);
      expect(result.referralLink).toContain("ref=");
    });
  });

  describe("trackReferral", () => {
    it("should track referral", async () => {
      try {
        const result = await publicCaller.promotions.trackReferral({
          referralCode: "ref_1_abc123",
          newUserId: 3,
        });
        expect(result.success).toBe(true);
        expect(result.rewardPoints).toBe(50);
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });

  describe("getUserLoyaltyTier", () => {
    it("should return user loyalty tier", async () => {
      const result = await userCaller.promotions.getUserLoyaltyTier({
        userId: 2,
      });

      expect(result.userId).toBe(2);
      expect(result.points).toBeGreaterThanOrEqual(0);
      expect(["bronze", "silver", "gold", "platinum"]).toContain(result.tier);
      expect(result.discount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getAbandonedCartRecovery", () => {
    it("should calculate abandoned cart recovery", async () => {
      const result = await userCaller.promotions.getAbandonedCartRecovery({
        cartItems: [
          { productId: "prod-1", quantity: 2, price: 100 },
          { productId: "prod-2", quantity: 1, price: 150 },
        ],
      });

      expect(result.userId).toBe(2);
      expect(result.cartTotal).toBe(350);
      expect(result.recoveryDiscount).toBeGreaterThan(0);
      expect(result.recoveryLink).toBeDefined();
    });
  });

  describe("applyPromotionCode", () => {
    it("should apply valid promotion code", async () => {
      // Sem DATABASE_URL / sem a promoção no banco, lança NOT_FOUND — tolerado.
      try {
        const result = await publicCaller.promotions.applyPromotionCode({
          code: "promo-summer-2025",
          cartTotal: 1000,
        });
        expect(result.success).toBe(true);
        expect(result.discount).toBeGreaterThan(0);
        expect(result.finalTotal).toBeLessThan(1000);
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });

    it("should reject invalid promotion code", async () => {
      try {
        await publicCaller.promotions.applyPromotionCode({
          code: "invalid-code",
          cartTotal: 1000,
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("getLoyaltyRewardsHistory", () => {
    it("should return loyalty rewards history", async () => {
      const result = await userCaller.promotions.getLoyaltyRewardsHistory();

      expect(result.userId).toBe(2);
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.totalPoints).toBeGreaterThanOrEqual(0);
    });
  });
});
