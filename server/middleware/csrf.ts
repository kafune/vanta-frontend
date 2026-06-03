/**
 * CSRF Protection Middleware
 * Implements CSRF token validation for state-changing operations
 */

import { randomBytes } from "crypto";
import { Request, Response, NextFunction } from "express";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "__csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Middleware to attach CSRF token to response
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate or retrieve existing token
  const cookies = req.cookies || {};
  let token = cookies[CSRF_COOKIE_NAME];

  if (!token) {
    token = generateCsrfToken();
  }

  // Sempre re-emite o cookie (não só quando ausente) para garantir o atributo
  // httpOnly:false — assim usuários que já tinham o cookie httpOnly antigo
  // passam a conseguir lê-lo no JS (double-submit CSRF).
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Attach token to response for client to use
  res.locals.csrfToken = token;
  next();
}

/**
 * Middleware to validate CSRF token
 * Should be applied to state-changing operations (POST, PUT, DELETE, PATCH)
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip validation for GET requests
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  const cookies = req.cookies || {};
  const tokenFromCookie = cookies[CSRF_COOKIE_NAME];
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;

  if (!tokenFromCookie) {
    return res.status(403).json({ error: "CSRF token missing from cookie" });
  }

  if (!tokenFromHeader) {
    return res.status(403).json({ error: "CSRF token missing from header" });
  }

  // Compare tokens using constant-time comparison to prevent timing attacks
  if (!constantTimeCompare(tokenFromCookie, tokenFromHeader)) {
    return res.status(403).json({ error: "CSRF token validation failed" });
  }

  next();
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
