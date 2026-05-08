/**
 * PIX Payment Router Tests
 */

import { describe, it, expect, vi } from "vitest";
import { validatePixKey, formatCurrency, generateBrCode } from "../pix";

describe("PIX Payment System", () => {
  describe("validatePixKey", () => {
    it("should validate CPF format (11 digits)", () => {
      expect(validatePixKey("12345678901")).toBe(true);
    });

    it("should validate email format", () => {
      expect(validatePixKey("user@example.com")).toBe(true);
    });

    it("should validate phone format (+55 + 11 digits)", () => {
      expect(validatePixKey("+5511999999999")).toBe(true);
    });

    it("should validate random key format (UUID-like)", () => {
      expect(validatePixKey("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(validatePixKey("invalid")).toBe(false);
      expect(validatePixKey("123")).toBe(false);
      expect(validatePixKey("")).toBe(false);
    });
  });

  describe("formatCurrency", () => {
    it("should format amount in cents to BRL currency", () => {
      const formatted = formatCurrency(10000);
      expect(formatted).toContain("R$");
      expect(formatted).toContain("100");
    });

    it("should handle decimal values", () => {
      const formatted = formatCurrency(12345);
      expect(formatted).toContain("R$");
    });

    it("should handle zero amount", () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain("R$");
    });
  });

  describe("generateBrCode", () => {
    it("should generate valid BR Code", () => {
      const brCode = generateBrCode({
        pixKey: "user@example.com",
        ownerName: "Test User",
        amount: 10000,
        description: "Test Payment",
      });

      expect(brCode).toBeDefined();
      expect(typeof brCode).toBe("string");
      expect(brCode.length).toBeGreaterThan(0);
      expect(brCode).toContain("00020126580014br.gov.bcb.pix");
    });

    it("should include amount in BR Code", () => {
      const brCode = generateBrCode({
        pixKey: "12345678901",
        ownerName: "Test Merchant",
        amount: 50000,
        description: "Test",
      });

      expect(brCode).toContain("54");
    });

    it("should include merchant name in BR Code", () => {
      const brCode = generateBrCode({
        pixKey: "test@email.com",
        ownerName: "MERCHANT NAME",
        amount: 10000,
      });

      expect(brCode).toContain("59");
    });

    it("should generate CRC16 checksum", () => {
      const brCode = generateBrCode({
        pixKey: "11111111111",
        ownerName: "Test",
        amount: 1000,
      });

      expect(brCode).toMatch(/6304[A-F0-9]{4}$/);
    });

    it("should handle different PIX key types", () => {
      const cpfCode = generateBrCode({
        pixKey: "12345678901",
        ownerName: "Test",
        amount: 10000,
      });

      const emailCode = generateBrCode({
        pixKey: "user@test.com",
        ownerName: "Test",
        amount: 10000,
      });

      expect(cpfCode).toBeDefined();
      expect(emailCode).toBeDefined();
      expect(cpfCode).not.toBe(emailCode);
    });
  });

  describe("PIX Payment Flow", () => {
    it("should handle complete payment generation flow", async () => {
      const { generatePixPayment } = await import("../pix");

      const result = await generatePixPayment({
        pixKey: "test@example.com",
        ownerName: "Test Store",
        amount: 25000,
        description: "Test Purchase",
      });

      expect(result).toBeDefined();
      expect(result.brCode).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.pixKey).toBe("test@example.com");
      expect(result.amount).toBe(25000);
      expect(result.ownerName).toBe("Test Store");
      expect(result.qrCode).toContain("data:image");
    });

    it("should generate unique transaction IDs", () => {
      const code1 = generateBrCode({
        pixKey: "test@test.com",
        ownerName: "Test",
        amount: 1000,
        transactionId: "TX001",
      });

      const code2 = generateBrCode({
        pixKey: "test@test.com",
        ownerName: "Test",
        amount: 1000,
        transactionId: "TX002",
      });

      expect(code1).not.toBe(code2);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid PIX key validation", () => {
      const isValid = validatePixKey("invalid-key-format");
      expect(isValid).toBe(false);
    });

    it("should handle zero amounts gracefully", async () => {
      const { generatePixPayment } = await import("../pix");

      const result = await generatePixPayment({
        pixKey: "12345678901",
        ownerName: "Test",
        amount: 0,
      });

      expect(result).toBeDefined();
      expect(result.brCode).toBeDefined();
    });

    it("should generate valid QR Code for valid BR Code", async () => {
      const { generatePixPayment } = await import("../pix");

      const result = await generatePixPayment({
        pixKey: "test@example.com",
        ownerName: "Test",
        amount: 5000,
      });

      expect(result.qrCode).toBeDefined();
      expect(result.qrCode.length).toBeGreaterThan(0);
      expect(result.qrCode).toContain("data:image");
    });
  });
});
