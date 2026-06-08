/**
 * Cliente da AbacatePay (gateway de pagamento PIX brasileiro).
 * Estrutura pronta; a chave vem de ABACATEPAY_API_KEY (env). Enquanto a chave não
 * estiver setada, isConfigured() é false e o fluxo cai no PIX estático.
 *
 * Docs: https://docs.abacatepay.com — endpoints usados:
 *   POST /pixQrCode/create  -> cria cobrança PIX (retorna brCode + QR base64)
 *   GET  /pixQrCode/check   -> consulta status de uma cobrança
 */

import { ENV } from "./env";

export function isAbacatePayConfigured(): boolean {
  return ENV.abacatePayApiKey.length > 0;
}

type AbacateCreateInput = {
  amountCents: number;
  description: string;
  // Em segundos; AbacatePay expira a cobrança após esse tempo.
  expiresInSeconds?: number;
  externalId?: string; // nosso orderId, para conciliação
  customer?: { name?: string; email?: string; cellphone?: string; taxId?: string };
};

export type AbacatePixCharge = {
  id: string;
  brCode: string; // copia-e-cola
  brCodeBase64: string; // imagem do QR (data URL ou base64)
  status: string; // PENDING, PAID, EXPIRED, CANCELLED...
  amountCents: number;
  expiresAt: string | null;
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!isAbacatePayConfigured()) {
    throw new Error("AbacatePay não configurado (defina ABACATEPAY_API_KEY)");
  }
  const res = await fetch(`${ENV.abacatePayBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ENV.abacatePayApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok || json?.error) {
    const message = json?.error || json?.message || `AbacatePay HTTP ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return (json?.data ?? json) as T;
}

// Normaliza a resposta da AbacatePay para o nosso formato.
function normalizeCharge(raw: any): AbacatePixCharge {
  return {
    id: raw.id,
    brCode: raw.brCode ?? raw.pixCopyPaste ?? "",
    brCodeBase64: raw.brCodeBase64 ?? raw.qrCode ?? "",
    status: (raw.status ?? "PENDING").toUpperCase(),
    amountCents: raw.amount ?? raw.amountCents ?? 0,
    expiresAt: raw.expiresAt ?? null,
  };
}

export async function createPixCharge(input: AbacateCreateInput): Promise<AbacatePixCharge> {
  const body = {
    amount: input.amountCents,
    expiresIn: input.expiresInSeconds ?? 1800,
    description: input.description,
    customer: input.customer,
    // externalId é aninhado em metadata (conforme a API da AbacatePay) — é como
    // conciliamos a cobrança com o nosso orderId.
    metadata: input.externalId ? { externalId: input.externalId } : undefined,
  };
  const data = await request<any>("/pixQrCode/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeCharge(data);
}

export async function getPixChargeStatus(chargeId: string): Promise<AbacatePixCharge> {
  const data = await request<any>(`/pixQrCode/check?id=${encodeURIComponent(chargeId)}`, {
    method: "GET",
  });
  return normalizeCharge(data);
}

// A AbacatePay considera paga quando status === "PAID".
export function isChargePaid(status: string): boolean {
  return status.toUpperCase() === "PAID";
}
