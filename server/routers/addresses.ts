/**
 * Addresses Router — endereços de entrega do usuário (tabela `addresses`).
 * Tudo protegido por sessão; cada usuário só enxerga/mexe nos próprios.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { addresses } from "../../drizzle/schema";
import { and, eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const addressesRouter = router({
  // Lista os endereços do usuário (padrão primeiro).
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, ctx.user.id))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }),

  // Cria um endereço. Se for o primeiro do usuário, vira padrão.
  create: protectedProcedure
    .input(
      z.object({
        label: z.string().max(100).optional(),
        recipient: z.string().max(255).optional(),
        street: z.string().min(1).max(255),
        number: z.string().max(32).optional(),
        complement: z.string().max(255).optional(),
        city: z.string().min(1).max(128),
        state: z.string().max(64).optional(),
        zipCode: z.string().max(20).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const existing = await db
        .select({ id: addresses.id })
        .from(addresses)
        .where(eq(addresses.userId, ctx.user.id));
      const makeDefault = input.isDefault || existing.length === 0;

      // Garante um único padrão por usuário.
      if (makeDefault && existing.length > 0) {
        await db
          .update(addresses)
          .set({ isDefault: 0 })
          .where(eq(addresses.userId, ctx.user.id));
      }

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
        isDefault: makeDefault ? 1 : 0,
      });

      const [created] = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
      return created;
    }),

  // Define um endereço como padrão (limpa os demais do usuário).
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(addresses).set({ isDefault: 0 }).where(eq(addresses.userId, ctx.user.id));
      await db
        .update(addresses)
        .set({ isDefault: 1 })
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id)));
      return { success: true };
    }),

  // Remove um endereço do usuário.
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .delete(addresses)
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id)));
      return { success: true };
    }),
});
