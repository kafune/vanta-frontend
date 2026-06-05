/**
 * Collections Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const caller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Collections Router", () => {
  it("should get all collections", async () => {
    const result = await caller.collections.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get featured collections", async () => {
    const result = await caller.collections.getFeatured();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get collection by id", async () => {
    const result = await caller.collections.getById({ id: "hexa" });
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("should get products by collection", async () => {
    const result = await caller.collections.getProductsByCollection({ collectionId: "hexa" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new collection", async () => {
    const result = await caller.collections.create({
      id: "test-collection-" + Date.now(),
      name: "Test Collection",
      description: "A test collection",
      image: "https://example.com/image.jpg",
      featured: 0,
      displayOrder: 0,
    });
    expect(result).toBeDefined();
  });

  it("should add product to collection", async () => {
    const result = await caller.collections.addProductToCollection({
      id: "test-product-collection-" + Date.now(),
      collectionId: "test-collection",
      productId: "product-123",
      displayOrder: 0,
    });
    expect(result).toBeDefined();
  });
});
