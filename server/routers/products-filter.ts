/**
 * Product Filters & Search Router
 * Handles advanced product filtering, searching, and sorting
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { collectionProducts, collections, searchQueries } from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";

// Available filter options
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
  "Preto",
  "Branco",
  "Cinza",
  "Azul",
  "Vermelho",
  "Verde",
  "Amarelo",
  "Rosa",
  "Roxo",
  "Laranja",
];

export const productsFilterRouter = {
  // Get available filter options
  getAvailableFilters: publicProcedure.query(async () => {
    return {
      sizes: AVAILABLE_SIZES,
      colors: AVAILABLE_COLORS,
      priceRanges: [
        { label: "Até R$ 50", min: 0, max: 5000 },
        { label: "R$ 50 - R$ 100", min: 5000, max: 10000 },
        { label: "R$ 100 - R$ 200", min: 10000, max: 20000 },
        { label: "Acima de R$ 200", min: 20000, max: 999999 },
      ],
      sortOptions: [
        { value: "relevance", label: "Relevância" },
        { value: "newest", label: "Mais Novos" },
        { value: "price_asc", label: "Menor Preço" },
        { value: "price_desc", label: "Maior Preço" },
        { value: "popularity", label: "Mais Popular" },
      ],
    };
  }),

  // Search products with filters
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        collectionId: z.string().optional(),
        sortBy: z
          .enum(["relevance", "newest", "price_asc", "price_desc", "popularity"])
          .default("relevance"),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { results: [], total: 0 };

      try {
        // Get all collections matching search query
        const matchingCollections = await db
          .select()
          .from(collections);

        const filteredCollections = matchingCollections.filter((c) =>
          c.name.toLowerCase().includes(input.query.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(input.query.toLowerCase()))
        );

        if (filteredCollections.length === 0) {
          return { results: [], total: 0 };
        }

        const collectionIds = filteredCollections.map((c) => c.id);

        // Get products from matching collections
        let query = db
          .select()
          .from(collectionProducts)
          .where(collectionIds.length > 0 ? eq(collectionProducts.collectionId, collectionIds[0]) : undefined);

        // If multiple collections, we need to handle differently
        if (collectionIds.length > 1) {
          const allProducts = await db.select().from(collectionProducts);
          const filtered = allProducts.filter((p) => collectionIds.includes(p.collectionId));

          // Apply sorting
          let sorted = filtered;
          switch (input.sortBy) {
            case "newest":
              sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
            case "price_asc":
            case "price_desc":
            case "popularity":
            case "relevance":
            default:
              sorted = filtered.sort((a, b) => b.displayOrder - a.displayOrder);
          }

          const paginated = sorted.slice(input.offset, input.offset + input.limit);

          return {
            results: paginated.map((p) => {
              const collection = filteredCollections.find((c) => c.id === p.collectionId);
              return {
                id: p.id,
                productId: p.productId,
                collectionId: p.collectionId,
                collectionName: collection?.name || "Unknown",
                collectionImage: collection?.image || null,
                displayOrder: p.displayOrder,
                createdAt: p.createdAt,
              };
            }),
            total: sorted.length,
          };
        }

        // Single collection case
        const products = await query.orderBy(desc(collectionProducts.displayOrder));

        return {
          results: products.slice(input.offset, input.offset + input.limit).map((p) => {
            const collection = filteredCollections[0];
            return {
              id: p.id,
              productId: p.productId,
              collectionId: p.collectionId,
              collectionName: collection.name,
              collectionImage: collection.image,
              displayOrder: p.displayOrder,
              createdAt: p.createdAt,
            };
          }),
          total: products.length,
        };
      } catch (error) {
        console.error("[Products Filter] Error searching products:", error);
        return { results: [], total: 0 };
      }
    }),

  // Filter products by collection
  filterProducts: publicProcedure
    .input(
      z.object({
        collectionId: z.string().optional(),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        sortBy: z
          .enum(["relevance", "newest", "price_asc", "price_desc", "popularity"])
          .default("relevance"),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { results: [], total: 0 };

      try {
        let products = await db.select().from(collectionProducts);

        // Apply collection filter
        if (input.collectionId) {
          products = products.filter((p) => p.collectionId === input.collectionId);
        }

        // Apply sorting
        let sorted = products;
        switch (input.sortBy) {
          case "newest":
            sorted = products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case "price_asc":
            sorted = products.sort((a, b) => a.displayOrder - b.displayOrder);
            break;
          case "price_desc":
            sorted = products.sort((a, b) => b.displayOrder - a.displayOrder);
            break;
          case "popularity":
          case "relevance":
          default:
            sorted = products.sort((a, b) => b.displayOrder - a.displayOrder);
        }

        // Apply pagination
        const paginated = sorted.slice(input.offset, input.offset + input.limit);

        // Get collection info for each product
        const allCollections = await db.select().from(collections);

        return {
          results: paginated.map((p) => {
            const collection = allCollections.find((c) => c.id === p.collectionId);
            return {
              id: p.id,
              productId: p.productId,
              collectionId: p.collectionId,
              collectionName: collection?.name || "Unknown",
              collectionImage: collection?.image || null,
              displayOrder: p.displayOrder,
              createdAt: p.createdAt,
            };
          }),
          total: sorted.length,
        };
      } catch (error) {
        console.error("[Products Filter] Error filtering products:", error);
        return { results: [], total: 0 };
      }
    }),

  // Get products by collection with pagination
  getByCollection: publicProcedure
    .input(
      z.object({
        collectionId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { results: [], total: 0 };

      try {
        const products = await db
          .select()
          .from(collectionProducts)
          .where(eq(collectionProducts.collectionId, input.collectionId));

        const sorted = products.sort((a, b) => a.displayOrder - b.displayOrder);
        const paginated = sorted.slice(input.offset, input.offset + input.limit);

        const collection = await db
          .select()
          .from(collections)
          .where(eq(collections.id, input.collectionId))
          .limit(1);

        return {
          results: paginated.map((p) => ({
            id: p.id,
            productId: p.productId,
            collectionId: p.collectionId,
            collectionName: collection[0]?.name || "Unknown",
            collectionImage: collection[0]?.image || null,
            displayOrder: p.displayOrder,
            createdAt: p.createdAt,
          })),
          total: sorted.length,
        };
      } catch (error) {
        console.error("[Products Filter] Error getting collection products:", error);
        return { results: [], total: 0 };
      }
    }),

  // Get popular products (by display order)
  getPopular: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const products = await db.select().from(collectionProducts);
        const sorted = products.sort((a, b) => b.displayOrder - a.displayOrder);
        const paginated = sorted.slice(0, input.limit);

        const allCollections = await db.select().from(collections);

        return paginated.map((p) => {
          const collection = allCollections.find((c) => c.id === p.collectionId);
          return {
            id: p.id,
            productId: p.productId,
            collectionId: p.collectionId,
            collectionName: collection?.name || "Unknown",
            collectionImage: collection?.image || null,
            displayOrder: p.displayOrder,
            createdAt: p.createdAt,
          };
        });
      } catch (error) {
        console.error("[Products Filter] Error getting popular products:", error);
        return [];
      }
    }),

  // Get new arrivals
  getNewArrivals: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const products = await db.select().from(collectionProducts);
        const sorted = products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const paginated = sorted.slice(0, input.limit);

        const allCollections = await db.select().from(collections);

        return paginated.map((p) => {
          const collection = allCollections.find((c) => c.id === p.collectionId);
          return {
            id: p.id,
            productId: p.productId,
            collectionId: p.collectionId,
            collectionName: collection?.name || "Unknown",
            collectionImage: collection?.image || null,
            displayOrder: p.displayOrder,
            createdAt: p.createdAt,
          };
        });
      } catch (error) {
        console.error("[Products Filter] Error getting new arrivals:", error);
        return [];
      }
    }),

  // Save user search query (for analytics)
  saveSearchQuery: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        resultsCount: z.number().min(0),
        filters: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(searchQueries).values({
        query: input.query.trim(),
        userId: ctx.user.id,
        resultsCount: input.resultsCount,
      });
      return { success: true };
    }),
};
