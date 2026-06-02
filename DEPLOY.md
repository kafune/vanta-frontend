# Deploy na VPS com Dokploy

App full-stack único: **Bun + Express + tRPC + Drizzle (MySQL)**. O servidor
serve a API (`/api/trpc`) **e** o front buildado (`dist/public`) no mesmo processo.
Build e runtime são via **Bun**, em Docker (`Dockerfile`). O Dokploy cuida de
proxy (Traefik), HTTPS/Let's Encrypt e deploy a partir do GitHub.

> Validado localmente: `docker build` + MySQL + migrações aplicadas + `HTTP 200`.

## Dependências
- **MySQL** — criado dentro do próprio Dokploy (sem serviço externo).
- **Pix** — self-contained (só `PIX_KEY` / `PIX_OWNER_NAME`).
- **E-mail** — SMTP opcional (qualquer servidor; em branco = desativado).
- **Login (OAuth)** — ainda chama o servidor do Manus. Migração p/ auth próprio
  ficou para depois; até lá, ou preenche `OAUTH_SERVER_URL`/`OWNER_OPEN_ID` com os
  valores do Manus, ou sobe sem login.
- **Imagens de produto** — são URLs em texto no banco; não há upload. (O storage
  do Manus só seria usado pela geração de imagem por IA, que não está ligada.)

## Passo a passo no Dokploy

1. **Subir o código para o GitHub** (este repo). O Dokploy faz deploy a partir dele.

2. **Criar o banco MySQL** — em *Databases* → *Create* → MySQL.
   Anote usuário, senha, database e o **nome interno do serviço** (vira o host).
   A `DATABASE_URL` fica algo como:
   `mysql://USUARIO:SENHA@NOME-INTERNO-MYSQL:3306/DATABASE`

3. **Criar a aplicação** — *Create Application* → *Provider: GitHub* → selecione o repo/branch.
   - **Build Type:** `Dockerfile` (raiz do projeto).
   - **Port:** `3000`.

4. **Build Args** (aba *Build* → *Build Args*) — as `VITE_*` são assadas no front
   em build-time, então vão **aqui**, não só em Environment:
   ```
   VITE_APP_URL=https://loja.seudominio.com.br
   VITE_FRONTEND_URL=https://loja.seudominio.com.br
   VITE_APP_ID=dark-fashion-store
   ```
   (E `VITE_STRIPE_PUBLISHABLE_KEY` / `VITE_OAUTH_PORTAL_URL` se for usar.)

5. **Environment** (variáveis de runtime) — ver `.env.example`. Mínimo:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=mysql://USUARIO:SENHA@NOME-INTERNO-MYSQL:3306/DATABASE
   JWT_SECRET=<openssl rand -hex 32>
   PIX_KEY=sua-chave-pix
   PIX_OWNER_NAME=NOME DO RECEBEDOR
   ```
   SMTP e OAuth conforme necessidade.

6. **Domínio** — aba *Domains* → adicione `loja.seudominio.com.br`, porta `3000`,
   HTTPS/Let's Encrypt ligado. Aponte o DNS (A record) para o IP da VPS.

7. **Deploy.** No boot o container roda `drizzle-kit migrate` (idempotente) e sobe.
   Acompanhe em *Logs*: deve aparecer `migrations applied successfully` e
   `Server running on http://localhost:3000/`.

8. **Auto-deploy** (opcional) — habilite o webhook do GitHub no Dokploy para
   redeployar a cada push na branch.

## Comandos úteis (validar local)
```bash
bun install
bun run build          # gera dist/index.js + dist/public
docker build -t vanta .
```
