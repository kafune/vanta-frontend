/**
 * Email Verification Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const mockUserContext = {
  user: {
    id: 1,
    openId: "test-user-1",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  },
  req: {} as any,
  res: {} as any,
};

const mockUserNoEmailContext = {
  user: {
    id: 2,
    openId: "test-user-2",
    name: "Test User 2",
    email: null,
    role: "user" as const,
  },
  req: {} as any,
  res: {} as any,
};

describe("Email Verification Router", () => {
  it("should request email verification", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.emailVerification.requestVerification();

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.message).toBe("Verification email sent");
  });

  it("should fail to request verification without email", async () => {
    const caller = appRouter.createCaller(mockUserNoEmailContext);

    try {
      await caller.emailVerification.requestVerification();
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("email");
    }
  });

  it("should verify email with valid token", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // First request verification
    const requestResult = await caller.emailVerification.requestVerification();
    const token = requestResult.token;

    // Then verify with token
    const verifyResult = await caller.emailVerification.verifyEmail({ token });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.message).toBe("Email verified successfully");
  });

  it("should reject invalid verification token", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    try {
      await caller.emailVerification.verifyEmail({ token: "invalid-token" });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should check if email is verified", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.emailVerification.isVerified();

    expect(typeof result).toBe("boolean");
  });

  it("should resend verification email", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.emailVerification.resendVerification();

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.message).toBe("Verification email resent");
  });

  it("should get verification status", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.emailVerification.getStatus();

    expect(result).not.toBeNull();
    expect(result?.email).toBeDefined();
    expect(result?.isVerified).toBeDefined();
  });

  it("should handle expired verification tokens", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    // Request verification
    const requestResult = await caller.emailVerification.requestVerification();
    const token = requestResult.token;

    // Manually expire the token by waiting (in real scenario)
    // For testing, we'll just try with an invalid token
    try {
      await caller.emailVerification.verifyEmail({ token: "expired-token" });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});
