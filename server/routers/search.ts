/**
 * Search Router — busca no catálogo real (tabela products) e analytics de busca.
 * "trending" sai das buscas mais frequentes (searchQueries); sem dados ainda,
 * cai para as categorias reais do catálogo. Nada hardcoded.
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { products as productsTable, searchQueries } from "../../drizzle/schema";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";

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
      const db = await getDb();
      if (!db) return { results: [], total: 0, hasMore: false };

      const term = `%${input.query}%`;
      const conditions = [
        eq(productsTable.active, 1),
        or(like(productsTable.name, term), like(productsTable.description, term))!,
      ];
      if (input.category) {
        conditions.push(eq(productsTable.category, input.category));
      }
      const where = and(...conditions);

      const orderBy =
        input.sortBy === "price-asc"
          ? [asc(productsTable.price)]
          : input.sortBy === "price-desc"
            ? [desc(productsTable.price)]
            : input.sortBy === "newest"
              ? [desc(productsTable.createdAt)]
              : [asc(productsTable.displayOrder)];

      const [{ count } = { count: 0 }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(where);
      const total = Number(count);

      const rows = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          category: productsTable.category,
          price: productsTable.price,
          description: productsTable.description,
          image: productsTable.image,
        })
        .from(productsTable)
        .where(where)
        .orderBy(...orderBy)
        .limit(input.limit)
        .offset(input.offset);

      return {
        results: rows,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get search suggestions (autocomplete) — nomes de produtos reais
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

      const rows = await db
        .select({ name: productsTable.name })
        .from(productsTable)
        .where(and(eq(productsTable.active, 1), like(productsTable.name, `%${input.query}%`)))
        .limit(input.limit);

      return rows.map((r) => r.name);
    }),

  // Get available categories for filtering — distintas no catálogo
  categories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [] as string[];

    const rows = await db
      .selectDistinct({ category: productsTable.category })
      .from(productsTable)
      .where(eq(productsTable.active, 1));

    return rows.map((r) => r.category);
  }),

  // Get trending/popular searches — buscas mais frequentes; fallback: categorias
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [] as string[];

      const top = await db
        .select({
          query: searchQueries.query,
          hits: sql<number>`count(*)`,
        })
        .from(searchQueries)
        .groupBy(searchQueries.query)
        .orderBy(desc(sql`count(*)`))
        .limit(input.limit);

      if (top.length > 0) {
        return top.map((r) => r.query);
      }

      // Sem histórico de busca ainda: usa categorias reais do catálogo.
      const cats = await db
        .selectDistinct({ category: productsTable.category })
        .from(productsTable)
        .where(eq(productsTable.active, 1))
        .limit(input.limit);
      return cats.map((r) => r.category);
    }),
});
