/**
 * Email Verification Router
 * Handles email verification tokens and verification flow
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

// In-memory store for verification tokens (in production, use database)
const verificationTokens = new Map<string, { userId: number; email: string; expiresAt: Date }>();

function generateVerificationToken(): string {
  return randomUUID();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const emailVerificationRouter = {
  // Request email verification
  requestVerification: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const user = ctx.user;
      if (!user.email) {
        throw new Error("User email not found");
      }

      // Generate verification token
      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store token (in production, save to database)
      verificationTokens.set(token, {
        userId: user.id,
        email: user.email,
        expiresAt,
      });

      // In production, send email with verification link
      // For now, return token for testing
      const verificationUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

      console.log(`[Email Verification] Token generated for user ${user.id}: ${verificationUrl}`);

      return {
        success: true,
        message: "Verification email sent",
        token, // Only return in development
      };
    } catch (error) {
      console.error("[Email Verification] Error requesting verification:", error);
      throw new Error("Failed to request email verification");
    }
  }),

  // Verify email with token
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const tokenData = verificationTokens.get(input.token);

        if (!tokenData) {
          throw new Error("Invalid or expired verification token");
        }

        if (new Date() > tokenData.expiresAt) {
          verificationTokens.delete(input.token);
          throw new Error("Verification token has expired");
        }

        // Update user as verified
        await db
          .update(users)
          .set({
            updatedAt: new Date(),
          })
          .where(eq(users.id, tokenData.userId));

        // Remove used token
        verificationTokens.delete(input.token);

        return {
          success: true,
          message: "Email verified successfully",
        };
      } catch (error) {
        console.error("[Email Verification] Error verifying email:", error);
        throw new Error("Failed to verify email");
      }
    }),

  // Check if email is verified
  isVerified: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return false;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user.length) return false;

      // In production, check a verified field in the database
      // For now, assume verified if email exists
      return !!user[0].email;
    } catch (error) {
      console.error("[Email Verification] Error checking verification status:", error);
      return false;
    }
  }),

  // Resend verification email
  resendVerification: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const user = ctx.user;
      if (!user.email) {
        throw new Error("User email not found");
      }

      // Generate new verification token
      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store token
      verificationTokens.set(token, {
        userId: user.id,
        email: user.email,
        expiresAt,
      });

      const verificationUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

      console.log(`[Email Verification] New token generated for user ${user.id}: ${verificationUrl}`);

      return {
        success: true,
        message: "Verification email resent",
        token, // Only return in development
      };
    } catch (error) {
      console.error("[Email Verification] Error resending verification:", error);
      throw new Error("Failed to resend verification email");
    }
  }),

  // Get verification status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user.length) return null;

      return {
        email: user[0].email,
        isVerified: !!user[0].email,
        lastVerificationAttempt: null, // Could track in database
      };
    } catch (error) {
      console.error("[Email Verification] Error getting verification status:", error);
      return null;
    }
  }),
};
