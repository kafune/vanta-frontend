import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { wishlist } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const wishlistRouter = router({
  /**
   * Add item to wishlist
   * Only authenticated users can add to wishlist
   */
  addToWishlist: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        productName: z.string(),
        productImage: z.string().optional(),
        productPrice: z.number(),
        productCategory: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already in wishlist
      const existing = await db
        .select()
        .from(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, input.productId)
          )
        )
        .limit(1);
      const existingItem = existing.length > 0 ? existing[0] : null;

      if (existingItem) {
        return { success: false, message: "Produto já está na wishlist" };
      }

      // Add to wishlist
      const id = `wishlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(wishlist).values({
        id,
        userId,
        productId: input.productId,
        productName: input.productName,
        productImage: input.productImage,
        productPrice: Math.round(input.productPrice * 100), // Convert to cents
        productCategory: input.productCategory,
      });

      return { success: true, message: "Adicionado à wishlist" };
    }),

  /**
   * Remove item from wishlist
   */
  removeFromWishlist: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, input.productId)
          )
        );

      return { success: true, message: "Removido da wishlist" };
    }),

  /**
   * Get user's wishlist
   */
  getWishlist: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const items = await db
      .select()
      .from(wishlist)
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.addedAt));

    return items.map((item) => ({
      ...item,
      productPrice: item.productPrice / 100, // Convert back to euros
    }));
  }),

  /**
   * Check if product is in wishlist
   */
  isInWishlist: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const item = await db
        .select()
        .from(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, input.productId)
          )
        )
        .limit(1);

      return item.length > 0;
    }),

  /**
   * Get wishlist count
   */
  getWishlistCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const items = await db
      .select()
      .from(wishlist)
      .where(eq(wishlist.userId, userId));

    return items.length;
  }),

  /**
   * Clear entire wishlist
   */
  clearWishlist: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(wishlist).where(eq(wishlist.userId, userId));

    return { success: true, message: "Wishlist limpa" };
  }),
});
