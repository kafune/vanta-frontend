import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { coupons } from "../../drizzle/schema";
import { eq, and, gt, lt } from "drizzle-orm";

export const couponsRouter = router({
  validate: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      const coupon = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, input.code.toUpperCase()),
            eq(coupons.isActive, 1),
            lt(coupons.validFrom, now),
            gt(coupons.validUntil, now)
          )
        )
        .limit(1);

      if (!coupon || coupon.length === 0) {
        return {
          valid: false,
          error: "Cupom inválido ou expirado",
        };
      }

      const c = coupon[0];

      // Check max uses
      if (c.maxUses && c.currentUses >= c.maxUses) {
        return {
          valid: false,
          error: "Cupom atingiu o limite de uso",
        };
      }

      return {
        valid: true,
        coupon: {
          id: c.id,
          code: c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minPurchaseAmount: c.minPurchaseAmount,
        },
      };
    }),

  applyCoupon: publicProcedure
    .input(
      z.object({
        code: z.string(),
        cartTotal: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      const coupon = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, input.code.toUpperCase()),
            eq(coupons.isActive, 1),
            lt(coupons.validFrom, now),
            gt(coupons.validUntil, now)
          )
        )
        .limit(1);

      if (!coupon || coupon.length === 0) {
        throw new Error("Cupom inválido ou expirado");
      }

      const c = coupon[0];

      // Check minimum purchase
      if (input.cartTotal < c.minPurchaseAmount) {
        throw new Error(
          `Compra mínima de R$ ${(c.minPurchaseAmount / 100).toFixed(2)} necessária`
        );
      }

      // Check max uses
      if (c.maxUses && c.currentUses >= c.maxUses) {
        throw new Error("Cupom atingiu o limite de uso");
      }

      // Calculate discount
      let discount = 0;
      if (c.discountType === "percentage") {
        discount = Math.round((input.cartTotal * c.discountValue) / 100);
      } else {
        discount = c.discountValue;
      }

      // Increment usage
      await db
        .update(coupons)
        .set({ currentUses: c.currentUses + 1 })
        .where(eq(coupons.id, c.id));

      return {
        success: true,
        discount,
        discountType: c.discountType,
        discountValue: c.discountValue,
      };
    }),
});
