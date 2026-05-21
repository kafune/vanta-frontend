/**
 * Promotions Router
 * Handles seasonal promotions, referral programs, and loyalty rewards
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Mock promotions data
const promotionsData = [
  {
    id: "promo-summer-2025",
    name: "Summer Sale 2025",
    type: "seasonal",
    discount: 20,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-08-31"),
    active: true,
    applicableCategories: ["cotton", "dryfit"],
  },
  {
    id: "promo-black-friday",
    name: "Black Friday 2025",
    type: "seasonal",
    discount: 30,
    startDate: new Date("2025-11-28"),
    endDate: new Date("2025-12-01"),
    active: false,
    applicableCategories: ["all"],
  },
];

const referralData: Record<string, { referrerId: number; referralCount: number; rewardPoints: number }> = {};

const loyaltyTiers = [
  { tier: "bronze", minPoints: 0, maxPoints: 499, discount: 0 },
  { tier: "silver", minPoints: 500, maxPoints: 999, discount: 5 },
  { tier: "gold", minPoints: 1000, maxPoints: 1999, discount: 10 },
  { tier: "platinum", minPoints: 2000, maxPoints: Infinity, discount: 15 },
];

export const promotionsRouter = router({
  /**
   * Get active promotions
   */
  getActivePromotions: publicProcedure.query(() => {
    const now = new Date();
    return promotionsData.filter(
      (p) => p.active && p.startDate <= now && p.endDate >= now
    );
  }),

  /**
   * Get all promotions (admin)
   */
  getAllPromotions: adminProcedure.query(() => {
    return promotionsData;
  }),

  /**
   * Create a new promotion (admin)
   */
  createPromotion: adminProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(["seasonal", "flash", "referral", "loyalty"]),
        discount: z.number().min(0).max(100),
        startDate: z.date(),
        endDate: z.date(),
        applicableCategories: z.array(z.string()),
      })
    )
    .mutation(({ input }) => {
      const promotion = {
        id: `promo-${Date.now()}`,
        ...input,
        active: true,
      };

      promotionsData.push(promotion);
      return { success: true, promotion };
    }),

  /**
   * Get referral link for user
   */
  getReferralLink: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const referralCode = `ref_${userId}_${Math.random().toString(36).substr(2, 9)}`;
    const referralLink = `${process.env.VITE_APP_URL || "http://localhost:3000"}/signup?ref=${referralCode}`;

    return {
      referralCode,
      referralLink,
      userId,
    };
  }),

  /**
   * Track referral
   */
  trackReferral: publicProcedure
    .input(
      z.object({
        referralCode: z.string(),
        newUserId: z.number(),
      })
    )
    .mutation(({ input }) => {
      const referrerId = parseInt(input.referralCode.split("_")[1]);

      if (!referralData[referrerId.toString()]) {
        referralData[referrerId.toString()] = {
          referrerId,
          referralCount: 0,
          rewardPoints: 0,
        };
      }

      referralData[referrerId.toString()].referralCount += 1;
      referralData[referrerId.toString()].rewardPoints += 50;

      return {
        success: true,
        referrerId,
        newUserId: input.newUserId,
        rewardPoints: 50,
      };
    }),

  /**
   * Get user loyalty tier
   */
  getUserLoyaltyTier: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => {
      const points = (input.userId * 137) % 2500;

      const tier = loyaltyTiers.find(
        (t) => points >= t.minPoints && points <= t.maxPoints
      );

      return {
        userId: input.userId,
        points,
        tier: tier?.tier || "bronze",
        discount: tier?.discount || 0,
        nextTierPoints: tier?.maxPoints ? tier.maxPoints + 1 : null,
      };
    }),

  /**
   * Get abandoned cart recovery email
   */
  getAbandonedCartRecovery: protectedProcedure
    .input(
      z.object({
        cartItems: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number(),
            price: z.number(),
          })
        ),
      })
    )
    .query(({ input, ctx }) => {
      const cartTotal = input.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const recoveryDiscount = Math.min(cartTotal * 0.1, 50);

      return {
        userId: ctx.user?.id,
        cartTotal,
        recoveryDiscount,
        recoveryLink: `${process.env.VITE_APP_URL || "http://localhost:3000"}/cart?recovery=true&discount=${recoveryDiscount}`,
        expiresIn: "24h",
      };
    }),

  /**
   * Apply promotion code
   */
  applyPromotionCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
        cartTotal: z.number(),
      })
    )
    .query(({ input }) => {
      const promotion = promotionsData.find((p) => p.id === input.code);

      if (!promotion || !promotion.active) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Promotion code not found or expired",
        });
      }

      const discount = (input.cartTotal * promotion.discount) / 100;
      const finalTotal = input.cartTotal - discount;

      return {
        success: true,
        promotion: promotion.name,
        discount,
        finalTotal,
        discountPercentage: promotion.discount,
      };
    }),

  /**
   * Get loyalty rewards history
   */
  getLoyaltyRewardsHistory: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    return {
      userId,
      history: [
        {
          id: 1,
          type: "purchase",
          points: 100,
          description: "Purchase of R$ 500",
          date: new Date(),
        },
        {
          id: 2,
          type: "referral",
          points: 50,
          description: "Referral reward",
          date: new Date(),
        },
      ],
      totalPoints: 150,
    };
  }),
});
