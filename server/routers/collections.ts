import { z } from "zod";
import { publicProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { collections, collectionProducts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const collectionsRouter = {
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const allCollections = await db.select().from(collections).orderBy(collections.displayOrder);
    return allCollections;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const collection = await db
        .select()
        .from(collections)
        .where(eq(collections.id, input.id))
        .limit(1);
      return collection[0] || null;
    }),

  getFeatured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const featured = await db
      .select()
      .from(collections)
      .where(eq(collections.featured, 1))
      .orderBy(collections.displayOrder);
    return featured;
  }),

  getProductsByCollection: publicProcedure
    .input(z.object({ collectionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const products = await db
        .select()
        .from(collectionProducts)
        .where(eq(collectionProducts.collectionId, input.collectionId))
        .orderBy(collectionProducts.displayOrder);
      return products;
    }),

  create: adminProcedure
    .input(
      z.object({
        id: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/, "Use minúsculas, números e hífens"),
        name: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
        featured: z.number().default(0),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(collections).where(eq(collections.id, input.id)).limit(1);
      if (existing.length > 0) throw new Error("Já existe uma coleção com esse ID/slug");
      await db.insert(collections).values({
        id: input.id,
        name: input.name,
        description: input.description ?? null,
        image: input.image ?? null,
        featured: input.featured,
        displayOrder: input.displayOrder,
      });
      return { id: input.id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
        featured: z.number().default(0),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(collections)
        .set({
          name: input.name,
          description: input.description ?? null,
          image: input.image ?? null,
          featured: input.featured,
          displayOrder: input.displayOrder,
        })
        .where(eq(collections.id, input.id));
      return { id: input.id };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(collections).where(eq(collections.id, input.id));
      await db.delete(collectionProducts).where(eq(collectionProducts.collectionId, input.id));
      return { id: input.id };
    }),

  addProductToCollection: adminProcedure
    .input(
      z.object({
        id: z.string(),
        collectionId: z.string(),
        productId: z.string(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(collectionProducts).values({
        id: input.id,
        collectionId: input.collectionId,
        productId: input.productId,
        displayOrder: input.displayOrder,
      });
      return result;
    }),
};
