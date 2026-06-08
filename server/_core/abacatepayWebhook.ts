/**
 * Webhook da AbacatePay — confirma o pagamento automaticamente.
 * A AbacatePay envia um POST para /api/webhooks/abacatepay quando a cobrança é
 * paga. Validamos o segredo (ABACATEPAY_WEBHOOK_SECRET, enviado como query
 * ?webhookSecret= ou header x-webhook-secret) e marcamos o pedido como pago.
 *
 * Configurar no painel da AbacatePay a URL:
 *   https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=SEGREDO
 */

import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { ENV } from "./env";
import { getDb } from "../db";
import { pixPayments } from "../../drizzle/schema";
import { markPixPaid } from "../routers/pix";

export function registerAbacatePayWebhook(app: Express) {
  app.post("/api/webhooks/abacatepay", async (req: Request, res: Response) => {
    // Sem segredo configurado, o webhook fica desabilitado (evita confirmação forjada).
    if (!ENV.abacatePayWebhookSecret) {
      return res.status(503).json({ error: "webhook not configured" });
    }
    const provided = (req.query.webhookSecret as string) || (req.headers["x-webhook-secret"] as string);
    if (provided !== ENV.abacatePayWebhookSecret) {
      return res.status(401).json({ error: "invalid secret" });
    }

    try {
      const event = req.body ?? {};
      const data = event.data ?? {};
      // A AbacatePay aninha a cobrança de formas diferentes conforme o evento.
      const charge = data.pixQrCode ?? data.billing ?? data;
      const gatewayId: string | undefined = charge?.id ?? data?.id;
      const status: string = String(charge?.status ?? data?.status ?? "").toUpperCase();
      const isPaid = status === "PAID" || event.event === "billing.paid" || event.event === "pixQrCode.paid";

      if (!gatewayId || !isPaid) {
        return res.status(200).json({ ok: true, ignored: true });
      }

      const db = await getDb();
      if (!db) return res.status(200).json({ ok: true });

      const [payment] = await db
        .select()
        .from(pixPayments)
        .where(eq(pixPayments.gatewayId, gatewayId))
        .limit(1);

      if (payment && payment.status !== "confirmed") {
        await markPixPaid(db, payment.id, payment.orderId);
        console.log(`[AbacatePay] Pagamento confirmado via webhook: pedido ${payment.orderId}`);
      }
      return res.status(200).json({ ok: true });
    } catch (error) {
      // Responde 200 para evitar tempestade de retentativas; o erro fica logado.
      console.error("[AbacatePay] Erro no webhook:", error);
      return res.status(200).json({ ok: true });
    }
  });
}
