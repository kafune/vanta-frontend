/**
 * Upload self-hosted de imagens (sem dependência do Manus).
 * Recebe um data URL base64, valida tipo/tamanho, grava em disco e devolve a
 * URL pública servida pelo Express em /uploads. Em produção (Dokploy) a pasta
 * UPLOADS_DIR deve ser um volume persistente, senão os arquivos somem no redeploy.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), "uploads");

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function getUploadsDir(): string {
  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  return UPLOADS_DIR;
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1].toLowerCase(), buffer: Buffer.from(match[2], "base64") };
}

/**
 * Grava uma imagem (data URL base64) e retorna a URL pública (/uploads/...).
 */
export function saveImageDataUrl(
  dataUrl: string,
  opts?: { maxBytes?: number; prefix?: string }
): { url: string } {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error("Imagem inválida (esperado data URL base64).");
  }
  const ext = MIME_EXT[parsed.mime];
  if (!ext) {
    throw new Error("Tipo de imagem não suportado (use PNG, JPG, WebP ou GIF).");
  }
  const maxBytes = opts?.maxBytes ?? 10 * 1024 * 1024;
  if (parsed.buffer.length > maxBytes) {
    throw new Error(`Imagem muito grande (máx. ${Math.round(maxBytes / 1024 / 1024)}MB).`);
  }

  const dir = getUploadsDir();
  const name = `${opts?.prefix ?? "img"}_${nanoid(16)}.${ext}`;
  writeFileSync(path.join(dir, name), parsed.buffer);
  return { url: `/uploads/${name}` };
}
