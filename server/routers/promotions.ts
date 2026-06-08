/**
 * Promotions Router
 * Promoções e indicações persistidas no banco (tabelas promotions/referrals).
 * Os tiers de fidelidade são configuração; os pontos saem das indicações reais.
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { promotions, referrals } from "../../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

// Definição dos níveis de fidelidade (configuração de negócio, não dado mockado).
const loyaltyTiers = [
  { tier: "bronze", minPoints: 0, maxPoints: 499, discount: 0 },
  { tier: "silver", minPoints: 500, maxPoints: 999, discount: 5 },
  { tier: "gold", minPoints: 1000, maxPoints: 1999, discount: 10 },
  { tier: "platinum", minPoints: 2000, maxPoints: Number.MAX_SAFE_INTEGER, discount: 15 },
];

const REFERRAL_REWARD_POINTS = 50;

function parseCategories(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapPromotion(p: typeof promotions.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    discount: p.discount,
    startDate: p.startDate,
    endDate: p.endDate,
    active: p.active === 1,
    applicableCategories: parseCategories(p.applicableCategories),
  };
}

// Soma os pontos de indicação de um usuário (base do tier de fidelidade).
async function loyaltyPointsFor(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [{ pts = 0 } = {}] = await db
    .select({ pts: sql<number>`coalesce(sum(${referrals.rewardPoints}), 0)` })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));
  return Number(pts);
}

export const promotionsRouter = router({
  // Promoções ativas e vigentes.
  getActivePromotions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const now = new Date();
    const rows = await db
      .select()
      .from(promotions)
      .where(and(eq(promotions.active, 1), lte(promotions.startDate, now), gte(promotions.endDate, now)));
    return rows.map(mapPromotion);
  }),

  // Todas as promoções (admin).
  getAllPromotions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(promotions);
    return rows.map(mapPromotion);
  }),

  // Cria uma promoção (admin).
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
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const id = `promo-${Math.round(process.uptime() * 1000)}-${Math.floor(Math.random() * 1e6)}`;
      await db.insert(promotions).values({
        id,
        name: input.name,
        type: input.type,
        discount: input.discount,
        startDate: input.startDate,
        endDate: input.endDate,
        active: 1,
        applicableCategories: JSON.stringify(input.applicableCategories),
      });
      const [created] = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
      return { success: true, promotion: mapPromotion(created) };
    }),

  // Link de indicação do usuário.
  getReferralLink: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const referralCode = `ref_${userId}`;
    const referralLink = `${process.env.VITE_APP_URL || "http://localhost:3000"}/signup?ref=${referralCode}`;
    return { referralCode, referralLink, userId };
  }),

  // Registra uma indicação concretizada.
  trackReferral: publicProcedure
    .input(z.object({ referralCode: z.string(), newUserId: z.number() }))
    .mutation(async ({ input }) => {
      const referrerId = parseInt(input.referralCode.split("_")[1] ?? "", 10);
      if (!Number.isFinite(referrerId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid referral code" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(referrals).values({
        referrerId,
        referredUserId: input.newUserId,
        rewardPoints: REFERRAL_REWARD_POINTS,
      });
      return { success: true, referrerId, newUserId: input.newUserId, rewardPoints: REFERRAL_REWARD_POINTS };
    }),

  // Tier de fidelidade do usuário, a partir dos pontos de indicação reais.
  getUserLoyaltyTier: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const points = await loyaltyPointsFor(input.userId);
      const tier = loyaltyTiers.find((t) => points >= t.minPoints && points <= t.maxPoints);
      return {
        userId: input.userId,
        points,
        tier: tier?.tier || "bronze",
        discount: tier?.discount || 0,
        nextTierPoints: tier && tier.maxPoints !== Number.MAX_SAFE_INTEGER ? tier.maxPoints + 1 : null,
      };
    }),

  // Recuperação de carrinho abandonado (cálculo sobre o carrinho informado).
  getAbandonedCartRecovery: protectedProcedure
    .input(
      z.object({
        cartItems: z.array(z.object({ productId: z.string(), quantity: z.number(), price: z.number() })),
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

  // Aplica um código de promoção (pelo id da promoção).
  applyPromotionCode: publicProcedure
    .input(z.object({ code: z.string(), cartTotal: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "NOT_FOUND", message: "Promotion code not found or expired" });
      const now = new Date();
      const [promotion] = await db
        .select()
        .from(promotions)
        .where(and(eq(promotions.id, input.code), eq(promotions.active, 1)))
        .limit(1);

      if (!promotion || promotion.startDate > now || promotion.endDate < now) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Promotion code not found or expired" });
      }

      const discount = (input.cartTotal * promotion.discount) / 100;
      return {
        success: true,
        promotion: promotion.name,
        discount,
        finalTotal: input.cartTotal - discount,
        discountPercentage: promotion.discount,
      };
    }),

  // Histórico de pontos de fidelidade (derivado das indicações reais).
  getLoyaltyRewardsHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const db = await getDb();
    if (!db) return { userId, history: [], totalPoints: 0 };

    const rows = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const history = rows.map((r) => ({
      id: r.id,
      type: "referral" as const,
      points: r.rewardPoints,
      description: "Recompensa por indicação",
      date: r.createdAt,
    }));
    const totalPoints = rows.reduce((s, r) => s + r.rewardPoints, 0);
    return { userId, history, totalPoints };
  }),
});
