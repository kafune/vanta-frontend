/**
 * Settings Router — configurações da loja (chave/valor).
 * Leitura pública (getPublic); escrita só admin (set).
 */

import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { settings } from "../../drizzle/schema";

// Chaves conhecidas (evita lixo na tabela e dá defaults).
export const SETTING_KEYS = ["storeName", "contactEmail", "contactWhatsapp", "announcement"] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

const DEFAULTS: Record<SettingKey, string> = {
  storeName: "VANTA",
  contactEmail: "",
  contactWhatsapp: "",
  announcement: "",
};

async function readAll(): Promise<Record<SettingKey, string>> {
  const db = await getDb();
  const result = { ...DEFAULTS };
  if (!db) return result;
  const rows = await db.select().from(settings);
  for (const row of rows) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
      result[row.key as SettingKey] = row.value ?? "";
    }
  }
  return result;
}

export const settingsRouter = router({
  getPublic: publicProcedure.query(() => readAll()),

  set: adminProcedure
    .input(z.object({ key: z.enum(SETTING_KEYS), value: z.string().max(2000) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .insert(settings)
        .values({ key: input.key, value: input.value })
        .onDuplicateKeyUpdate({ set: { value: input.value } });
      return { key: input.key };
    }),
});
