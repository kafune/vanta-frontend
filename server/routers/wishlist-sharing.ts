/**
 * Wishlist Sharing Router
 * Handles wishlist sharing with unique share links and tokens
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { wishlist } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// In-memory store for wishlist shares (in production, use database)
const wishlistShares = new Map<string, { userId: number; createdAt: Date; expiresAt: Date | null }>();

function generateShareToken(): string {
  return randomUUID().substring(0, 8).toUpperCase();
}

export const wishlistSharingRouter = {
  // Create a shareable wishlist link
  createShare: protectedProcedure
    .input(
      z.object({
        expiresIn: z.enum(["1day", "7days", "30days", "never"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const shareToken = generateShareToken();
        let expiresAt: Date | null = null;

        if (input.expiresIn && input.expiresIn !== "never") {
          const now = new Date();
          const daysMap = { "1day": 1, "7days": 7, "30days": 30 };
          const days = daysMap[input.expiresIn as keyof typeof daysMap];
          expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        }

        // Store share token
        wishlistShares.set(shareToken, {
          userId: ctx.user.id,
          createdAt: new Date(),
          expiresAt,
        });

        const shareUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/shared-wishlist/${shareToken}`;

        return {
          success: true,
          shareToken,
          shareUrl,
          expiresAt,
        };
      } catch (error) {
        console.error("[Wishlist Sharing] Error creating share:", error);
        throw new Error("Failed to create wishlist share");
      }
    }),

  // Get shared wishlist
  getSharedWishlist: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const shareData = wishlistShares.get(input.shareToken);

        if (!shareData) {
          throw new Error("Invalid or expired share link");
        }

        if (shareData.expiresAt && new Date() > shareData.expiresAt) {
          wishlistShares.delete(input.shareToken);
          throw new Error("Share link has expired");
        }

        // Get the shared user's wishlist
        const userWishlist = await db
          .select()
          .from(wishlist)
          .where(eq(wishlist.userId, shareData.userId));

        return {
          shareToken: input.shareToken,
          wishlistItems: userWishlist,
          createdAt: shareData.createdAt,
          expiresAt: shareData.expiresAt,
        };
      } catch (error) {
        console.error("[Wishlist Sharing] Error getting shared wishlist:", error);
        return null;
      }
    }),

  // Get user's active shares
  getMyShares: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userShares: Array<{ token: string; createdAt: Date; expiresAt: Date | null }> = [];

      wishlistShares.forEach((data, token) => {
        if (data.userId === ctx.user.id) {
          // Check if not expired
          if (!data.expiresAt || new Date() <= data.expiresAt) {
            userShares.push({
              token,
              createdAt: data.createdAt,
              expiresAt: data.expiresAt,
            });
          }
        }
      });

      return userShares;
    } catch (error) {
      console.error("[Wishlist Sharing] Error getting user shares:", error);
      return [];
    }
  }),

  // Revoke a share link
  revokeShare: protectedProcedure
    .input(z.object({ shareToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const shareData = wishlistShares.get(input.shareToken);

        if (!shareData) {
          throw new Error("Share not found");
        }

        if (shareData.userId !== ctx.user.id) {
          throw new Error("Unauthorized: Cannot revoke another user's share");
        }

        wishlistShares.delete(input.shareToken);

        return {
          success: true,
          message: "Share link revoked",
        };
      } catch (error) {
        console.error("[Wishlist Sharing] Error revoking share:", error);
        throw new Error("Failed to revoke share");
      }
    }),

  // Get share info
  getShareInfo: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input }) => {
      try {
        const shareData = wishlistShares.get(input.shareToken);

        if (!shareData) {
          return null;
        }

        const isExpired = shareData.expiresAt && new Date() > shareData.expiresAt;

        return {
          shareToken: input.shareToken,
          createdAt: shareData.createdAt,
          expiresAt: shareData.expiresAt,
          isExpired,
          isValid: !isExpired,
        };
      } catch (error) {
        console.error("[Wishlist Sharing] Error getting share info:", error);
        return null;
      }
    }),

  // Check if share is valid
  isShareValid: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input }) => {
      try {
        const shareData = wishlistShares.get(input.shareToken);

        if (!shareData) {
          return false;
        }

        if (shareData.expiresAt && new Date() > shareData.expiresAt) {
          return false;
        }

        return true;
      } catch (error) {
        console.error("[Wishlist Sharing] Error checking share validity:", error);
        return false;
      }
    }),
};
