import { describe, it, expect, beforeEach } from "vitest";
import { wishlistRouter } from "./wishlist";

// Mock context
const mockContext = {
  user: { id: 1, name: "Test User", email: "test@example.com", role: "user" as const },
  req: {} as any,
  res: {} as any,
};

// Mock database responses
const mockWishlistItem = {
  id: "wishlist-1",
  userId: 1,
  productId: "prod-1",
  productName: "Test Product",
  productImage: "https://example.com/image.jpg",
  productPrice: 10000, // 100 euros in cents
  productCategory: "Shirts",
  addedAt: new Date(),
};

describe("Wishlist Router", () => {
  describe("addToWishlist", () => {
    it("should add product to wishlist", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      const result = await caller.addToWishlist({
        productId: "prod-1",
        productName: "Test Product",
        productImage: "https://example.com/image.jpg",
        productPrice: 100,
        productCategory: "Shirts",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Adicionado");
    });

    it("should prevent duplicate wishlist entries", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      // Add first time
      await caller.addToWishlist({
        productId: "prod-1",
        productName: "Test Product",
        productImage: "https://example.com/image.jpg",
        productPrice: 100,
        productCategory: "Shirts",
      });

      // Try to add again
      const result = await caller.addToWishlist({
        productId: "prod-1",
        productName: "Test Product",
        productImage: "https://example.com/image.jpg",
        productPrice: 100,
        productCategory: "Shirts",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("já está");
    });
  });

  describe("removeFromWishlist", () => {
    it("should remove product from wishlist", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      // Add first
      await caller.addToWishlist({
        productId: "prod-1",
        productName: "Test Product",
        productImage: "https://example.com/image.jpg",
        productPrice: 100,
        productCategory: "Shirts",
      });

      // Remove
      const result = await caller.removeFromWishlist({
        productId: "prod-1",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Removido");
    });
  });

  describe("isInWishlist", () => {
    it("should check if product is in wishlist", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      // Add to wishlist
      await caller.addToWishlist({
        productId: "prod-1",
        productName: "Test Product",
        productImage: "https://example.com/image.jpg",
        productPrice: 100,
        productCategory: "Shirts",
      });

      // Check
      const isIn = await caller.isInWishlist({
        productId: "prod-1",
      });

      expect(isIn).toBe(true);
    });

    it("should return false for product not in wishlist", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      const isIn = await caller.isInWishlist({
        productId: "prod-999",
      });

      expect(isIn).toBe(false);
    });
  });

  describe("getWishlistCount", () => {
    it("should return wishlist count", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      // Add multiple items
      await caller.addToWishlist({
        productId: "prod-1",
        productName: "Product 1",
        productPrice: 100,
      });

      await caller.addToWishlist({
        productId: "prod-2",
        productName: "Product 2",
        productPrice: 150,
      });

      const count = await caller.getWishlistCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe("clearWishlist", () => {
    it("should clear entire wishlist", async () => {
      const caller = wishlistRouter.createCaller(mockContext);
      
      // Add items
      await caller.addToWishlist({
        productId: "prod-1",
        productName: "Product 1",
        productPrice: 100,
      });

      // Clear
      const result = await caller.clearWishlist();
      expect(result.success).toBe(true);

      // Verify empty
      const count = await caller.getWishlistCount();
      expect(count).toBe(0);
    });
  });
});
