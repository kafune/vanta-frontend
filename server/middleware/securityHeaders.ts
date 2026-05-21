/**
 * Security Headers Middleware
 * Adds essential security headers to all responses
 */

import { Request, Response, NextFunction } from "express";

/**
 * Middleware to add security headers
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  // Restricts resources that can be loaded
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' https: data: blob:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-Frame-Options
  // Prevents clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");

  // X-XSS-Protection
  // Enables browser XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  // Controls how much referrer information is shared
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (formerly Feature-Policy)
  // Controls which browser features can be used
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );

  // Strict-Transport-Security
  // Forces HTTPS connections (only in production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  next();
}
