# syntax=docker/dockerfile:1.7
FROM oven/bun:1.3.10 AS base
WORKDIR /app

# ─── deps ──────────────────────────────────────────────────────
# Instala todas as dependências (inclui devDeps: vite/esbuild p/ build
# e drizzle-kit p/ migrações) a partir só do lockfile — sem código-fonte.
FROM base AS deps
COPY package.json bun.lock ./
COPY patches ./patches
RUN bun install --frozen-lockfile

# ─── build ─────────────────────────────────────────────────────
# As variáveis VITE_* são "assadas" no bundle do front em build-time,
# então PRECISAM existir aqui (passe via build args no Dokploy).
# Deixe vazias as de login/forge enquanto o login não foi migrado.
FROM base AS build
ARG VITE_APP_ID=
ARG VITE_APP_URL=
ARG VITE_FRONTEND_URL=
ARG VITE_STRIPE_PUBLISHABLE_KEY=
ARG VITE_OAUTH_PORTAL_URL=
ARG VITE_FRONTEND_FORGE_API_URL=
ARG VITE_FRONTEND_FORGE_API_KEY=
ENV VITE_APP_ID=$VITE_APP_ID \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_FRONTEND_URL=$VITE_FRONTEND_URL \
    VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY \
    VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL \
    VITE_FRONTEND_FORGE_API_URL=$VITE_FRONTEND_FORGE_API_URL \
    VITE_FRONTEND_FORGE_API_KEY=$VITE_FRONTEND_FORGE_API_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Gera dist/public (front via Vite) e dist/index.js (server via esbuild)
RUN bun run build

# ─── runtime ───────────────────────────────────────────────────
# O bundle do server usa --packages=external, então precisa do
# node_modules em runtime. drizzle-kit (migrações) também vive lá.
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
COPY drizzle.config.ts package.json ./

EXPOSE 3000

# Aplica migrações pendentes (idempotente) e sobe o servidor.
CMD ["sh", "-c", "bunx drizzle-kit migrate && bun dist/index.js"]
