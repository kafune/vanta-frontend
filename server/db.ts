import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { hashPassword } from './_core/password';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Login local (email + senha) ──────────────────────────────

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Cria um usuário local (login por email+senha). Gera um openId próprio. */
export async function createLocalUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const openId = `local_${nanoid(21)}`;
  await db.insert(users).values({
    openId,
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    loginMethod: "local",
    role: input.role ?? "user",
    lastSignedIn: new Date(),
  });
  return getUserByOpenId(openId);
}

/**
 * Garante o admin inicial a partir de ADMIN_EMAIL/ADMIN_PASSWORD (idempotente).
 * Rodado no boot. Se o email já existe, promove a admin (sem trocar a senha).
 */
export async function ensureAdminUser(): Promise<void> {
  if (!ENV.adminEmail || !ENV.adminPassword) return;
  const db = await getDb();
  if (!db) return;

  const existing = await getUserByEmail(ENV.adminEmail);
  if (existing) {
    if (existing.role !== "admin") {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
      console.log(`[Auth] Usuário ${ENV.adminEmail} promovido a admin.`);
    }
    return;
  }

  await createLocalUser({
    name: ENV.adminName,
    email: ENV.adminEmail,
    passwordHash: hashPassword(ENV.adminPassword),
    role: "admin",
  });
  console.log(`[Auth] Admin inicial criado: ${ENV.adminEmail}`);
}

/**
 * Atualiza dados de contato (celular/CPF) do usuário. Só grava os campos
 * informados. Usado no checkout PIX para reaproveitar nas próximas compras.
 */
export async function updateUserContact(
  userId: number,
  input: { phone?: string; taxId?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const set: { phone?: string; taxId?: string } = {};
  if (input.phone !== undefined) set.phone = input.phone;
  if (input.taxId !== undefined) set.taxId = input.taxId;
  if (Object.keys(set).length === 0) return;
  await db.update(users).set(set).where(eq(users.id, userId));
}

// TODO: add feature queries here as your schema grows.
