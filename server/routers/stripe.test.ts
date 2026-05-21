/**
 * Stripe Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const caller = appRouter.createCaller({
  user: { id: 1, name: "Test User", email: "test@example.com", role: "user" },
  req: {} as any,
  res: {} as any,
});

const publicCaller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Stripe Router", () => {
  describe("createPaymentIntent", () => {
    it("should create a payment intent", async () => {
      const result = await caller.stripe.createPaymentIntent({
        amount: 10000,
        currency: "brl",
        orderId: "order-123",
        description: "Test payment",
      });

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.id).toBeDefined();
      expect(result.paymentIntent.amount).toBe(10000);
      expect(result.paymentIntent.status).toBe("requires_payment_method");
    });

    it("should include metadata in payment intent", async () => {
      const result = await caller.stripe.createPaymentIntent({
        amount: 5000,
        currency: "brl",
        orderId: "order-456",
        metadata: { product: "tshirt", size: "M" },
      });

      expect(result.paymentIntent).toBeDefined();
      expect(result.paymentIntent.orderId).toBe("order-456");
    });
  });

  describe("confirmPayment", () => {
    it("should confirm a payment", async () => {
      const result = await caller.stripe.confirmPayment({
        paymentIntentId: "pi_test123",
        paymentMethodId: "pm_test456",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("succeeded");
      expect(result.confirmedAt).toBeDefined();
    });
  });

  describe("getPaymentIntent", () => {
    it("should retrieve payment intent details", async () => {
      const result = await caller.stripe.getPaymentIntent({
        paymentIntentId: "pi_test123",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("pi_test123");
      expect(result.status).toBe("succeeded");
    });
  });

  describe("getPaymentMethods", () => {
    it("should return payment methods list", async () => {
      const result = await caller.stripe.getPaymentMethods();

      expect(result).toBeDefined();
      expect(Array.isArray(result.paymentMethods)).toBe(true);
      expect(result.hasMore).toBe(false);
    });
  });

  describe("deletePaymentMethod", () => {
    it("should delete a payment method", async () => {
      const result = await caller.stripe.deletePaymentMethod({
        paymentMethodId: "pm_test456",
      });

      expect(result.success).toBe(true);
      expect(result.paymentMethodId).toBe("pm_test456");
    });
  });

  describe("getPublishableKey", () => {
    it("should return Stripe publishable key", async () => {
      const result = await publicCaller.stripe.getPublishableKey();

      expect(result).toBeDefined();
      expect(result.publishableKey).toBeDefined();
      expect(typeof result.publishableKey).toBe("string");
    });
  });

  describe("handleWebhook", () => {
    it("should handle payment_intent.succeeded webhook", async () => {
      const result = await publicCaller.stripe.handleWebhook({
        type: "payment_intent.succeeded",
        data: { id: "pi_test123", status: "succeeded" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Payment processed");
    });

    it("should handle payment_intent.payment_failed webhook", async () => {
      const result = await publicCaller.stripe.handleWebhook({
        type: "payment_intent.payment_failed",
        data: { id: "pi_test123", error: "Card declined" },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Payment failed");
    });

    it("should handle charge.refunded webhook", async () => {
      const result = await publicCaller.stripe.handleWebhook({
        type: "charge.refunded",
        data: { id: "ch_test123", refunded: true },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Refund processed");
    });
  });
});
