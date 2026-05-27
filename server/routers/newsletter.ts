/**
 * Newsletter Subscription Router
 * Handles newsletter subscriptions and email marketing
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// In-memory store for newsletter subscriptions (in production, use database)
const newsletterSubscriptions = new Map<string, { email: string; subscribedAt: Date; unsubscribedAt: Date | null; preferences: string[] }>();

export const newsletterRouter = {
  // Subscribe to newsletter
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        preferences: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const subscriptionId = randomUUID();

        // Check if already subscribed
        const existing = Array.from(newsletterSubscriptions.values()).find(
          (sub) => sub.email === input.email && !sub.unsubscribedAt
        );

        if (existing) {
          throw new Error("Email already subscribed to newsletter");
        }

        // Store subscription
        newsletterSubscriptions.set(subscriptionId, {
          email: input.email,
          subscribedAt: new Date(),
          unsubscribedAt: null,
          preferences: input.preferences || ["promotions", "updates"],
        });

        console.log(`[Newsletter] New subscription: ${input.email}`);

        return {
          success: true,
          message: "Successfully subscribed to newsletter",
          subscriptionId,
        };
      } catch (error) {
        console.error("[Newsletter] Error subscribing:", error);
        throw new Error("Failed to subscribe to newsletter");
      }
    }),

  // Unsubscribe from newsletter
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        let found = false;

        newsletterSubscriptions.forEach((data, key) => {
          if (data.email === input.email && !data.unsubscribedAt) {
            data.unsubscribedAt = new Date();
            found = true;
          }
        });

        if (!found) {
          throw new Error("Email not found in newsletter subscriptions");
        }

        console.log(`[Newsletter] Unsubscribed: ${input.email}`);

        return {
          success: true,
          message: "Successfully unsubscribed from newsletter",
        };
      } catch (error) {
        console.error("[Newsletter] Error unsubscribing:", error);
        throw new Error("Failed to unsubscribe from newsletter");
      }
    }),

  // Check subscription status
  getStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const subscription = Array.from(newsletterSubscriptions.values()).find(
          (sub) => sub.email === input.email
        );

        if (!subscription) {
          return {
            isSubscribed: false,
            email: input.email,
          };
        }

        return {
          isSubscribed: !subscription.unsubscribedAt,
          email: input.email,
          subscribedAt: subscription.subscribedAt,
          preferences: subscription.preferences,
        };
      } catch (error) {
        console.error("[Newsletter] Error getting status:", error);
        return null;
      }
    }),

  // Update subscription preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        preferences: z.array(z.enum(["promotions", "updates", "newArrivals", "sales"])),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (!user.length || !user[0].email) {
          throw new Error("User email not found");
        }

        // Update preferences
        const subscription = Array.from(newsletterSubscriptions.values()).find(
          (sub) => sub.email === user[0].email
        );

        if (subscription) {
          subscription.preferences = input.preferences;
        }

        return {
          success: true,
          message: "Preferences updated",
          preferences: input.preferences,
        };
      } catch (error) {
        console.error("[Newsletter] Error updating preferences:", error);
        throw new Error("Failed to update preferences");
      }
    }),

  // Get user's subscription info
  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user.length || !user[0].email) {
        return null;
      }

      const subscription = Array.from(newsletterSubscriptions.values()).find(
        (sub) => sub.email === user[0].email
      );

      if (!subscription) {
        return {
          isSubscribed: false,
          email: user[0].email,
        };
      }

      return {
        isSubscribed: !subscription.unsubscribedAt,
        email: user[0].email,
        subscribedAt: subscription.subscribedAt,
        preferences: subscription.preferences,
      };
    } catch (error) {
      console.error("[Newsletter] Error getting subscription:", error);
      return null;
    }
  }),

  // Get subscription count (admin only)
  getSubscriptionCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const activeSubscriptions = Array.from(newsletterSubscriptions.values()).filter(
        (sub) => !sub.unsubscribedAt
      );

      return {
        totalSubscriptions: activeSubscriptions.length,
        byPreference: {
          promotions: activeSubscriptions.filter((s) => s.preferences.includes("promotions")).length,
          updates: activeSubscriptions.filter((s) => s.preferences.includes("updates")).length,
          newArrivals: activeSubscriptions.filter((s) => s.preferences.includes("newArrivals")).length,
          sales: activeSubscriptions.filter((s) => s.preferences.includes("sales")).length,
        },
      };
    } catch (error) {
      console.error("[Newsletter] Error getting subscription count:", error);
      throw new Error("Failed to get subscription count");
    }
  }),
};
