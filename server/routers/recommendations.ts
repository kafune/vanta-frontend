/**
 * Product Recommendations Router
 * Handles product recommendations based on user behavior and preferences
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products, reviews, wishlist, orderItems } from "../../drizzle/schema";
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

        // Get highly rated products
        const topRatedProducts = await db
          .select()
          .from(products)
          .orderBy(desc(products.rating))
          .limit(input.limit) as any;

        // Filter out products already in wishlist
        const recommendations = topRatedProducts.filter(
          (p) => !wishlistProductIds.includes(p.id)
        );

        return recommendations.slice(0, input.limit);
      } catch (error) {
        console.error("[Recommendations] Error getting personalized recommendations:", error);
        return [];
      }
    }),

  // Get trending products
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db
          .select()
          .from(products)
          .orderBy(desc(products.views))
          .limit(input.limit) as any;

        if (input.category) {
          query = db
            .select()
            .from(products)
            .where(eq(products.category, input.category))
            .orderBy(desc(products.views))
            .limit(input.limit) as any;
        }

        const trending = await query;
        return trending;
      } catch (error) {
        console.error("[Recommendations] Error getting trending products:", error);
        return [];
      }
    }),

  // Get similar products
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
          .from(products)
          .where(eq(products.id, input.productId))
          .limit(1);

        if (!product.length) return [];

        // Get similar products by category and tags
        const similarProducts = await db
          .select()
          .from(products)
          .where(eq(products.category, product[0].category))
          .orderBy(desc(products.rating))
          .limit(input.limit + 1); // +1 to exclude the original product

        // Filter out the original product
        return similarProducts
          .filter((p) => p.id !== input.productId)
          .slice(0, input.limit);
      } catch (error) {
        console.error("[Recommendations] Error getting similar products:", error);
        return [];
      }
    }),

  // Get recommendations based on category
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const categoryProducts = await db
          .select()
          .from(products)
          .where(eq(products.category, input.category))
          .orderBy(desc(products.rating))
          .limit(input.limit);

        return categoryProducts;
      } catch (error) {
        console.error("[Recommendations] Error getting category recommendations:", error);
        return [];
      }
    }),

  // Get new arrivals
  getNewArrivals: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db.select().from(products).orderBy(desc(products.createdAt));

        if (input.category) {
          query = query.where(eq(products.category, input.category));
        }

        const newArrivals = await query.limit(input.limit);
        return newArrivals;
      } catch (error) {
        console.error("[Recommendations] Error getting new arrivals:", error);
        return [];
      }
    }),

  // Get best sellers
  getBestSellers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db.select().from(products).orderBy(desc(products.sold));

        if (input.category) {
          query = query.where(eq(products.category, input.category));
        }

        const bestSellers = await query.limit(input.limit);
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
        category: z.string().optional(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        if (input.productId) {
          // Return similar products
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, input.productId))
            .limit(1);

          if (!product.length) return [];

          const similar = await db
            .select()
            .from(products)
            .where(eq(products.category, product[0].category))
            .orderBy(desc(products.rating))
            .limit(input.limit + 1);

          return similar.filter((p) => p.id !== input.productId).slice(0, input.limit);
        }

        if (input.category) {
          // Return top products in category
          return await db
            .select()
            .from(products)
            .where(eq(products.category, input.category))
            .orderBy(desc(products.rating))
            .limit(input.limit);
        }

        // Return trending products
        return await db
          .select()
          .from(products)
          .orderBy(desc(products.views))
          .limit(input.limit);
      } catch (error) {
        console.error("[Recommendations] Error getting guest recommendations:", error);
        return [];
      }
    }),
};
