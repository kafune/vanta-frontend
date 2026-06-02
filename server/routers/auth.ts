/**
 * Auth Router — login local (email + senha).
 * Reaproveita a sessão JWT existente (sdk.signSession + cookie COOKIE_NAME):
 * o token guarda o openId do usuário, que createContext resolve via DB.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { publicProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import { hashPassword, verifyPassword } from "../_core/password";
import { getUserByEmail, createLocalUser } from "../db";
import type { User } from "../../drizzle/schema";

// Remove o hash de senha antes de devolver o usuário ao cliente.
function sanitize(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function startSession(
  res: { cookie: (name: string, value: string, opts: any) => void },
  req: any,
  user: User
) {
  const token = await sdk.signSession({
    openId: user.openId,
    appId: ENV.appId,
    name: user.name ?? "",
  });
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: ONE_YEAR_MS,
  });
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const authRouter = router({
  // Usuário da sessão atual (sem o hash de senha), ou null.
  me: publicProcedure.query(({ ctx }) => (ctx.user ? sanitize(ctx.user) : null)),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(normalizeEmail(input.email));
      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha inválidos" });
      }
      await startSession(ctx.res, ctx.req, user);
      return sanitize(user);
    }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Informe seu nome").max(255),
        email: z.string().email(),
        password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      const existing = await getUserByEmail(email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Este email já está cadastrado" });
      }
      const user = await createLocalUser({
        name: input.name.trim(),
        email,
        passwordHash: hashPassword(input.password),
        role: "user",
      });
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar conta" });
      }
      await startSession(ctx.res, ctx.req, user);
      return sanitize(user);
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
