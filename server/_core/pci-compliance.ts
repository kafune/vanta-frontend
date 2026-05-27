/**
 * PCI DSS Compliance Middleware
 * Ensures payment data is handled securely and never logged or exposed
 */

import { Request, Response, NextFunction } from "express";

/**
 * Redact sensitive payment data from logs
 * Removes card numbers, CVV, and other sensitive information
 */
export function redactSensitiveData(data: any): any {
  if (!data) return data;

  const redacted = JSON.parse(JSON.stringify(data));

  // List of sensitive fields to redact
  const sensitiveFields = [
    "cardNumber",
    "card_number",
    "number",
    "cvv",
    "cvc",
    "expiry",
    "expiryDate",
    "expiry_date",
    "expirationDate",
    "expiration_date",
    "pin",
    "password",
    "apiKey",
    "api_key",
    "secret",
    "token",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
  ];

  const redactObject = (obj: any) => {
    for (const key in obj) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = "***REDACTED***";
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        redactObject(obj[key]);
      }
    }
  };

  redactObject(redacted);
  return redacted;
}

/**
 * Validate that payment data is tokenized, not raw card data
 */
export function validatePaymentTokenization(paymentData: any): boolean {
  const sensitivePatterns = [
    /\b\d{13,19}\b/, // Credit card number pattern
    /\b\d{3,4}\b/, // CVV pattern (3-4 digits)
  ];

  const dataString = JSON.stringify(paymentData);

  for (const pattern of sensitivePatterns) {
    if (pattern.test(dataString)) {
      return false; // Raw card data detected
    }
  }

  return true; // Data appears to be tokenized
}

/**
 * Middleware to prevent logging of sensitive payment data
 */
export function pciComplianceMiddleware(req: Request, res: Response, next: NextFunction) {
  // Store original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console methods to redact sensitive data
  console.log = function (...args: any[]) {
    const redactedArgs = args.map((arg) => {
      if (typeof arg === "object") {
        return redactSensitiveData(arg);
      }
      return arg;
    });
    originalLog.apply(console, redactedArgs);
  };

  console.error = function (...args: any[]) {
    const redactedArgs = args.map((arg) => {
      if (typeof arg === "object") {
        return redactSensitiveData(arg);
      }
      return arg;
    });
    originalError.apply(console, redactedArgs);
  };

  console.warn = function (...args: any[]) {
    const redactedArgs = args.map((arg) => {
      if (typeof arg === "object") {
        return redactSensitiveData(arg);
      }
      return arg;
    });
    originalWarn.apply(console, redactedArgs);
  };

  // Restore original console methods when response ends
  res.on("finish", () => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  next();
}

/**
 * Validate payment request for PCI compliance
 */
export function validatePCICompliance(paymentData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for raw card data
  if (!validatePaymentTokenization(paymentData)) {
    errors.push("Raw card data detected. Only tokenized payment methods are allowed.");
  }

  // Check for required fields
  if (!paymentData.paymentMethodId && !paymentData.stripePaymentMethodId) {
    errors.push("Payment method ID (token) is required.");
  }

  // Check for amount
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.push("Valid amount is required.");
  }

  // Check for currency
  if (!paymentData.currency) {
    errors.push("Currency is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize error messages to prevent sensitive data leakage
 */
export function sanitizeErrorMessage(error: any): string {
  const errorString = error.toString().toLowerCase();

  // List of sensitive patterns to remove
  const sensitivePatterns = [
    /card\s*number/gi,
    /cvv/gi,
    /expiry/gi,
    /password/gi,
    /api\s*key/gi,
    /secret/gi,
    /token/gi,
  ];

  let message = error.message || "An error occurred";

  // Remove sensitive patterns from error message
  for (const pattern of sensitivePatterns) {
    message = message.replace(pattern, "[REDACTED]");
  }

  // Return generic message for security-related errors
  if (errorString.includes("payment") || errorString.includes("card")) {
    return "Payment processing failed. Please try again or contact support.";
  }

  return message;
}

/**
 * Log payment event safely (without sensitive data)
 */
export function logPaymentEvent(
  event: string,
  data: {
    transactionId?: string;
    userId?: number;
    amount?: number;
    currency?: string;
    status?: string;
    [key: string]: any;
  }
) {
  // Only log non-sensitive fields
  const safeData = {
    event,
    timestamp: new Date().toISOString(),
    transactionId: data.transactionId,
    userId: data.userId,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
  };

  console.log("[Payment Event]", safeData);
}

/**
 * Verify webhook signature for payment providers
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
  provider: "stripe" | "pix"
): boolean {
  const crypto = require("crypto");

  if (provider === "stripe") {
    // Stripe uses HMAC SHA256
    const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const expectedSignature = `t=${Math.floor(Date.now() / 1000)},v1=${hash}`;
    return signature === expectedSignature;
  }

  if (provider === "pix") {
    // PIX uses HMAC SHA256 (implementation depends on provider)
    const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return signature === hash;
  }

  return false;
}

/**
 * Encrypt sensitive data for storage
 * Note: In production, use a proper encryption library like crypto-js
 */
export function encryptSensitiveData(data: string, key: string): string {
  const crypto = require("crypto");
  const cipher = crypto.createCipher("aes-256-cbc", key);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * Decrypt sensitive data from storage
 */
export function decryptSensitiveData(encrypted: string, key: string): string {
  const crypto = require("crypto");
  const decipher = crypto.createDecipher("aes-256-cbc", key);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Check if request contains payment data
 */
export function isPaymentRequest(body: any): boolean {
  const paymentFields = [
    "paymentMethodId",
    "stripePaymentMethodId",
    "cardNumber",
    "cvv",
    "amount",
    "currency",
  ];

  return paymentFields.some((field) => field in body);
}

/**
 * Mask credit card number for display
 * Example: 4111 1111 1111 1111 → 4111 **** **** 1111
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 8) {
    return "****";
  }

  const first4 = cardNumber.substring(0, 4);
  const last4 = cardNumber.substring(cardNumber.length - 4);
  return `${first4} **** **** ${last4}`;
}

export default {
  redactSensitiveData,
  validatePaymentTokenization,
  pciComplianceMiddleware,
  validatePCICompliance,
  sanitizeErrorMessage,
  logPaymentEvent,
  verifyWebhookSignature,
  encryptSensitiveData,
  decryptSensitiveData,
  isPaymentRequest,
  maskCardNumber,
};
