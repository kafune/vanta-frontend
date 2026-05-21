/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP/user
 */

import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number; // Max requests per window (default: 100)
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

// In-memory store for rate limit data
// In production, use Redis or similar
const store: RateLimitStore = {};

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip || "unknown",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or retrieve rate limit data
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const remaining = Math.max(0, maxRequests - store[key].count);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", store[key].resetTime);

    // Check if limit exceeded
    if (store[key].count >= maxRequests) {
      res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    // Increment counter
    store[key].count++;

    // Hook into response to skip counting if needed
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;

      res.send = function (data) {
        const statusCode = res.statusCode;

        if (
          (skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400)
        ) {
          store[key].count--;
        }

        return originalSend.call(this, data);
      };
    }

    next();
  };
}

/**
 * Create endpoint-specific rate limiters
 */
export const rateLimiters = {
  // Strict limit for auth endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),

  // Moderate limit for API endpoints
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  }),

  // Loose limit for public endpoints
  public: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 300,
  }),

  // Very strict for payment endpoints
  payment: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),
};

/**
 * Clean up old entries from store periodically
 */
export function startRateLimitCleanup(intervalMs = 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, intervalMs);
}
