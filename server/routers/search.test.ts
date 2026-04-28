import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const caller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("search router", () => {
  it("should search products by query", async () => {
    const result = await caller.search.search({
      query: "moletom",
      limit: 20,
      offset: 0,
    });

    expect(result).toHaveProperty("results");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("hasMore");
    expect(Array.isArray(result.results)).toBe(true);
  });

  it("should return empty results for non-matching query", async () => {
    const result = await caller.search.search({
      query: "xyz123nonexistent",
      limit: 20,
      offset: 0,
    });

    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("should filter by category", async () => {
    const result = await caller.search.search({
      query: "camiseta",
      category: "cotton",
      limit: 20,
      offset: 0,
    });

    expect(result.results.every((p: any) => p.category === "cotton")).toBe(true);
  });

  it("should sort by price ascending", async () => {
    const result = await caller.search.search({
      query: "camiseta",
      sortBy: "price-asc",
      limit: 20,
      offset: 0,
    });

    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].price).toBeGreaterThanOrEqual(result.results[i - 1].price);
    }
  });

  it("should sort by price descending", async () => {
    const result = await caller.search.search({
      query: "camiseta",
      sortBy: "price-desc",
      limit: 20,
      offset: 0,
    });

    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].price).toBeLessThanOrEqual(result.results[i - 1].price);
    }
  });

  it("should return suggestions for autocomplete", async () => {
    const result = await caller.search.suggestions({
      query: "moletom",
      limit: 5,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s: string) => s.toLowerCase().includes("moletom"))).toBe(true);
  });

  it("should return available categories", async () => {
    const result = await caller.search.categories();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("cotton");
    expect(result).toContain("hoodie");
  });

  it("should return trending searches", async () => {
    const result = await caller.search.trending({ limit: 5 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(5);
  });
});
