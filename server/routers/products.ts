/**
 * Products Router
 * Handles product listing, filtering, and pagination
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Mock products data - in production, this would come from database
const MOCK_PRODUCTS = [
  { id: "essential-tee-280g", name: "Essential Tee 280g", category: "cotton", price: 8900, originalPrice: null, tag: "Bestseller" },
  { id: "urban-oversized", name: "Urban Oversized", category: "oversized", price: 10900, originalPrice: null, tag: "Novo" },
  { id: "performance-pro", name: "Performance Pro", category: "dryfit", price: 9900, originalPrice: 12900, tag: "Promoção" },
  { id: "luxury-hoodie", name: "Moletom canguru", category: "hoodie", price: 18900, originalPrice: null, tag: "Premium" },
  { id: "classic-cotton", name: "Classic Cotton", category: "cotton", price: 7900, originalPrice: null, tag: null },
  { id: "street-oversized", name: "Street Oversized", category: "oversized", price: 11900, originalPrice: null, tag: "Exclusivo" },
  { id: "tech-dryfit", name: "Tech DryFit", category: "dryfit", price: 10900, originalPrice: null, tag: null },
  { id: "premium-cotton", name: "Premium Cotton 350g", category: "cotton", price: 12900, originalPrice: null, tag: "Premium" },
  { id: "oversized-comfort", name: "Oversized Comfort", category: "oversized", price: 9900, originalPrice: null, tag: null },
  { id: "hoodie-deluxe", name: "Hoodie Deluxe", category: "hoodie", price: 21900, originalPrice: null, tag: "Novo" },
  { id: "dryfit-sport", name: "DryFit Sport", category: "dryfit", price: 8900, originalPrice: null, tag: null },
  { id: "cotton-classic", name: "Cotton Classic", category: "cotton", price: 6900, originalPrice: null, tag: null },
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
      switch (input.sort) {
        case "price-asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          // Reverse order for newest first (in real app, would use createdAt)
          filtered.reverse();
          break;
        case "relevance":
        default:
          // Keep original order
          break;
      }

      // Calculate pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / input.limit);
      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;

      const products = filtered.slice(start, end).map((p) => ({
        ...p,
        image: CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
      }));

      return {
        products,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages,
          hasNextPage: input.page < totalPages,
          hasPreviousPage: input.page > 1,
        },
      };
    }),

  /**
   * Get product by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === input.id);
      if (!product) {
        throw new Error("Product not found");
      }
      return {
        ...product,
        image: CATEGORY_IMAGES[product.category as keyof typeof CATEGORY_IMAGES],
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
        }));

      return related;
    }),

  /**
   * Get featured products (with tags)
   */
  getFeatured: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(6),
      })
    )
    .query(({ input }) => {
      const featured = MOCK_PRODUCTS.filter((p) => p.tag)
        .slice(0, input.limit)
        .map((p) => ({
          ...p,
          image: CATEGORY_IMAGES[p.category as keyof typeof CATEGORY_IMAGES],
        }));

      return featured;
    }),

  /**
   * Get category statistics
   */
  getCategoryStats: publicProcedure.query(() => {
    const categories = ["cotton", "oversized", "dryfit", "hoodie"] as const;
    const stats = categories.map((cat) => ({
      category: cat,
      count: MOCK_PRODUCTS.filter((p) => p.category === cat).length,
      avgPrice: Math.round(
        MOCK_PRODUCTS.filter((p) => p.category === cat).reduce((sum, p) => sum + p.price, 0) /
          Math.max(1, MOCK_PRODUCTS.filter((p) => p.category === cat).length)
      ),
    }));

    return stats;
  }),
});
