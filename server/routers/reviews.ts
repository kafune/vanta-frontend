import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reviews, Review } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = router({
  // Get reviews for a product
  getByProductId: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.productId, input.productId),
            eq(reviews.status, "aprovado")
          )
        )
        .orderBy(desc(reviews.createdAt));

      return result;
    }),

  // Get reviews by user
  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, ctx.user.id))
      .orderBy(desc(reviews.createdAt));

    return result;
  }),

  // Create a review
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        orderId: z.string(),
        rating: z.number().min(1).max(5),
        title: z.string().min(3).max(255),
        comment: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if user already reviewed this product
      const existing = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.productId, input.productId),
            eq(reviews.userId, ctx.user.id),
            eq(reviews.orderId, input.orderId)
          )
        );

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já avaliou este produto",
        });
      }

      const id = nanoid();
      await db.insert(reviews).values({
        id,
        productId: input.productId,
        userId: ctx.user.id,
        orderId: input.orderId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        verified: 1,
        status: "pendente",
      });

      return { id, message: "Avaliação enviada para moderação" };
    }),

  // Update a review
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().min(3).max(255).optional(),
        comment: z.string().min(10).max(5000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if review belongs to user
      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id));

      if (review.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (review[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updateData: any = {};
      if (input.rating !== undefined) updateData.rating = input.rating;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.comment !== undefined) updateData.comment = input.comment;
      updateData.status = "pendente"; // Reset to pending after edit

      await db.update(reviews).set(updateData).where(eq(reviews.id, input.id));

      return { message: "Avaliação atualizada" };
    }),

  // Delete a review
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if review belongs to user
      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id));

      if (review.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (review[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete by changing status
      await db
        .update(reviews)
        .set({ status: "rejeitado" })
        .where(eq(reviews.id, input.id));

      return { message: "Avaliação removida" };
    }),

  // Mark review as helpful
  markHelpful: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id));

      if (review.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db
        .update(reviews)
        .set({ helpful: review[0].helpful + 1 })
        .where(eq(reviews.id, input.id));

      return { helpful: review[0].helpful + 1 };
    }),

  // Get average rating for a product
  getAverageRating: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.productId, input.productId),
            eq(reviews.status, "aprovado")
          )
        );

      if (result.length === 0) {
        return { average: 0, count: 0 };
      }

      const average =
        result.reduce((sum, r) => sum + r.rating, 0) / result.length;
      return { average: Math.round(average * 10) / 10, count: result.length };
    }),
});
