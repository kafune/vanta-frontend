/**
 * Product Cache Hook
 * Manages client-side caching of product data
 */

import { useCallback, useEffect, useState } from 'react';

const CACHE_PREFIX = 'vanta:product:';
const CACHE_EXPIRY_PREFIX = 'vanta:expiry:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  force?: boolean; // Force refresh from network
}

/**
 * Get cached product data
 */
export function getCachedProduct(productId: string) {
  const key = `${CACHE_PREFIX}${productId}`;
  const expiryKey = `${CACHE_EXPIRY_PREFIX}${productId}`;

  try {
    const cached = localStorage.getItem(key);
    const expiry = localStorage.getItem(expiryKey);

    if (!cached || !expiry) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem(key);
      localStorage.removeItem(expiryKey);
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('[Cache] Error retrieving cached product:', error);
    return null;
  }
}

/**
 * Set cached product data
 */
export function setCachedProduct(productId: string, data: any, ttl = DEFAULT_TTL) {
  const key = `${CACHE_PREFIX}${productId}`;
  const expiryKey = `${CACHE_EXPIRY_PREFIX}${productId}`;

  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(expiryKey, String(Date.now() + ttl));
  } catch (error) {
    console.error('[Cache] Error caching product:', error);
  }
}

/**
 * Clear product cache
 */
export function clearProductCache(productId?: string) {
  try {
    if (productId) {
      const key = `${CACHE_PREFIX}${productId}`;
      const expiryKey = `${CACHE_EXPIRY_PREFIX}${productId}`;
      localStorage.removeItem(key);
      localStorage.removeItem(expiryKey);
    } else {
      // Clear all product caches
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
  }
}

/**
 * Hook to manage product cache
 */
export function useProductCache(productId: string, options: CacheOptions = {}) {
  const { ttl = DEFAULT_TTL, force = false } = options;
  const [cached, setCached] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Check cache on mount
  useEffect(() => {
    if (force) {
      setIsExpired(true);
      return;
    }

    const cachedData = getCachedProduct(productId);
    if (cachedData) {
      setCached(cachedData);
      setIsExpired(false);
    } else {
      setIsExpired(true);
    }
  }, [productId, force]);

  // Cache data
  const cacheData = useCallback(
    (data: any) => {
      setCachedProduct(productId, data, ttl);
      setCached(data);
      setIsExpired(false);
    },
    [productId, ttl]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    clearProductCache(productId);
    setCached(null);
    setIsExpired(true);
  }, [productId]);

  return {
    cached,
    isExpired,
    cacheData,
    clearCache,
  };
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  try {
    let productCount = 0;
    let totalSize = 0;

    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        productCount++;
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
    });

    return {
      productCount,
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
    };
  } catch (error) {
    console.error('[Cache] Error getting cache stats:', error);
    return {
      productCount: 0,
      totalSize: 0,
      totalSizeKB: '0',
    };
  }
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache() {
  try {
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_EXPIRY_PREFIX)) {
        const expiry = localStorage.getItem(key);
        if (expiry && Date.now() > parseInt(expiry)) {
          const productId = key.replace(CACHE_EXPIRY_PREFIX, '');
          clearProductCache(productId);
          cleanedCount++;
        }
      }
    });

    console.log(`[Cache] Cleaned ${cleanedCount} expired entries`);
    return cleanedCount;
  } catch (error) {
    console.error('[Cache] Error cleaning expired cache:', error);
    return 0;
  }
}

export default {
  getCachedProduct,
  setCachedProduct,
  clearProductCache,
  useProductCache,
  getCacheStats,
  cleanExpiredCache,
};
