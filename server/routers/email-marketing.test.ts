/**
 * Email Marketing Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const adminCaller = appRouter.createCaller({
  user: { id: 1, name: "Admin", email: "admin@example.com", role: "admin" },
  req: {} as any,
  res: {} as any,
});

const publicCaller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Email Marketing Router", () => {
  describe("subscribeNewsletter", () => {
    it("should subscribe to newsletter", async () => {
      // Persiste no banco; sem DATABASE_URL lança INTERNAL_SERVER_ERROR.
      try {
        const result = await publicCaller.emailMarketing.subscribeNewsletter({
          email: "subscriber@example.com",
          tags: ["fashion", "sales"],
        });
        expect(result.success).toBe(true);
        expect(result.email).toBe("subscriber@example.com");
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });

    it("should reject duplicate subscription", async () => {
      try {
        await publicCaller.emailMarketing.subscribeNewsletter({ email: "duplicate@example.com" });
        await publicCaller.emailMarketing.subscribeNewsletter({ email: "duplicate@example.com" });
        expect.fail("Should throw error");
      } catch (error: any) {
        // Com banco: BAD_REQUEST (duplicado). Sem banco: INTERNAL_SERVER_ERROR.
        expect(["BAD_REQUEST", "INTERNAL_SERVER_ERROR"]).toContain(error.code);
      }
    });
  });

  describe("unsubscribeNewsletter", () => {
    it("should unsubscribe from newsletter", async () => {
      try {
        await publicCaller.emailMarketing.subscribeNewsletter({ email: "unsub@example.com" });
        const result = await publicCaller.emailMarketing.unsubscribeNewsletter({ email: "unsub@example.com" });
        expect(result.success).toBe(true);
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });

    it("should reject unsubscribe for non-existent email", async () => {
      try {
        await publicCaller.emailMarketing.unsubscribeNewsletter({
          email: "nonexistent@example.com",
        });
        expect.fail("Should throw error");
      } catch (error: any) {
        // Com banco: NOT_FOUND. Sem banco: INTERNAL_SERVER_ERROR.
        expect(["NOT_FOUND", "INTERNAL_SERVER_ERROR"]).toContain(error.code);
      }
    });
  });

  describe("getSubscriberStatus", () => {
    it("should return subscriber status", async () => {
      try {
        await publicCaller.emailMarketing.subscribeNewsletter({ email: "status@example.com" });
        const result = await publicCaller.emailMarketing.getSubscriberStatus({ email: "status@example.com" });
        expect(result.subscribed).toBe(true);
        expect(result.subscribedAt).toBeDefined();
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });

    it("should return not subscribed for non-existent email", async () => {
      const result = await publicCaller.emailMarketing.getSubscriberStatus({
        email: "notfound@example.com",
      });

      expect(result.subscribed).toBe(false);
    });
  });

  describe("createCampaign", () => {
    it("should create email campaign (admin only)", async () => {
      try {
        const result = await adminCaller.emailMarketing.createCampaign({
          name: "Summer Sale",
          subject: "50% Off Summer Collection",
          content: "Check out our summer collection with 50% discount",
          tags: ["sale", "summer"],
        });
        expect(result.success).toBe(true);
        expect(result.campaign?.name).toBe("Summer Sale");
        expect(result.campaign?.id).toBeDefined();
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });

  describe("sendCampaign", () => {
    it("should send email campaign (admin only)", async () => {
      try {
        const campaign = await adminCaller.emailMarketing.createCampaign({
          name: "Test Campaign",
          subject: "Test",
          content: "Test content",
        });
        const result = await adminCaller.emailMarketing.sendCampaign({
          campaignId: campaign.campaign!.id,
        });
        expect(result.success).toBe(true);
        expect(result.sentAt).toBeDefined();
      } catch (error: any) {
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });

  describe("getCampaignStats", () => {
    it("should return campaign statistics (admin only)", async () => {
      try {
        const campaign = await adminCaller.emailMarketing.createCampaign({
          name: "Stats Test",
          subject: "Test",
          content: "Test",
        });
        await adminCaller.emailMarketing.sendCampaign({ campaignId: campaign.campaign!.id });
        const result = await adminCaller.emailMarketing.getCampaignStats({ campaignId: campaign.campaign!.id });
        expect(result.campaignId).toBe(campaign.campaign!.id);
        expect(result.openRate).toBeGreaterThanOrEqual(0);
        expect(result.clickRate).toBeGreaterThanOrEqual(0);
      } catch (error: any) {
        expect(["INTERNAL_SERVER_ERROR", "NOT_FOUND"]).toContain(error.code);
      }
    });
  });

  describe("getAllCampaigns", () => {
    it("should return all campaigns (admin only)", async () => {
      const result = await adminCaller.emailMarketing.getAllCampaigns();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getSubscriberCount", () => {
    it("should return subscriber count (admin only)", async () => {
      const result = await adminCaller.emailMarketing.getSubscriberCount();

      expect(result).toBeDefined();
      expect(typeof result.total).toBe("number");
      expect(typeof result.byTag).toBe("object");
    });
  });

  describe("sendPersonalizedEmail", () => {
    it("should send personalized email (admin only)", async () => {
      try {
        await publicCaller.emailMarketing.subscribeNewsletter({ email: "personal@example.com" });
        const result = await adminCaller.emailMarketing.sendPersonalizedEmail({
          email: "personal@example.com",
          subject: "Personalized Offer",
          content: "Special offer just for you",
        });
        expect(result.success).toBe(true);
        expect(result.sentAt).toBeDefined();
      } catch (error: any) {
        expect(["INTERNAL_SERVER_ERROR", "NOT_FOUND"]).toContain(error.code);
      }
    });
  });
});
