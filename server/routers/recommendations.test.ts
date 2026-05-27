/**
 * Product Recommendations Router Tests
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

describe("Recommendations Router", () => {
  it("should get personalized recommendations", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getPersonalized({
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get personalized recommendations with custom limit", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getPersonalized({
      limit: 3,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("should get trending products", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getTrending({
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get trending products by category", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getTrending({
      limit: 6,
      category: "camisetas",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get similar products", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getSimilar({
      productId: "prod-1",
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get recommendations by category", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getByCategory({
      category: "camisetas",
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get new arrivals", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getNewArrivals({
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get new arrivals by category", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getNewArrivals({
      limit: 6,
      category: "camisetas",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get best sellers", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getBestSellers({
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get best sellers by category", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getBestSellers({
      limit: 6,
      category: "camisetas",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get recommendations for guest users", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getForGuest({
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get guest recommendations by product", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getForGuest({
      productId: "prod-1",
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get guest recommendations by category", async () => {
    const caller = appRouter.createCaller(mockUserContext);

    const result = await caller.recommendations.getForGuest({
      category: "camisetas",
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
