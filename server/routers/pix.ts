/**
 * PIX Payment Router
 * Handle PIX payment generation and management
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { pixPayments, pixTransactions } from "../../drizzle/schema";
import { generatePixPayment, validatePixKey, formatCurrency } from "../pix";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

export const pixRouter = router({
  /**
   * Generate a PIX payment with QR Code
   * Returns BR Code and QR Code image
   */
  generatePayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number().positive(), // in cents
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, amount, description } = input;
      const pixKey = process.env.PIX_KEY;
      const ownerName = process.env.PIX_OWNER_NAME || "VANTA Store";

      if (!pixKey) {
        throw new Error("PIX key not configured");
      }

      if (!validatePixKey(pixKey)) {
        throw new Error("Invalid PIX key format");
      }

      try {
        // Generate PIX payment data
        const pixData = await generatePixPayment({
          pixKey,
          ownerName,
          amount,
          description: description || "Compra VANTA",
          transactionId: orderId,
        });

        // Get database connection
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Store payment in database
        const paymentId = generateId();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration

        await db.insert(pixPayments).values({
          id: paymentId,
          orderId,
          userId: ctx.user.id,
          amount,
          pixKey,
          qrCode: pixData.qrCode,
          brCode: pixData.brCode,
          status: "pending",
          expiresAt,
        });

        // Log transaction
        await db.insert(pixTransactions).values({
          id: generateId(),
          pixPaymentId: paymentId,
          status: "pending",
          message: "PIX payment generated successfully",
        });

        return {
          success: true,
          paymentId,
          brCode: pixData.brCode,
          qrCode: pixData.qrCode,
          pixKey,
          amount,
          amountFormatted: formatCurrency(amount),
          expiresAt,
          expiresIn: 30, // minutes
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to generate PIX payment: ${errorMessage}`);
      }
    }),

  /**
   * Get PIX payment details
   */
  getPayment: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const payment = await db
        .select()
        .from(pixPayments)
        .where(and(eq(pixPayments.id, input.paymentId), eq(pixPayments.userId, ctx.user.id)))
        .limit(1);

      if (payment.length === 0) {
        throw new Error("Payment not found");
      }

      return payment[0];
    }),

  /**
   * Get PIX payment by order ID
   */
  getPaymentByOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const payment = await db
        .select()
        .from(pixPayments)
        .where(and(eq(pixPayments.orderId, input.orderId), eq(pixPayments.userId, ctx.user.id)))
        .limit(1);

      if (payment.length === 0) {
        return null;
      }

      return payment[0];
    }),

  /**
   * Confirm PIX payment (simulated - in production, this would be a webhook from the bank)
   */
  confirmPayment: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const payment = await db
        .select()
        .from(pixPayments)
        .where(and(eq(pixPayments.id, input.paymentId), eq(pixPayments.userId, ctx.user.id)))
        .limit(1);

      if (payment.length === 0) {
        throw new Error("Payment not found");
      }

      if (payment[0].status === "confirmed") {
        return { success: true, message: "Payment already confirmed" };
      }

      // Update payment status
      await db.update(pixPayments).set({ status: "confirmed", confirmedAt: new Date() }).where(eq(pixPayments.id, input.paymentId));

      // Log transaction
      await db.insert(pixTransactions).values({
        id: generateId(),
        pixPaymentId: input.paymentId,
        status: "confirmed",
        message: "PIX payment confirmed",
      });

      return {
        success: true,
        message: "Payment confirmed successfully",
        paymentId: input.paymentId,
      };
    }),

  /**
   * Cancel PIX payment
   */
  cancelPayment: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const payment = await db
        .select()
        .from(pixPayments)
        .where(and(eq(pixPayments.id, input.paymentId), eq(pixPayments.userId, ctx.user.id)))
        .limit(1);

      if (payment.length === 0) {
        throw new Error("Payment not found");
      }

      // Update payment status
      await db.update(pixPayments).set({ status: "failed" }).where(eq(pixPayments.id, input.paymentId));

      // Log transaction
      await db.insert(pixTransactions).values({
        id: generateId(),
        pixPaymentId: input.paymentId,
        status: "failed",
        message: "PIX payment cancelled",
      });

      return {
        success: true,
        message: "Payment cancelled",
      };
    }),

  /**
   * Get payment transactions history
   */
  getTransactions: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Verify user owns this payment
      const payment = await db
        .select()
        .from(pixPayments)
        .where(and(eq(pixPayments.id, input.paymentId), eq(pixPayments.userId, ctx.user.id)))
        .limit(1);

      if (payment.length === 0) {
        throw new Error("Payment not found");
      }

      const transactions = await db
        .select()
        .from(pixTransactions)
        .where(eq(pixTransactions.pixPaymentId, input.paymentId));

      return transactions;
    }),

  /**
   * Check if PIX is configured
   */
  isConfigured: publicProcedure.query(async () => {
    const pixKey = process.env.PIX_KEY;
    const ownerName = process.env.PIX_OWNER_NAME;

    return {
      configured: !!pixKey && !!ownerName,
      pixKeyType: pixKey ? (pixKey.includes("@") ? "email" : pixKey.length === 11 ? "cpf" : "other") : null,
    };
  }),
});
