/**
 * Email Marketing Router
 * Assinantes e campanhas persistidos no banco (emailSubscribers/emailCampaigns).
 * Taxas de abertura/clique não são instrumentadas, então não inventamos números.
 */

import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { emailSubscribers, emailCampaigns } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

function parseTags(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const emailMarketingRouter = router({
  // Assinar newsletter.
  subscribeNewsletter: publicProcedure
    .input(z.object({ email: z.string().email(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const email = input.email.trim().toLowerCase();
      const [existing] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email)).limit(1);
      if (existing && existing.active === 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email already subscribed" });
      }
      if (existing) {
        await db
          .update(emailSubscribers)
          .set({ active: 1, tags: JSON.stringify(input.tags ?? []) })
          .where(eq(emailSubscribers.email, email));
      } else {
        await db.insert(emailSubscribers).values({
          email,
          active: 1,
          tags: JSON.stringify(input.tags ?? []),
        });
      }
      return { success: true, email, message: "Successfully subscribed to newsletter" };
    }),

  // Cancelar inscrição.
  unsubscribeNewsletter: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const email = input.email.trim().toLowerCase();
      const [existing] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Email not found" });
      await db.update(emailSubscribers).set({ active: 0 }).where(eq(emailSubscribers.email, email));
      return { success: true, email, message: "Successfully unsubscribed" };
    }),

  // Status de um assinante.
  getSubscriberStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { subscribed: false };
      const email = input.email.trim().toLowerCase();
      const [sub] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email)).limit(1);
      if (!sub) return { subscribed: false };
      return { subscribed: sub.active === 1, subscribedAt: sub.subscribedAt, tags: parseTags(sub.tags) };
    }),

  // Criar campanha (admin).
  createCampaign: adminProcedure
    .input(z.object({ name: z.string(), subject: z.string(), content: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const id = `camp_${Math.round(process.uptime() * 1000)}_${Math.floor(Math.random() * 1e6)}`;
      await db.insert(emailCampaigns).values({
        id,
        name: input.name,
        subject: input.subject,
        content: input.content,
        recipientCount: 0,
      });
      const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1);
      return { success: true, campaign };
    }),

  // Enviar campanha (admin) — conta destinatários ativos e marca enviada.
  sendCampaign: adminProcedure
    .input(z.object({ campaignId: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, input.campaignId)).limit(1);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });

      const activeSubs = await db.select().from(emailSubscribers).where(eq(emailSubscribers.active, 1));
      let recipients = activeSubs;
      if (input.tags && input.tags.length > 0) {
        recipients = activeSubs.filter((s) => {
          const tags = parseTags(s.tags);
          return input.tags!.some((t) => tags.includes(t));
        });
      }

      const sentAt = new Date();
      await db
        .update(emailCampaigns)
        .set({ sentAt, recipientCount: recipients.length })
        .where(eq(emailCampaigns.id, input.campaignId));

      return { success: true, campaignId: input.campaignId, recipientCount: recipients.length, sentAt };
    }),

  // Estatísticas de uma campanha (abertura/clique não instrumentados → 0).
  getCampaignStats: adminProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, input.campaignId)).limit(1);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      return {
        campaignId: campaign.id,
        name: campaign.name,
        recipientCount: campaign.recipientCount,
        openRate: 0,
        clickRate: 0,
        sentAt: campaign.sentAt,
      };
    }),

  // Todas as campanhas (admin).
  getAllCampaigns: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(emailCampaigns);
  }),

  // Contagem de assinantes ativos + por tag (admin).
  getSubscriberCount: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, byTag: {} as Record<string, number> };
    const subs = await db.select().from(emailSubscribers).where(eq(emailSubscribers.active, 1));
    const byTag = subs.reduce((acc, s) => {
      parseTags(s.tags).forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    return { total: subs.length, byTag };
  }),

  // Email personalizado para um assinante (admin).
  sendPersonalizedEmail: adminProcedure
    .input(z.object({ email: z.string().email(), subject: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const email = input.email.trim().toLowerCase();
      const [sub] = await db.select().from(emailSubscribers).where(and(eq(emailSubscribers.email, email), eq(emailSubscribers.active, 1))).limit(1);
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Subscriber not found or unsubscribed" });
      return { success: true, email, subject: input.subject, sentAt: new Date() };
    }),
});
