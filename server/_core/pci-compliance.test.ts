/**
 * PCI DSS Compliance Tests
 */

import { describe, it, expect } from "vitest";
import {
  redactSensitiveData,
  validatePaymentTokenization,
  validatePCICompliance,
  sanitizeErrorMessage,
  maskCardNumber,
  isPaymentRequest,
} from "./pci-compliance";

describe("PCI DSS Compliance", () => {
  describe("redactSensitiveData", () => {
    it("should redact card numbers", () => {
      const data = {
        cardNumber: "4111111111111111",
        amount: 100,
      };

      const redacted = redactSensitiveData(data);

      expect(redacted.cardNumber).toBe("***REDACTED***");
      expect(redacted.amount).toBe(100);
    });

    it("should redact CVV", () => {
      const data = {
        cvv: "123",
        amount: 100,
      };

      const redacted = redactSensitiveData(data);

      expect(redacted.cvv).toBe("***REDACTED***");
    });

    it("should redact nested sensitive data", () => {
      const data = {
        payment: {
          cardNumber: "4111111111111111",
          amount: 100,
        },
      };

      const redacted = redactSensitiveData(data);

      expect(redacted.payment.cardNumber).toBe("***REDACTED***");
      expect(redacted.payment.amount).toBe(100);
    });

    it("should redact API keys", () => {
      const data = {
        apiKey: "sk_test_123456789",
        userId: 1,
      };

      const redacted = redactSensitiveData(data);

      expect(redacted.apiKey).toBe("***REDACTED***");
    });

    it("should handle null and undefined", () => {
      expect(redactSensitiveData(null)).toBeNull();
      expect(redactSensitiveData(undefined)).toBeUndefined();
    });
  });

  describe("validatePaymentTokenization", () => {
    it("should reject raw card numbers", () => {
      const data = {
        cardNumber: "4111111111111111",
      };

      const isValid = validatePaymentTokenization(data);

      expect(isValid).toBe(false);
    });

    it("should accept tokenized payment methods", () => {
      const data = {
        paymentMethodId: "pm_1234567890",
        amount: 10000,
      };

      const isValid = validatePaymentTokenization(data);

      expect(isValid).toBe(true);
    });

    it("should reject raw CVV", () => {
      const data = {
        cvv: "123",
      };

      const isValid = validatePaymentTokenization(data);

      expect(isValid).toBe(false);
    });
  });

  describe("validatePCICompliance", () => {
    it("should validate compliant payment data", () => {
      const data = {
        paymentMethodId: "pm_1234567890",
        amount: 10000,
        currency: "USD",
      };

      const result = validatePCICompliance(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject raw card data", () => {
      const data = {
        cardNumber: "4111111111111111",
        amount: 10000,
        currency: "USD",
      };

      const result = validatePCICompliance(data);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should require payment method ID", () => {
      const data = {
        amount: 100,
        currency: "USD",
      };

      const result = validatePCICompliance(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Payment method ID (token) is required.");
    });

    it("should require valid amount", () => {
      const data = {
        paymentMethodId: "pm_1234567890",
        amount: -100,
        currency: "USD",
      };

      const result = validatePCICompliance(data);

      expect(result.valid).toBe(false);
    });

    it("should require currency", () => {
      const data = {
        paymentMethodId: "pm_1234567890",
        amount: 100,
      };

      const result = validatePCICompliance(data);

      expect(result.valid).toBe(false);
    });
  });

  describe("sanitizeErrorMessage", () => {
    it("should sanitize payment error messages", () => {
      const error = new Error("Card number 4111111111111111 is invalid");

      const sanitized = sanitizeErrorMessage(error);

      expect(sanitized).not.toContain("4111111111111111");
    });

    it("should remove sensitive keywords", () => {
      const error = new Error("CVV 123 is required");

      const sanitized = sanitizeErrorMessage(error);

      expect(sanitized).toContain("[REDACTED]");
    });

    it("should return generic message for payment errors", () => {
      const error = new Error("Payment processing failed with card number 4111111111111111");

      const sanitized = sanitizeErrorMessage(error);

      expect(sanitized).toBe("Payment processing failed. Please try again or contact support.");
    });
  });

  describe("maskCardNumber", () => {
    it("should mask card number correctly", () => {
      const masked = maskCardNumber("4111111111111111");

      expect(masked).toBe("4111 **** **** 1111");
    });

    it("should handle short card numbers", () => {
      const masked = maskCardNumber("411");

      expect(masked).toBe("****");
    });

    it("should handle empty strings", () => {
      const masked = maskCardNumber("");

      expect(masked).toBe("****");
    });
  });

  describe("isPaymentRequest", () => {
    it("should identify payment requests", () => {
      const body = {
        paymentMethodId: "pm_1234567890",
        amount: 100,
      };

      expect(isPaymentRequest(body)).toBe(true);
    });

    it("should identify requests with card data", () => {
      const body = {
        cardNumber: "4111111111111111",
        amount: 100,
      };

      expect(isPaymentRequest(body)).toBe(true);
    });

    it("should reject non-payment requests", () => {
      const body = {
        name: "John Doe",
        email: "john@example.com",
      };

      expect(isPaymentRequest(body)).toBe(false);
    });
  });

  describe("PCI Compliance Integration", () => {
    it("should prevent raw card data in logs", () => {
      const sensitiveData = {
        cardNumber: "4111111111111111",
        cvv: "123",
        amount: 100,
      };

      const redacted = redactSensitiveData(sensitiveData);

      expect(redacted.cardNumber).toBe("***REDACTED***");
      expect(redacted.cvv).toBe("***REDACTED***");
      expect(redacted.amount).toBe(100);
    });

    it("should validate tokenized payments", () => {
      const tokenizedPayment = {
        paymentMethodId: "pm_1234567890",
        amount: 10000,
        currency: "USD",
      };

      const isValid = validatePaymentTokenization(tokenizedPayment);
      const complianceCheck = validatePCICompliance(tokenizedPayment);

      expect(isValid).toBe(true);
      expect(complianceCheck.valid).toBe(true);
    });

    it("should reject non-compliant payment data", () => {
      const nonCompliantPayment = {
        cardNumber: "4111111111111111",
        cvv: "123",
        amount: 10000,
        currency: "USD",
      };

      const isValid = validatePaymentTokenization(nonCompliantPayment);
      const complianceCheck = validatePCICompliance(nonCompliantPayment);

      expect(isValid).toBe(false);
      expect(complianceCheck.valid).toBe(false);
    });
  });
});
