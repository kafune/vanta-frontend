import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { cashbackBalance, cashbackTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const cashbackRouter = router({
  /**
   * Get cashback balance for authenticated user
   * Returns available balance in cents
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const balance = await db
      .select()
      .from(cashbackBalance)
      .where(eq(cashbackBalance.userId, ctx.user.id))
      .limit(1);

    if (!balance || balance.length === 0) {
      // User has no cashback balance yet
      return {
        availableBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
      };
    }

    return {
      availableBalance: balance[0].availableBalance,
      totalEarned: balance[0].totalEarned,
      totalSpent: balance[0].totalSpent,
    };
  }),

  /**
   * Apply cashback as discount to current purchase
   * Validates that user has sufficient balance
   * Returns discount amount in cents
   */
  applyCashback: protectedProcedure
    .input(z.object({ amount: z.number().min(0) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current balance
      const balance = await db
        .select()
        .from(cashbackBalance)
        .where(eq(cashbackBalance.userId, ctx.user.id))
        .limit(1);

      const availableBalance = balance && balance.length > 0 ? balance[0].availableBalance : 0;

      // Validate sufficient balance
      if (availableBalance < input.amount) {
        throw new Error(`Saldo insuficiente. Disponível: R$ ${(availableBalance / 100).toFixed(2)}`);
      }

      return {
        discountAmount: input.amount,
        newBalance: availableBalance - input.amount,
      };
    }),

  /**
   * Record cashback earned from a purchase (10% of order total)
   * Called after successful order placement
   */
  recordEarned: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        orderTotal: z.number().min(0), // in cents
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const earnedAmount = Math.round(input.orderTotal * 0.1); // 10% cashback

      // Get or create balance record
      let balance = await db
        .select()
        .from(cashbackBalance)
        .where(eq(cashbackBalance.userId, ctx.user.id))
        .limit(1);

      if (!balance || balance.length === 0) {
        // Create new balance record
        const balanceId = `cashback-${ctx.user.id}-${Date.now()}`;
        await db.insert(cashbackBalance).values({
          id: balanceId,
          userId: ctx.user.id,
          totalEarned: earnedAmount,
          totalSpent: 0,
          availableBalance: earnedAmount,
        });
      } else {
        // Update existing balance
        const newTotalEarned = balance[0].totalEarned + earnedAmount;
        const newAvailableBalance = newTotalEarned - balance[0].totalSpent;

        await db
          .update(cashbackBalance)
          .set({
            totalEarned: newTotalEarned,
            availableBalance: newAvailableBalance,
          })
          .where(eq(cashbackBalance.userId, ctx.user.id));
      }

      // Record transaction
      const transactionId = `cashback-tx-${input.orderId}-${Date.now()}`;
      await db.insert(cashbackTransactions).values({
        id: transactionId,
        userId: ctx.user.id,
        orderId: input.orderId,
        type: "earned",
        amount: earnedAmount,
        description: `Ganhou 10% de cashback da compra #${input.orderId}`,
      });

      return {
        earnedAmount,
        message: `Você ganhou R$ ${(earnedAmount / 100).toFixed(2)} em cashback!`,
      };
    }),

  /**
   * Record cashback spent as discount on a purchase
   * Called after successful checkout with cashback applied
   */
  recordSpent: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        spentAmount: z.number().min(0), // in cents
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current balance
      const balance = await db
        .select()
        .from(cashbackBalance)
        .where(eq(cashbackBalance.userId, ctx.user.id))
        .limit(1);

      if (!balance || balance.length === 0) {
        throw new Error("Nenhum saldo de cashback disponível");
      }

      const currentBalance = balance[0];

      // Validate sufficient balance
      if (currentBalance.availableBalance < input.spentAmount) {
        throw new Error("Saldo insuficiente para usar esse cashback");
      }

      // Update balance
      const newTotalSpent = currentBalance.totalSpent + input.spentAmount;
      const newAvailableBalance = currentBalance.totalEarned - newTotalSpent;

      await db
        .update(cashbackBalance)
        .set({
          totalSpent: newTotalSpent,
          availableBalance: newAvailableBalance,
        })
        .where(eq(cashbackBalance.userId, ctx.user.id));

      // Record transaction
      const transactionId = `cashback-tx-${input.orderId}-${Date.now()}`;
      await db.insert(cashbackTransactions).values({
        id: transactionId,
        userId: ctx.user.id,
        orderId: input.orderId,
        type: "spent",
        amount: input.spentAmount,
        description: `Usou R$ ${(input.spentAmount / 100).toFixed(2)} de cashback na compra #${input.orderId}`,
      });

      return {
        spentAmount: input.spentAmount,
        newBalance: newAvailableBalance,
        message: `Desconto de R$ ${(input.spentAmount / 100).toFixed(2)} aplicado com cashback!`,
      };
    }),

  /**
   * Get cashback transaction history for authenticated user
   */
  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const transactions = await db
      .select()
      .from(cashbackTransactions)
      .where(eq(cashbackTransactions.userId, ctx.user.id))
      .orderBy((t) => t.createdAt);

    return transactions;
  }),
});
