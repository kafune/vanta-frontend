/**
 * Products Router Tests
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

const caller = appRouter.createCaller({
  user: null,
  req: {} as any,
  res: {} as any,
});

describe("Products Router", () => {
  describe("getPaginated", () => {
    it("should return paginated products with default params", async () => {
      const result = await caller.products.getPaginated({
        page: 1,
        limit: 12,
      });

      expect(result.products).toBeDefined();
      expect(result.products.length).toBeLessThanOrEqual(12);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(12);
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it("should filter products by category", async () => {
      const result = await caller.products.getPaginated({
        page: 1,
        limit: 12,
        category: "cotton",
      });

      expect(result.products).toBeDefined();
      result.products.forEach((p) => {
        expect(p.category).toBe("cotton");
      });
    });

    it("should search products by name", async () => {
      const result = await caller.products.getPaginated({
        page: 1,
        limit: 12,
        search: "Essential",
      });

      expect(result.products).toBeDefined();
      result.products.forEach((p) => {
        expect(p.name.toLowerCase()).toContain("essential");
      });
    });

    it("should sort products by price ascending", async () => {
      const result = await caller.products.getPaginated({
        page: 1,
        limit: 12,
        sort: "price-asc",
      });

      expect(result.products).toBeDefined();
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].price).toBeGreaterThanOrEqual(result.products[i - 1].price);
      }
    });

    it("should sort products by price descending", async () => {
      const result = await caller.products.getPaginated({
        page: 1,
        limit: 12,
        sort: "price-desc",
      });

      expect(result.products).toBeDefined();
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i].price).toBeLessThanOrEqual(result.products[i - 1].price);
      }
    });

    it("should handle pagination correctly", async () => {
      const page1 = await caller.products.getPaginated({
        page: 1,
        limit: 5,
      });

      const page2 = await caller.products.getPaginated({
        page: 2,
        limit: 5,
      });

      expect(page1.products).toBeDefined();
      expect(page2.products).toBeDefined();
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.products[0].id).not.toBe(page2.products[0].id);
    });

    it("should return correct pagination metadata", async () => {
      const result = await caller.products.getPaginated({
        page: 1,
        limit: 5,
      });

      expect(result.pagination.hasNextPage).toBe(result.pagination.total > 5);
      expect(result.pagination.hasPreviousPage).toBe(false);
      expect(result.pagination.totalPages).toBe(Math.ceil(result.pagination.total / 5));
    });
  });

  describe("getById", () => {
    it("should return product by id", async () => {
      const result = await caller.products.getById({
        id: "essential-tee-280g",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("essential-tee-280g");
      expect(result.name).toBe("Essential Tee 280g");
      expect(result.image).toBeDefined();
      expect(result.sizes).toBeDefined();
      expect(result.colors).toBeDefined();
    });

    it("should throw error for non-existent product", async () => {
      try {
        await caller.products.getById({
          id: "non-existent-product",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).toBe("Product not found");
      }
    });
  });

  describe("getRelated", () => {
    it("should return related products from same category", async () => {
      const result = await caller.products.getRelated({
        productId: "essential-tee-280g",
        limit: 4,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((p) => {
        expect(p.category).toBe("cotton");
        expect(p.id).not.toBe("essential-tee-280g");
      });
    });

    it("should limit related products", async () => {
      const result = await caller.products.getRelated({
        productId: "essential-tee-280g",
        limit: 2,
      });

      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getFeatured", () => {
    it("should return featured products with tags", async () => {
      const result = await caller.products.getFeatured({
        limit: 6,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((p) => {
        expect(p.tag).toBeDefined();
        expect(p.tag).not.toBeNull();
      });
    });
  });

  describe("getCategoryStats", () => {
    it("should return category statistics", async () => {
      const result = await caller.products.getCategoryStats();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(4); // 4 categories
      result.forEach((stat) => {
        expect(stat.category).toBeDefined();
        expect(stat.count).toBeGreaterThanOrEqual(0);
        expect(stat.avgPrice).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
