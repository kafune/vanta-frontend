/**
 * Addresses Router — endereços de entrega do usuário logado.
 */

import { z } from "zod";
import { nanoid } from "nanoid";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { addresses } from "../../drizzle/schema";
import { and, eq, desc } from "drizzle-orm";

const addressInput = z.object({
  label: z.string().max(100).optional(),
  recipient: z.string().max(255).optional(),
  street: z.string().min(1).max(255),
  number: z.string().max(32).optional(),
  complement: z.string().max(255).optional(),
  city: z.string().min(1).max(128),
  state: z.string().max(64).optional(),
  zipCode: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

export const addressesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(addresses).where(eq(addresses.userId, ctx.user.id)).orderBy(desc(addresses.isDefault));
  }),

  create: protectedProcedure.input(addressInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = `addr_${nanoid(16)}`;
    await db.insert(addresses).values({
      id,
      userId: ctx.user.id,
      label: input.label ?? null,
      recipient: input.recipient ?? null,
      street: input.street,
      number: input.number ?? null,
      complement: input.complement ?? null,
      city: input.city,
      state: input.state ?? null,
      zipCode: input.zipCode ?? null,
      isDefault: input.isDefault ? 1 : 0,
    });
    return { id };
  }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(addresses).where(and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id)));
    return { id: input.id };
  }),
});
