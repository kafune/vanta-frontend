/**
 * Admin — gerenciamento de produtos (CRUD). Protegido por adminProcedure.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { asc, eq } from "drizzle-orm";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const productInput = z.object({
  id: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Use apenas minúsculas, números e hífens"),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(64),
  description: z.string().max(5000).optional().default(""),
  price: z.number().int().min(0), // centavos
  originalPrice: z.number().int().min(0).nullable().optional(),
  tag: z.string().max(64).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

export const adminProductsRouter = router({
  // Lista TODOS os produtos (inclusive inativos), com arrays já parseados.
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(products).orderBy(asc(products.displayOrder));
    return rows.map((r) => ({
      ...r,
      sizes: parseJsonArray(r.sizes),
      colors: parseJsonArray(r.colors),
      images: parseJsonArray(r.images),
      featured: r.featured === 1,
      active: r.active === 1,
    }));
  }),

  create: adminProcedure.input(productInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível" });

    const existing = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
    if (existing.length > 0) {
      throw new TRPCError({ code: "CONFLICT", message: "Já existe um produto com esse ID/slug" });
    }

    await db.insert(products).values({
      id: input.id,
      name: input.name,
      category: input.category,
      description: input.description || null,
      price: input.price,
      originalPrice: input.originalPrice ?? null,
      tag: input.tag || null,
      image: input.image || null,
      sizes: JSON.stringify(input.sizes),
      colors: JSON.stringify(input.colors),
      featured: input.featured ? 1 : 0,
      active: input.active ? 1 : 0,
      displayOrder: input.displayOrder,
    });
    return { id: input.id };
  }),

  update: adminProcedure.input(productInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível" });

    await db
      .update(products)
      .set({
        name: input.name,
        category: input.category,
        description: input.description || null,
        price: input.price,
        originalPrice: input.originalPrice ?? null,
        tag: input.tag || null,
        image: input.image || null,
        sizes: JSON.stringify(input.sizes),
        colors: JSON.stringify(input.colors),
        featured: input.featured ? 1 : 0,
        active: input.active ? 1 : 0,
        displayOrder: input.displayOrder,
      })
      .where(eq(products.id, input.id));
    return { id: input.id };
  }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponível" });
      await db.delete(products).where(eq(products.id, input.id));
      return { id: input.id };
    }),
});
