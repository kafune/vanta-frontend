/**
 * Product Recommendations Router
 * Handles product recommendations based on user behavior and preferences
 * Note: collectionProducts only has id, collectionId, productId, displayOrder, createdAt
 * For full product details, would need to join with products table (not available)
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { collectionProducts, wishlist, orderItems } from "../../drizzle/schema";
import { eq, inArray, desc } from "drizzle-orm";

export const recommendationsRouter = {
  // Get personalized recommendations for authenticated user
  getPersonalized: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        // Get user's wishlist items to understand preferences
        const userWishlist = await db
          .select()
          .from(wishlist)
          .where(eq(wishlist.userId, ctx.user.id));

        const wishlistProductIds = userWishlist.map((w) => w.productId);

        // Get user's order history
        const userOrders = await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, [])); // Would need to join with orders table

        // Get collection products (newest first)
        const recommendations = await db
          .select()
          .from(collectionProducts)
          .orderBy(desc(collectionProducts.createdAt))
          .limit(input.limit);

        // Filter out products already in wishlist
        const filtered = recommendations.filter(
          (p: any) => !wishlistProductIds.includes(p.productId)
        );

        return filtered.slice(0, input.limit);
      } catch (error) {
        console.error("[Recommendations] Error getting personalized recommendations:", error);
        return [];
      }
    }),

  // Get trending products (by display order)
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        collectionId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        if (input.collectionId) {
          const trending = await db
            .select()
            .from(collectionProducts)
            .where(eq(collectionProducts.collectionId, input.collectionId))
            .orderBy(desc(collectionProducts.displayOrder))
            .limit(input.limit);
          return trending;
        }

        const trending = await db
          .select()
          .from(collectionProducts)
          .orderBy(desc(collectionProducts.displayOrder))
          .limit(input.limit);

        return trending;
      } catch (error) {
        console.error("[Recommendations] Error getting trending products:", error);
        return [];
      }
    }),

  // Get similar products (from same collection)
  getSimilar: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        // Get the product
        const product = await db
          .select()
          .from(collectionProducts)
          .where(eq(collectionProducts.productId, input.productId))
          .limit(1);

        if (!product.length) return [];

        // Get similar products from same collection
        const similarProducts = await db
          .select()
          .from(collectionProducts)
          .where(eq(collectionProducts.collectionId, product[0].collectionId))
          .orderBy(desc(collectionProducts.displayOrder))
          .limit(input.limit + 1); // +1 to exclude the original product

        // Filter out the original product
        return similarProducts
          .filter((p) => p.productId !== input.productId)
          .slice(0, input.limit);
      } catch (error) {
        console.error("[Recommendations] Error getting similar products:", error);
        return [];
      }
    }),

  // Get recommendations based on collection
  getByCollection: publicProcedure
    .input(
      z.object({
        collectionId: z.string(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const collectionItems = await db
          .select()
          .from(collectionProducts)
          .where(eq(collectionProducts.collectionId, input.collectionId))
          .orderBy(desc(collectionProducts.displayOrder))
          .limit(input.limit);

        return collectionItems;
      } catch (error) {
        console.error("[Recommendations] Error getting collection recommendations:", error);
        return [];
      }
    }),

  // Get new arrivals (newest products)
  getNewArrivals: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        collectionId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        if (input.collectionId) {
          const newArrivals = await db
            .select()
            .from(collectionProducts)
            .where(eq(collectionProducts.collectionId, input.collectionId))
            .orderBy(desc(collectionProducts.createdAt))
            .limit(input.limit);
          return newArrivals;
        }

        const newArrivals = await db
          .select()
          .from(collectionProducts)
          .orderBy(desc(collectionProducts.createdAt))
          .limit(input.limit);

        return newArrivals;
      } catch (error) {
        console.error("[Recommendations] Error getting new arrivals:", error);
        return [];
      }
    }),

  // Get best sellers (by display order - assuming higher order = more popular)
  getBestSellers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        collectionId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        if (input.collectionId) {
          const bestSellers = await db
            .select()
            .from(collectionProducts)
            .where(eq(collectionProducts.collectionId, input.collectionId))
            .orderBy(desc(collectionProducts.displayOrder))
            .limit(input.limit);
          return bestSellers;
        }

        const bestSellers = await db
          .select()
          .from(collectionProducts)
          .orderBy(desc(collectionProducts.displayOrder))
          .limit(input.limit);

        return bestSellers;
      } catch (error) {
        console.error("[Recommendations] Error getting best sellers:", error);
        return [];
      }
    }),

  // Get recommendations for guest users (based on current product)
  getForGuest: publicProcedure
    .input(
      z.object({
        productId: z.string().optional(),
        collectionId: z.string().optional(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        if (input.productId) {
          // Return similar products from same collection
          const product = await db
            .select()
            .from(collectionProducts)
            .where(eq(collectionProducts.productId, input.productId))
            .limit(1);

          if (!product.length) return [];

          const similar = await db
            .select()
            .from(collectionProducts)
            .where(eq(collectionProducts.collectionId, product[0].collectionId))
            .orderBy(desc(collectionProducts.displayOrder))
            .limit(input.limit + 1);

          return similar.filter((p) => p.productId !== input.productId).slice(0, input.limit);
        }

        if (input.collectionId) {
          // Return top products in collection
          return await db
            .select()
            .from(collectionProducts)
            .where(eq(collectionProducts.collectionId, input.collectionId))
            .orderBy(desc(collectionProducts.displayOrder))
            .limit(input.limit);
        }

        // Return newest products
        return await db
          .select()
          .from(collectionProducts)
          .orderBy(desc(collectionProducts.createdAt))
          .limit(input.limit);
      } catch (error) {
        console.error("[Recommendations] Error getting guest recommendations:", error);
        return [];
      }
    }),
};
