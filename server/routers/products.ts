/**
 * Products Router
 * Handles product listing, filtering, and pagination
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { products as productsTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock products data - fallback for demo
const MOCK_PRODUCTS = [
  { id: "essential-tee-280g", name: "Essential Tee 280g", category: "cotton", price: 8900, originalPrice: null, tag: "Bestseller", stock: 50 },
  { id: "urban-oversized", name: "Urban Oversized", category: "oversized", price: 10900, originalPrice: null, tag: "Novo", stock: 30 },
  { id: "performance-pro", name: "Performance Pro", category: "dryfit", price: 9900, originalPrice: 12900, tag: "Promoção", stock: 0 },
  { id: "luxury-hoodie", name: "Moletom canguru", category: "hoodie", price: 18900, originalPrice: null, tag: "Premium", stock: 15 },
  { id: "classic-cotton", name: "Classic Cotton", category: "cotton", price: 7900, originalPrice: null, tag: null, stock: 100 },
  { id: "street-oversized", name: "Street Oversized", category: "oversized", price: 11900, originalPrice: null, tag: "Exclusivo", stock: 20 },
  { id: "tech-dryfit", name: "Tech DryFit", category: "dryfit", price: 10900, originalPrice: null, tag: null, stock: 40 },
  { id: "premium-cotton", name: "Premium Cotton 350g", category: "cotton", price: 12900, originalPrice: null, tag: "Premium", stock: 25 },
  { id: "oversized-comfort", name: "Oversized Comfort", category: "oversized", price: 9900, originalPrice: null, tag: null, stock: 35 },
  { id: "hoodie-deluxe", name: "Hoodie Deluxe", category: "hoodie", price: 21900, originalPrice: null, tag: "Novo", stock: 10 },
  { id: "dryfit-sport", name: "DryFit Sport", category: "dryfit", price: 8900, originalPrice: null, tag: null, stock: 60 },
  { id: "cotton-classic", name: "Cotton Classic", category: "cotton", price: 6900, originalPrice: null, tag: null, stock: 80 },
];

const CATEGORY_IMAGES = {
  cotton: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-cotton-6C3ChDmVfT5oxo4PDhFrbf.webp",
  oversized: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-oversized-fkaeTb24PqHL7RPsvGjmFY.webp",
  dryfit: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-dryfit-fpbTLZXZdYCMYERV2Myz4g.webp",
  hoodie: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-hoodie-Z6BCR25Eed5suvi3SXqxEz.webp",
};

export const productsRouter = router({
  /**
   * Get paginated products with optional filtering
   * Supports: category filter, search, sorting, and pagination
   */
  getPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(12),
        category: z.enum(["todos", "cotton", "oversized", "dryfit", "hoodie"]).default("todos"),
        search: z.string().optional(),
        sort: z.enum(["relevance", "price-asc", "price-desc", "newest"]).default("relevance"),
      })
    )
    .query(({ input }) => {
      let filtered = MOCK_PRODUCTS;

      // Apply category filter
      if (input.category !== "todos") {
        filtered = filtered.filter((p) => p.category === input.category);
      }

      // Apply search filter
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (input.sort === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (input.sort === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (input.sort === "newest") {
        filtered.reverse();
      }

      // Apply pagination
      const skip = (input.page - 1) * input.limit;
      const paginatedProducts = filtered.slice(skip, skip + input.limit);
      const totalPages = Math.ceil(filtered.length / input.limit);

      return {
        products: paginatedProducts.map((p) => ({
          ...p,
          image: CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
          images: JSON.stringify([
            CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
          ]),
          sizes: ["P", "M", "G", "GG"],
          colors: ["Preto", "Branco", "Cinza", "Azul"],
          description: `Premium ${p.category} apparel with superior quality and design.`,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages,
          hasNextPage: input.page < totalPages,
          hasPreviousPage: input.page > 1,
        },
      };
    }),

  /**
   * Get product by ID with full details including stock and images
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Try to get from database first
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const dbProduct = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, input.id))
          .limit(1);

        if (dbProduct.length > 0) {
          const p = dbProduct[0];
          return {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            tag: p.tag,
            image: p.image || CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
            images: p.images ? (typeof p.images === "string" ? p.images : JSON.stringify([p.images])) : JSON.stringify([p.image]),
            sizes: p.sizes ? (typeof p.sizes === "string" ? JSON.parse(p.sizes) : p.sizes) : ["P", "M", "G", "GG"],
            colors: p.colors ? (typeof p.colors === "string" ? JSON.parse(p.colors) : p.colors) : ["Preto", "Branco", "Cinza", "Azul"],
            description: p.description || `Premium ${p.category} apparel with superior quality and design.`,
            stock: p.stock ?? 0,
          };
        }
      } catch (error) {
        console.error("Error fetching from database:", error);
      }

      // Fallback to mock data
      const product = MOCK_PRODUCTS.find((p) => p.id === input.id);
      if (!product) {
        throw new Error("Product not found");
      }
      return {
        ...product,
        image: CATEGORY_IMAGES[product.category as keyof typeof CATEGORY_IMAGES],
        images: JSON.stringify([
          CATEGORY_IMAGES[product.category as keyof typeof CATEGORY_IMAGES],
        ]),
        description: `Premium ${product.category} apparel with superior quality and design.`,
        sizes: ["P", "M", "G", "GG"],
        colors: ["Preto", "Branco", "Cinza", "Azul"],
      };
    }),

  /**
   * Get related products (same category, exclude current product)
   */
  getRelated: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().int().min(1).max(20).default(4),
      })
    )
    .query(({ input }) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === input.productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const related = MOCK_PRODUCTS.filter(
        (p) => p.category === product.category && p.id !== input.productId
      )
        .slice(0, input.limit)
        .map((p) => ({
          ...p,
          image: CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
          images: JSON.stringify([
            CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
          ]),
          sizes: ["P", "M", "G", "GG"],
          colors: ["Preto", "Branco", "Cinza", "Azul"],
          description: `Premium ${p.category} apparel with superior quality and design.`,
        }));

      return related;
    }),

  /**
   * Get category statistics
   */
  getCategoryStats: publicProcedure.query(() => {
    const stats: Record<string, { category: string; count: number; totalPrice: number }> = {};

    MOCK_PRODUCTS.forEach((p) => {
      if (!stats[p.category]) {
        stats[p.category] = { category: p.category, count: 0, totalPrice: 0 };
      }
      stats[p.category].count++;
      stats[p.category].totalPrice += p.price;
    });

    return Object.values(stats).map((stat) => ({
      ...stat,
      avgPrice: Math.round(stat.totalPrice / stat.count),
    }));
  }),

  /**
   * Get featured products
   */
  getFeatured: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(6),
      })
    )
    .query(({ input }) => {
      const featured = MOCK_PRODUCTS.filter((p) => p.tag !== null)
        .slice(0, input.limit)
        .map((p) => ({
          ...p,
          image: CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
          images: JSON.stringify([
            CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
          ]),
          sizes: ["P", "M", "G", "GG"],
          colors: ["Preto", "Branco", "Cinza", "Azul"],
          description: `Premium ${p.category} apparel with superior quality and design.`,
        }));

      return featured;
    }),
});
