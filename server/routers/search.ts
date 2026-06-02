import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const searchRouter = router({
  // Busca produtos por texto, com filtro de categoria e ordenação.
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
      const db = await getDb();
      if (!db) return { results: [], total: 0, hasMore: false };

      const rows = await db.select().from(products).where(eq(products.active, 1));
      const q = input.query.toLowerCase();

      let results = rows.filter((p) => {
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q);
        const matchesCategory = !input.category || p.category === input.category;
        return matchesQuery && matchesCategory;
      });

      switch (input.sortBy) {
        case "price-asc":
          results.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          results.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "relevance":
        default:
          results.sort((a, b) => {
            const aName = a.name.toLowerCase().includes(q);
            const bName = b.name.toLowerCase().includes(q);
            if (aName && !bName) return -1;
            if (!aName && bName) return 1;
            return a.displayOrder - b.displayOrder;
          });
          break;
      }

      const total = results.length;
      const paginated = results.slice(input.offset, input.offset + input.limit).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price, // em centavos
        image: p.image,
        description: p.description ?? "",
        createdAt: p.createdAt,
      }));

      return { results: paginated, total, hasMore: input.offset + input.limit < total };
    }),

  // Sugestões de autocomplete (nomes de produtos que casam com o texto).
  suggestions: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(50),
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [] as string[];

      const rows = await db.select().from(products).where(eq(products.active, 1));
      const q = input.query.toLowerCase();
      return rows
        .filter((p) => p.name.toLowerCase().includes(q))
        .map((p) => p.name)
        .slice(0, input.limit);
    }),

  // Categorias disponíveis (distintas, a partir do catálogo).
  categories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [] as string[];
    const rows = await db.select().from(products).where(eq(products.active, 1));
    return Array.from(new Set(rows.map((p) => p.category)));
  }),

  // Termos populares: nomes dos produtos em destaque/topo da vitrine (dados reais).
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [] as string[];
      const rows = await db.select().from(products).where(eq(products.active, 1));
      return rows
        .sort((a, b) => {
          if (a.featured !== b.featured) return b.featured - a.featured;
          return a.displayOrder - b.displayOrder;
        })
        .map((p) => p.name)
        .slice(0, input.limit);
    }),
});
