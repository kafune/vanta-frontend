/**
 * Notificação ao dono da marca quando um pedido é pago.
 * Envia mensagem formatada (valor + itens + estampa) por canais self-hosted,
 * todos opcionais via env e best-effort (nunca bloqueia/quebra o pagamento):
 *  - n8n webhook (OWNER_WEBHOOK_URL): recebe o JSON e formata/encaminha (email/WhatsApp).
 *  - Evolution API direto (EVOLUTION_API_URL/KEY/INSTANCE + OWNER_WHATSAPP): WhatsApp.
 */

export interface OwnerOrderItem {
  productName: string;
  quantity: number;
  price: number; // centavos
  size?: string | null;
  color?: string | null;
  customImageUrl?: string | null;
}

export interface OwnerOrderInfo {
  orderId: string;
  totalPrice: number; // centavos
  items: OwnerOrderItem[];
  customerName?: string | null;
  customerEmail?: string | null;
}

const fmtBRL = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

function absUrl(path: string): string {
  if (!path || path.startsWith("http")) return path;
  const base = (process.env.APP_URL || process.env.VITE_APP_URL || "").replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}

function buildMessage(o: OwnerOrderInfo): string {
  const lines: string[] = ["🛍️ *Novo pedido pago!*", `Pedido: ${o.orderId}`];
  if (o.customerName) {
    lines.push(`Cliente: ${o.customerName}${o.customerEmail ? ` (${o.customerEmail})` : ""}`);
  }
  lines.push("", "*Itens:*");
  for (const it of o.items) {
    const extra = [it.size, it.color].filter(Boolean).join(" · ");
    lines.push(`• ${it.quantity}x ${it.productName}${extra ? ` (${extra})` : ""} — ${fmtBRL(it.price * it.quantity)}`);
    if (it.customImageUrl) lines.push(`   🎨 estampa: ${absUrl(it.customImageUrl)}`);
  }
  lines.push("", `*Total: ${fmtBRL(o.totalPrice)}*`);
  return lines.join("\n");
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}): Promise<void> {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function sendViaWebhook(o: OwnerOrderInfo, message: string, stampUrls: string[]): Promise<void> {
  const url = process.env.OWNER_WEBHOOK_URL;
  if (!url) return;
  await postJson(url, { type: "order_paid", ...o, message, stampUrls });
}

async function sendViaEvolution(message: string, stampUrls: string[]): Promise<void> {
  const base = process.env.EVOLUTION_API_URL;
  const apikey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  const number = process.env.OWNER_WHATSAPP;
  if (!base || !apikey || !instance || !number) return;

  const root = base.replace(/\/+$/, "");
  const headers = { apikey };
  await postJson(`${root}/message/sendText/${instance}`, { number, text: message }, headers);
  for (const media of stampUrls) {
    await postJson(`${root}/message/sendMedia/${instance}`, {
      number,
      mediatype: "image",
      media,
      caption: "Estampa do pedido",
    }, headers).catch(() => {});
  }
}

export async function notifyOwnerOfOrder(o: OwnerOrderInfo): Promise<void> {
  try {
    const message = buildMessage(o);
    const stampUrls = o.items
      .map((i) => i.customImageUrl)
      .filter((u): u is string => !!u)
      .map(absUrl);

    const results = await Promise.allSettled([
      sendViaWebhook(o, message, stampUrls),
      sendViaEvolution(message, stampUrls),
    ]);
    results.forEach((r) => {
      if (r.status === "rejected") console.error("[OwnerNotify] canal falhou:", r.reason);
    });
  } catch (error) {
    console.error("[OwnerNotify] erro inesperado:", error);
  }
}
