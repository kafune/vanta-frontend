/**
 * Email Marketing Router
 * Handles newsletter subscriptions, email campaigns, and marketing communications
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Mock newsletter subscribers
const subscribers: Map<string, { email: string; subscribedAt: Date; active: boolean; tags: string[] }> = new Map();

// Mock email campaigns
const campaigns: Array<{
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: Date;
  sentAt?: Date;
  recipientCount: number;
  openRate: number;
  clickRate: number;
}> = [];

export const emailMarketingRouter = router({
  /**
   * Subscribe to newsletter
   */
  subscribeNewsletter: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => {
      if (subscribers.has(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already subscribed",
        });
      }

      subscribers.set(input.email, {
        email: input.email,
        subscribedAt: new Date(),
        active: true,
        tags: input.tags || [],
      });

      return {
        success: true,
        email: input.email,
        message: "Successfully subscribed to newsletter",
      };
    }),

  /**
   * Unsubscribe from newsletter
   */
  unsubscribeNewsletter: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ input }) => {
      const subscriber = subscribers.get(input.email);

      if (!subscriber) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email not found",
        });
      }

      subscriber.active = false;
      return {
        success: true,
        email: input.email,
        message: "Successfully unsubscribed",
      };
    }),

  /**
   * Get subscriber status
   */
  getSubscriberStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }) => {
      const subscriber = subscribers.get(input.email);

      if (!subscriber) {
        return { subscribed: false };
      }

      return {
        subscribed: subscriber.active,
        subscribedAt: subscriber.subscribedAt,
        tags: subscriber.tags,
      };
    }),

  /**
   * Create email campaign (admin)
   */
  createCampaign: adminProcedure
    .input(
      z.object({
        name: z.string(),
        subject: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => {
      const campaign = {
        id: `camp_${Date.now()}`,
        name: input.name,
        subject: input.subject,
        content: input.content,
        createdAt: new Date(),
        recipientCount: 0,
        openRate: 0,
        clickRate: 0,
      };

      campaigns.push(campaign);
      return { success: true, campaign };
    }),

  /**
   * Send email campaign (admin)
   */
  sendCampaign: adminProcedure
    .input(
      z.object({
        campaignId: z.string(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => {
      const campaign = campaigns.find((c) => c.id === input.campaignId);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      // Filter subscribers by tags if provided
      let recipients = Array.from(subscribers.values()).filter((s) => s.active);

      if (input.tags && input.tags.length > 0) {
        recipients = recipients.filter((s) =>
          input.tags!.some((tag) => s.tags.includes(tag))
        );
      }

      campaign.sentAt = new Date();
      campaign.recipientCount = recipients.length;
      campaign.openRate = Math.random() * 0.4; // Mock: 0-40% open rate
      campaign.clickRate = Math.random() * 0.1; // Mock: 0-10% click rate

      return {
        success: true,
        campaignId: input.campaignId,
        recipientCount: recipients.length,
        sentAt: campaign.sentAt,
      };
    }),

  /**
   * Get campaign statistics
   */
  getCampaignStats: adminProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(({ input }) => {
      const campaign = campaigns.find((c) => c.id === input.campaignId);

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      return {
        campaignId: campaign.id,
        name: campaign.name,
        recipientCount: campaign.recipientCount,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
        sentAt: campaign.sentAt,
      };
    }),

  /**
   * Get all campaigns (admin)
   */
  getAllCampaigns: adminProcedure.query(() => {
    return campaigns;
  }),

  /**
   * Get subscriber count (admin)
   */
  getSubscriberCount: adminProcedure.query(() => {
    const activeSubscribers = Array.from(subscribers.values()).filter((s) => s.active);
    return {
      total: activeSubscribers.length,
      byTag: Array.from(subscribers.values()).reduce(
        (acc, s) => {
          s.tags.forEach((tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }),

  /**
   * Send personalized email (admin)
   */
  sendPersonalizedEmail: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        subject: z.string(),
        content: z.string(),
      })
    )
    .mutation(({ input }) => {
      const subscriber = subscribers.get(input.email);

      if (!subscriber || !subscriber.active) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscriber not found or unsubscribed",
        });
      }

      return {
        success: true,
        email: input.email,
        subject: input.subject,
        sentAt: new Date(),
      };
    }),
});
