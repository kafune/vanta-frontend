/**
 * PIX Payment Router
 * Handle PIX payment generation and management
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb, updateUserContact } from "../db";
import { pixPayments, pixTransactions, orders } from "../../drizzle/schema";
import { generatePixPayment, validatePixKey, formatCurrency } from "../pix";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { createPixCharge, getPixChargeStatus, isAbacatePayConfigured, isChargePaid } from "../_core/abacatepay";
import { onlyDigits, isValidCellphone, isValidTaxId } from "@shared/br";

function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Marca um pagamento PIX como confirmado, registra a transação e move o pedido
 * para "confirmado". Idempotente. Reusado por checkStatus e pelo webhook.
 */
export async function markPixPaid(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  paymentId: string,
  orderId: string
): Promise<void> {
  await db
    .update(pixPayments)
    .set({ status: "confirmed", confirmedAt: new Date() })
    .where(eq(pixPayments.id, paymentId));
  await db.insert(pixTransactions).values({
    id: generateId(),
    pixPaymentId: paymentId,
    status: "confirmed",
    message: "PIX payment confirmed",
  });
  await db.update(orders).set({ status: "confirmado", updatedAt: new Date() }).where(eq(orders.id, orderId));
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
        // Dados de contato exigidos pela AbacatePay (customer). Opcionais aqui:
        // se não vierem, usamos o que já estiver salvo no usuário.
        cellphone: z
          .string()
          .optional()
          .refine((v) => v === undefined || isValidCellphone(v), "Celular inválido"),
        taxId: z
          .string()
          .optional()
          .refine((v) => v === undefined || isValidTaxId(v), "CPF/CNPJ inválido"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, amount, description } = input;
      const useGateway = isAbacatePayConfigured();
      const pixKey = process.env.PIX_KEY;
      const ownerName = process.env.PIX_OWNER_NAME || "VANTA Store";

      // Sem gateway configurado, exige a chave PIX estática.
      if (!useGateway) {
        if (!pixKey) throw new Error("PIX key not configured");
        if (!validatePixKey(pixKey)) throw new Error("Invalid PIX key format");
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const paymentId = generateId();
        let brCode: string;
        let qrCode: string;
        let gatewayId: string | null = null;
        let expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min default

        if (useGateway) {
          // Normaliza o contato recebido (só dígitos) e cai pro que já está
          // salvo no usuário quando o formulário não reenvia os campos.
          const cellphone = input.cellphone ? onlyDigits(input.cellphone) : ctx.user.phone ?? undefined;
          const taxId = input.taxId ? onlyDigits(input.taxId) : ctx.user.taxId ?? undefined;

          // Persiste o contato no usuário para reaproveitar nas próximas compras.
          if ((input.cellphone || input.taxId) && (cellphone || taxId)) {
            await updateUserContact(ctx.user.id, {
              phone: cellphone,
              taxId,
            });
          }

          // Cobrança real via AbacatePay. O customer só é enviado completo
          // (ver createPixCharge) — name/email + cellphone/taxId.
          const charge = await createPixCharge({
            amountCents: amount,
            description: description || "Compra VANTA",
            expiresInSeconds: 30 * 60,
            externalId: orderId,
            customer: {
              name: ctx.user.name ?? undefined,
              email: ctx.user.email ?? undefined,
              cellphone,
              taxId,
            },
          });
          brCode = charge.brCode;
          qrCode = charge.brCodeBase64;
          gatewayId = charge.id;
          if (charge.expiresAt) expiresAt = new Date(charge.expiresAt);
        } else {
          // PIX estático (chave do lojista, confirmação manual).
          const pixData = await generatePixPayment({
            pixKey: pixKey!,
            ownerName,
            amount,
            description: description || "Compra VANTA",
            transactionId: orderId,
          });
          brCode = pixData.brCode;
          qrCode = pixData.qrCode;
        }

        await db.insert(pixPayments).values({
          id: paymentId,
          orderId,
          userId: ctx.user.id,
          amount,
          pixKey: useGateway ? "abacatepay" : pixKey!,
          qrCode,
          brCode,
          gatewayId,
          status: "pending",
          expiresAt,
        });

        await db.insert(pixTransactions).values({
          id: generateId(),
          pixPaymentId: paymentId,
          status: "pending",
          message: useGateway ? "AbacatePay charge created" : "PIX payment generated successfully",
        });

        return {
          success: true,
          paymentId,
          brCode,
          qrCode,
          pixKey: useGateway ? "abacatepay" : pixKey!,
          provider: useGateway ? ("abacatepay" as const) : ("static" as const),
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
   * Check payment status against the gateway (AbacatePay) and confirm if paid.
   * Lets the frontend poll for automatic confirmation.
   */
  checkStatus: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [payment] = await db
        .select()
        .from(pixPayments)
        .where(and(eq(pixPayments.id, input.paymentId), eq(pixPayments.userId, ctx.user.id)))
        .limit(1);
      if (!payment) throw new Error("Payment not found");

      if (payment.status === "confirmed") {
        return { status: "confirmed" as const, paid: true };
      }
      // Sem gateway/charge não há o que consultar — segue pendente (confirmação manual).
      if (!payment.gatewayId || !isAbacatePayConfigured()) {
        return { status: payment.status, paid: false };
      }

      const charge = await getPixChargeStatus(payment.gatewayId);
      if (isChargePaid(charge.status)) {
        await markPixPaid(db, payment.id, payment.orderId);
        return { status: "confirmed" as const, paid: true };
      }
      return { status: payment.status, paid: false };
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
      // Quando o gateway está ativo, o checkout precisa coletar celular + CPF.
      gateway: isAbacatePayConfigured(),
      pixKeyType: pixKey ? (pixKey.includes("@") ? "email" : pixKey.length === 11 ? "cpf" : "other") : null,
    };
  }),
});
