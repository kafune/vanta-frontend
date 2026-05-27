/**
 * Product Cache Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCachedProduct,
  setCachedProduct,
  clearProductCache,
  getCacheStats,
  cleanExpiredCache,
} from './useProductCache';

describe('Product Cache Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('setCachedProduct and getCachedProduct', () => {
    it('should cache and retrieve product data', () => {
      const productId = 'test-product-1';
      const productData = {
        id: productId,
        name: 'Test Product',
        price: 100,
        category: 'cotton',
      };

      setCachedProduct(productId, productData);
      const cached = getCachedProduct(productId);

      expect(cached).toEqual(productData);
    });

    it('should return null for non-existent product', () => {
      const cached = getCachedProduct('non-existent');
      expect(cached).toBeNull();
    });

    it('should respect custom TTL', () => {
      const productId = 'test-product-2';
      const productData = { id: productId, name: 'Test' };
      const shortTTL = 100; // 100ms

      setCachedProduct(productId, productData, shortTTL);

      // Should be cached immediately
      expect(getCachedProduct(productId)).toEqual(productData);

      // Wait for expiry
      setTimeout(() => {
        expect(getCachedProduct(productId)).toBeNull();
      }, 150);
    });

    it('should handle complex nested objects', () => {
      const productId = 'test-product-3';
      const productData = {
        id: productId,
        name: 'Complex Product',
        details: {
          category: 'oversized',
          colors: ['black', 'white', 'gray'],
          sizes: ['S', 'M', 'L', 'XL'],
          customization: {
            models: ['shirt', 'hoodie'],
            sleeves: ['short', 'long'],
          },
        },
      };

      setCachedProduct(productId, productData);
      const cached = getCachedProduct(productId);

      expect(cached).toEqual(productData);
      expect(cached.details.customization.models).toContain('shirt');
    });
  });

  describe('clearProductCache', () => {
    it('should clear specific product cache', () => {
      const productId = 'test-product-4';
      const productData = { id: productId, name: 'Test' };

      setCachedProduct(productId, productData);
      expect(getCachedProduct(productId)).toEqual(productData);

      clearProductCache(productId);
      expect(getCachedProduct(productId)).toBeNull();
    });

    it('should clear all product caches', () => {
      const products = [
        { id: 'product-1', name: 'Product 1' },
        { id: 'product-2', name: 'Product 2' },
        { id: 'product-3', name: 'Product 3' },
      ];

      products.forEach((product) => {
        setCachedProduct(product.id, product);
      });

      // Verify all are cached
      products.forEach((product) => {
        expect(getCachedProduct(product.id)).toEqual(product);
      });

      // Clear all
      clearProductCache();

      // Verify all are cleared
      products.forEach((product) => {
        expect(getCachedProduct(product.id)).toBeNull();
      });
    });

    it('should handle clearing non-existent product', () => {
      expect(() => clearProductCache('non-existent')).not.toThrow();
    });
  });

  describe('getCacheStats', () => {
    it('should return zero stats for empty cache', () => {
      const stats = getCacheStats();

      expect(stats.productCount).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.totalSizeKB).toBe('0');
    });

    it('should calculate cache statistics', () => {
      const products = [
        { id: 'product-1', name: 'Product 1', price: 100 },
        { id: 'product-2', name: 'Product 2', price: 200 },
        { id: 'product-3', name: 'Product 3', price: 300 },
      ];

      products.forEach((product) => {
        setCachedProduct(product.id, product);
      });

      const stats = getCacheStats();

      expect(stats.productCount).toBe(3);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(parseFloat(stats.totalSizeKB)).toBeGreaterThan(0);
    });

    it('should handle large cached objects', () => {
      const largeProduct = {
        id: 'large-product',
        name: 'Large Product',
        description: 'A'.repeat(10000), // 10KB description
        details: Array(100).fill({ key: 'value' }),
      };

      setCachedProduct('large-product', largeProduct);
      const stats = getCacheStats();

      expect(stats.productCount).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(10000);
    });
  });

  describe('cleanExpiredCache', () => {
    it('should remove expired entries', () => {
      const productId = 'expired-product';
      const productData = { id: productId, name: 'Expired' };
      const shortTTL = 100; // 100ms

      setCachedProduct(productId, productData, shortTTL);
      expect(getCachedProduct(productId)).toEqual(productData);

      // Wait for expiry
      setTimeout(() => {
        const cleaned = cleanExpiredCache();
        expect(cleaned).toBeGreaterThan(0);
        expect(getCachedProduct(productId)).toBeNull();
      }, 150);
    });

    it('should not remove valid entries', () => {
      const products = [
        { id: 'product-1', name: 'Product 1' },
        { id: 'product-2', name: 'Product 2' },
      ];

      products.forEach((product) => {
        setCachedProduct(product.id, product);
      });

      const cleaned = cleanExpiredCache();
      expect(cleaned).toBe(0);

      // Verify products still exist
      products.forEach((product) => {
        expect(getCachedProduct(product.id)).toEqual(product);
      });
    });

    it('should handle empty cache', () => {
      const cleaned = cleanExpiredCache();
      expect(cleaned).toBe(0);
    });
  });

  describe('Cache edge cases', () => {
    it('should handle special characters in product IDs', () => {
      const productId = 'product-@#$%^&*()';
      const productData = { id: productId, name: 'Special' };

      setCachedProduct(productId, productData);
      expect(getCachedProduct(productId)).toEqual(productData);
    });

    it('should handle very long product names', () => {
      const productId = 'long-name-product';
      const longName = 'A'.repeat(1000);
      const productData = { id: productId, name: longName };

      setCachedProduct(productId, productData);
      const cached = getCachedProduct(productId);

      expect(cached.name).toBe(longName);
    });

    it('should handle null and undefined values', () => {
      const productId = 'null-product';
      const productData = {
        id: productId,
        name: 'Product',
        description: null,
        extra: undefined,
      };

      setCachedProduct(productId, productData);
      const cached = getCachedProduct(productId);

      expect(cached.description).toBeNull();
      expect(cached.extra).toBeUndefined();
    });

    it('should handle boolean and numeric values', () => {
      const productId = 'mixed-types-product';
      const productData = {
        id: productId,
        inStock: true,
        price: 99.99,
        rating: 4.5,
        quantity: 0,
      };

      setCachedProduct(productId, productData);
      const cached = getCachedProduct(productId);

      expect(cached.inStock).toBe(true);
      expect(cached.price).toBe(99.99);
      expect(cached.rating).toBe(4.5);
      expect(cached.quantity).toBe(0);
    });
  });

  describe('Multiple product caching', () => {
    it('should cache multiple products independently', () => {
      const products = Array.from({ length: 10 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        price: (i + 1) * 100,
      }));

      products.forEach((product) => {
        setCachedProduct(product.id, product);
      });

      products.forEach((product) => {
        const cached = getCachedProduct(product.id);
        expect(cached).toEqual(product);
      });
    });

    it('should handle updating cached products', () => {
      const productId = 'update-product';
      const originalData = { id: productId, name: 'Original', price: 100 };
      const updatedData = { id: productId, name: 'Updated', price: 150 };

      setCachedProduct(productId, originalData);
      expect(getCachedProduct(productId)).toEqual(originalData);

      setCachedProduct(productId, updatedData);
      expect(getCachedProduct(productId)).toEqual(updatedData);
    });
  });
});
