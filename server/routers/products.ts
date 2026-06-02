/**
 * Products Router
 * Catálogo de produtos servido a partir do banco (tabela `products`).
 */

import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, reviews } from "../../drizzle/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

type ProductRow = typeof products.$inferSelect;

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Formato "card" usado nas listagens (grades, relacionados, destaques).
function toCard(p: ProductRow) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    tag: p.tag,
    image: p.image,
  };
}

export const productsRouter = router({
  /**
   * Lista paginada com filtro de categoria, busca e ordenação.
   */
  getPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(12),
        category: z.string().default("todos"),
        search: z.string().optional(),
        sort: z.enum(["relevance", "price-asc", "price-desc", "newest"]).default("relevance"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const emptyResult = {
        products: [] as ReturnType<typeof toCard>[],
        pagination: {
          page: input.page,
          limit: input.limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      if (!db) return emptyResult;

      let rows = await db.select().from(products).where(eq(products.active, 1));

      if (input.category !== "todos") {
        rows = rows.filter((p) => p.category === input.category);
      }
      if (input.search) {
        const q = input.search.toLowerCase();
        rows = rows.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        );
      }

      switch (input.sort) {
        case "price-asc":
          rows.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          rows.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "relevance":
        default:
          rows.sort((a, b) => a.displayOrder - b.displayOrder);
          break;
      }

      const total = rows.length;
      const totalPages = Math.ceil(total / input.limit);
      const start = (input.page - 1) * input.limit;
      const paged = rows.slice(start, start + input.limit);

      return {
        products: paged.map(toCard),
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
   * Produto por ID (slug). Inclui descrição, tamanhos, cores e rating/avaliações
   * agregados da tabela de reviews aprovados (0 quando não há avaliações).
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Product not found");

      const found = await db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.active, 1)))
        .limit(1);

      const product = found[0];
      if (!product) throw new Error("Product not found");

      const stats = await db
        .select({ avg: sql<number>`AVG(${reviews.rating})`, count: sql<number>`COUNT(*)` })
        .from(reviews)
        .where(and(eq(reviews.productId, product.id), eq(reviews.status, "aprovado")));

      const reviewsCount = Number(stats[0]?.count ?? 0);
      const rating = reviewsCount > 0 ? Math.round(Number(stats[0]?.avg ?? 0) * 10) / 10 : 0;

      return {
        ...toCard(product),
        description: product.description ?? "",
        images: parseJsonArray(product.images),
        sizes: parseJsonArray(product.sizes),
        colors: parseJsonArray(product.colors),
        rating,
        reviews: reviewsCount,
      };
    }),

  /**
   * Produtos relacionados (mesma categoria, exclui o atual).
   */
  getRelated: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().int().min(1).max(20).default(4),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const found = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);
      const product = found[0];
      if (!product) return [];

      const related = await db
        .select()
        .from(products)
        .where(and(eq(products.category, product.category), eq(products.active, 1)))
        .orderBy(asc(products.displayOrder));

      return related
        .filter((p) => p.id !== input.productId)
        .slice(0, input.limit)
        .map(toCard);
    }),

  /**
   * Produtos em destaque (featured = 1, com fallback para os que têm tag).
   */
  getFeatured: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(6),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(products)
        .where(eq(products.active, 1))
        .orderBy(asc(products.displayOrder));

      const featured = rows.filter((p) => p.featured === 1);
      const pool = featured.length > 0 ? featured : rows.filter((p) => p.tag);

      return pool.slice(0, input.limit).map(toCard);
    }),

  /**
   * Estatísticas por categoria.
   */
  getCategoryStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db.select().from(products).where(eq(products.active, 1));
    const categories = Array.from(new Set(rows.map((p) => p.category)));

    return categories.map((cat) => {
      const inCat = rows.filter((p) => p.category === cat);
      const avgPrice = inCat.length
        ? Math.round(inCat.reduce((sum, p) => sum + p.price, 0) / inCat.length)
        : 0;
      return { category: cat, count: inCat.length, avgPrice };
    });
  }),
});
