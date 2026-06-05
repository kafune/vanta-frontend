import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Hardcoded products matching the frontend collection
const PRODUCTS = [
  { id: "essential-tee-280g", name: "Essential Tee 280g", category: "cotton", price: 89, description: "Camiseta essencial de algodão 280g", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: "urban-oversized", name: "Urban Oversized", category: "oversized", price: 109, description: "Camiseta oversized urbana", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: "performance-pro", name: "Performance Pro", category: "dryfit", price: 99, description: "Camiseta performance dry fit", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: "luxury-hoodie", name: "Moletom canguru", category: "hoodie", price: 189, description: "Moletom premium com canguru", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: "classic-cotton", name: "Classic Cotton", category: "cotton", price: 79, description: "Camiseta clássica de algodão", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: "street-oversized", name: "Street Oversized", category: "oversized", price: 119, description: "Camiseta oversized street", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
];

const CATEGORIES = ["cotton", "oversized", "dryfit", "hoodie"];

const TRENDING_SEARCHES = [
  "Moletom",
  "Camiseta oversized",
  "Hoodie premium",
  "Sweatshirt",
  "Camiseta manga comprida",
];

export const searchRouter = router({
  // Search products by query with filters
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        category: z.string().optional(),
        sortBy: z.enum(["relevance", "price-asc", "price-desc", "newest"]).default("relevance"),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // Filter products
      let results = PRODUCTS.filter((product) => {
        const matchesQuery =
          product.name.toLowerCase().includes(input.query.toLowerCase()) ||
          product.description.toLowerCase().includes(input.query.toLowerCase());

        const matchesCategory = !input.category || product.category === input.category;

        return matchesQuery && matchesCategory;
      });

      // Sort results
      switch (input.sortBy) {
        case "price-asc":
          results.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          results.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case "relevance":
        default:
          // Prioritize name matches over description
          results.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(input.query.toLowerCase());
            const bNameMatch = b.name.toLowerCase().includes(input.query.toLowerCase());
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            return 0;
          });
          break;
      }

      const total = results.length;
      const paginatedResults = results.slice(input.offset, input.offset + input.limit);

      return {
        results: paginatedResults,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get search suggestions (autocomplete)
  suggestions: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(50),
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      const suggestions = PRODUCTS
        .filter((p) => p.name.toLowerCase().includes(input.query.toLowerCase()))
        .map((p) => p.name)
        .slice(0, input.limit);

      return suggestions;
    }),

  // Get available categories for filtering
  categories: publicProcedure.query(async () => {
    return CATEGORIES;
  }),

  // Get trending/popular searches
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      return TRENDING_SEARCHES.slice(0, input.limit);
    }),
});
