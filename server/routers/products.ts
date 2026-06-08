/**
 * Products Router
 * Catálogo de produtos lido da tabela `products` (seed inicial em 0012_seed_products).
 * Sem dados mockados: se o banco estiver indisponível, retorna vazio / not found.
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { products as productsTable, type Product } from "../../drizzle/schema";
import { and, asc, desc, eq, like, ne, or, sql } from "drizzle-orm";

// Imagens padrão por categoria — usadas só como fallback quando o produto não
// tem imagem própria cadastrada. Não são dados de produto, são placeholders de UI.
const CATEGORY_IMAGES: Record<string, string> = {
  cotton: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-cotton-6C3ChDmVfT5oxo4PDhFrbf.webp",
  oversized: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-oversized-fkaeTb24PqHL7RPsvGjmFY.webp",
  dryfit: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-dryfit-fpbTLZXZdYCMYERV2Myz4g.webp",
  hoodie: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-hoodie-Z6BCR25Eed5suvi3SXqxEz.webp",
};

const DEFAULT_SIZES = ["P", "M", "G", "GG"];

// Faz o parse seguro de um campo JSON (sizes/colors/images) guardado como texto.
function parseJsonArray(value: string | null | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Converte uma linha do banco para a forma exposta na API (imagem com fallback,
// arrays parseados). Preços ficam em centavos, como no banco.
function mapProduct(p: Product) {
  const image = p.image || CATEGORY_IMAGES[p.category] || "";
  const images = p.images || JSON.stringify([image]);
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description ?? "",
    price: p.price,
    originalPrice: p.originalPrice,
    tag: p.tag,
    image,
    images,
    sizes: parseJsonArray(p.sizes, DEFAULT_SIZES),
    colors: parseJsonArray(p.colors, []),
    stock: p.stock,
    featured: p.featured === 1,
  };
}

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
    .query(async ({ input }) => {
      const emptyResult = {
        products: [] as ReturnType<typeof mapProduct>[],
        pagination: {
          page: input.page,
          limit: input.limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      const db = await getDb();
      if (!db) return emptyResult;

      const conditions = [eq(productsTable.active, 1)];
      if (input.category !== "todos") {
        conditions.push(eq(productsTable.category, input.category));
      }
      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(like(productsTable.name, term), like(productsTable.category, term))!
        );
      }
      const where = and(...conditions);

      const orderBy =
        input.sort === "price-asc"
          ? [asc(productsTable.price)]
          : input.sort === "price-desc"
            ? [desc(productsTable.price)]
            : input.sort === "newest"
              ? [desc(productsTable.createdAt)]
              : [asc(productsTable.displayOrder), asc(productsTable.id)];

      const [{ count } = { count: 0 }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(where);
      const total = Number(count);

      const rows = await db
        .select()
        .from(productsTable)
        .where(where)
        .orderBy(...orderBy)
        .limit(input.limit)
        .offset((input.page - 1) * input.limit);

      const totalPages = Math.ceil(total / input.limit);
      return {
        products: rows.map(mapProduct),
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
   * Get product by ID with full details including stock and images
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, input.id))
        .limit(1);

      if (rows.length === 0) {
        throw new Error("Product not found");
      }
      return mapProduct(rows[0]);
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
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const current = await db
        .select({ category: productsTable.category })
        .from(productsTable)
        .where(eq(productsTable.id, input.productId))
        .limit(1);
      if (current.length === 0) return [];

      const rows = await db
        .select()
        .from(productsTable)
        .where(
          and(
            eq(productsTable.active, 1),
            eq(productsTable.category, current[0].category),
            ne(productsTable.id, input.productId)
          )
        )
        .orderBy(asc(productsTable.displayOrder))
        .limit(input.limit);

      return rows.map(mapProduct);
    }),

  /**
   * Get category statistics (count + preço médio por categoria)
   */
  getCategoryStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [] as { category: string; count: number; avgPrice: number; minPrice: number }[];

    const rows = await db
      .select({
        category: productsTable.category,
        count: sql<number>`count(*)`,
        avgPrice: sql<number>`avg(${productsTable.price})`,
        minPrice: sql<number>`min(${productsTable.price})`,
      })
      .from(productsTable)
      .where(eq(productsTable.active, 1))
      .groupBy(productsTable.category);

    return rows.map((r) => ({
      category: r.category,
      count: Number(r.count),
      avgPrice: Math.round(Number(r.avgPrice)),
      minPrice: Number(r.minPrice),
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
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(productsTable)
        .where(and(eq(productsTable.active, 1), eq(productsTable.featured, 1)))
        .orderBy(asc(productsTable.displayOrder))
        .limit(input.limit);

      return rows.map(mapProduct);
    }),
});
