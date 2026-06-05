import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { securityHeadersMiddleware } from "../middleware/securityHeaders";
import { csrfTokenMiddleware, validateCsrfToken } from "../middleware/csrf";
import { rateLimiters, startRateLimitCleanup } from "../middleware/rateLimiter";
import cookieParser from "cookie-parser";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security middleware
  app.use(securityHeadersMiddleware);
  app.use(csrfTokenMiddleware);

  // Rate limiting
  app.use("/api/auth", rateLimiters.auth);
  app.use("/api/payment", rateLimiters.payment);
  app.use("/api/trpc", rateLimiters.api);

  // Start rate limit cleanup
  startRateLimitCleanup();

  // Configure body parser with larger size limit for file uploads
  app.use(cookieParser());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API with CSRF validation for mutations
  app.use("/api/trpc", validateCsrfToken);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Security headers enabled`);
    console.log(`CSRF protection enabled`);
    console.log(`Rate limiting enabled`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
