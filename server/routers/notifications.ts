/**
 * Email Notifications Router
 * Handles sending email notifications for order status updates
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailLogs, orders, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true" || false,
  auth: {
    user: process.env.SMTP_USER || "test@ethereal.email",
    pass: process.env.SMTP_PASSWORD || "test123456",
  },
});

// Status message mapping
const statusMessages: Record<string, string> = {
  pendente: "Seu pedido está sendo processado",
  confirmado: "Seu pedido foi confirmado",
  enviado: "Seu pedido foi despachado",
  entregue: "Seu pedido foi entregue com sucesso",
  cancelado: "Seu pedido foi cancelado",
};

// Status color mapping for email templates
const statusColors: Record<string, string> = {
  pendente: "#ff9800",
  confirmado: "#2196f3",
  enviado: "#2196f3",
  entregue: "#4caf50",
  cancelado: "#f44336",
};

/**
 * Get order status update email template
 */
function getOrderStatusUpdateTemplate(data: {
  orderId: string;
  trackingNumber: string;
  customerName?: string;
  status: string;
  message?: string;
}): string {
  const statusColor = statusColors[data.status] || "#0B0B0B";
  const statusMessage = statusMessages[data.status] || "Atualização de Pedido";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'DM Sans', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #0B0B0B; color: #EFEFEF; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px; }
          .status-banner { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 4px; margin-bottom: 30px; }
          .status-banner h2 { margin: 0; font-size: 20px; }
          .info-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid ${statusColor}; }
          .tracking-number { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #0B0B0B; }
          .cta-button { display: inline-block; background-color: #0B0B0B; color: #EFEFEF; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          .footer a { color: #0B0B0B; text-decoration: none; }
          .timestamp { color: #999; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VANTA</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(239,239,239,0.7);">Atualização de Pedido</p>
          </div>
          
          <div class="content">
            <div class="status-banner">
              <h2>${statusMessage}</h2>
            </div>
            
            <p style="color: #333; margin-top: 0;">Olá${data.customerName ? ` ${data.customerName}` : ""},</p>
            <p style="color: #333;">${data.message || "Seu pedido foi atualizado. Confira os detalhes abaixo."}</p>
            
            <div class="info-box">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">Número de Rastreamento</p>
              <p class="tracking-number">${data.trackingNumber}</p>
              <p class="timestamp">${new Date().toLocaleDateString("pt-PT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://darkfashn-ljqd3zro.manus.space/track/${data.orderId}" class="cta-button">Rastrear Pedido</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #333; font-size: 14px; margin: 0;">
                <strong>ID do Pedido:</strong> ${data.orderId}
              </p>
              <p style="color: #333; font-size: 14px; margin: 10px 0 0 0;">
                Se tiver dúvidas, entre em contato com nosso suporte.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">VANTA — Premium Fashion Store</p>
            <p style="margin: 8px 0 0 0;">
              <a href="https://darkfashn-ljqd3zro.manus.space">Visitar Loja</a> • 
              <a href="mailto:support@vanta.com">Suporte</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Log email notification
 */
async function logEmailNotification(
  orderId: string,
  userId: number,
  email: string,
  emailType: string,
  subject: string,
  success: boolean,
  errorMessage?: string
) {
  try {
    const db = await getDb();
    if (!db) return;

    const id = `email-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(emailLogs).values({
      id,
      orderId,
      userId,
      recipientEmail: email,
      emailType: emailType as any,
      status: success ? "sent" : "failed",
      subject,
      errorMessage,
      sentAt: success ? new Date() : undefined,
    });
  } catch (error) {
    console.error("[Email Log] Failed to log email notification:", error);
  }
}

export const notificationsRouter = router({
  /**
   * Send order status update notification
   */
  sendOrderStatusUpdate: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["pendente", "confirmado", "enviado", "entregue", "cancelado"]),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get order details
        const orderResult = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!orderResult || orderResult.length === 0) {
          throw new Error("Order not found");
        }

        const order = orderResult[0];

        // Get user details
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);

        if (!userResult || userResult.length === 0) {
          throw new Error("User not found");
        }

        const user = userResult[0];
        const customerEmail = user.email || "customer@example.com";
        const customerName = user.name || "Valued Customer";

        // Generate email template
        const html = getOrderStatusUpdateTemplate({
          orderId: input.orderId,
          trackingNumber: order.trackingNumber || "N/A",
          customerName,
          status: input.status,
          message: input.message,
        });

        // Send email
        const mailOptions = {
          from: '"VANTA Store" <noreply@vanta.com>',
          to: customerEmail,
          subject: `Atualização de Pedido - ${order.trackingNumber || input.orderId}`,
          html,
        };

        try {
          await transporter.sendMail(mailOptions);
          
          // Log successful email
          await logEmailNotification(
            input.orderId,
            order.userId,
            customerEmail,
            "status_update",
            mailOptions.subject,
            true
          );

          console.log(`[Email] Status update sent to ${customerEmail} for order ${input.orderId}`);
          return { success: true, message: "Email sent successfully" };
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
          
          // Log failed email
          await logEmailNotification(
            input.orderId,
            order.userId,
            customerEmail,
            "status_update",
            mailOptions.subject,
            false,
            errorMsg
          );

          console.error("[Email] Failed to send status update:", emailError);
          return { success: false, message: "Failed to send email" };
        }
      } catch (error) {
        console.error("[Notification] Error sending status update:", error);
        return { success: false, message: "Error processing request" };
      }
    }),

  /**
   * Get email logs for an order
   */
  getEmailLogs: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const logs = await db
          .select()
          .from(emailLogs)
          .where(eq(emailLogs.orderId, input.orderId));

        return logs;
      } catch (error) {
        console.error("[Email Logs] Error fetching logs:", error);
        return [];
      }
    }),

  /**
   * Resend notification for an order
   */
  resendNotification: publicProcedure.use(async ({ ctx, next }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    return next();
  })
    .input(
      z.object({
        orderId: z.string(),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get order details
        const orderResult = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!orderResult || orderResult.length === 0) {
          throw new Error("Order not found");
        }

        const order = orderResult[0];

        // Get user details
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);

        if (!userResult || userResult.length === 0) {
          throw new Error("User not found");
        }

        const user = userResult[0];
        const customerEmail = user.email || "customer@example.com";
        const customerName = user.name || "Valued Customer";

        // Generate email template
        const html = getOrderStatusUpdateTemplate({
          orderId: input.orderId,
          trackingNumber: order.trackingNumber || "N/A",
          customerName,
          status: order.status,
          message: input.customMessage || `Reenviando atualização de status: ${order.status}`,
        });

        // Send email
        const mailOptions = {
          from: '"VANTA Store" <noreply@vanta.com>',
          to: customerEmail,
          subject: `[REENVIO] Atualização de Pedido - ${order.trackingNumber || input.orderId}`,
          html,
        };

        try {
          await transporter.sendMail(mailOptions);
          
          // Log successful email
          await logEmailNotification(
            input.orderId,
            order.userId,
            customerEmail,
            "resend",
            mailOptions.subject,
            true
          );

          console.log(`[Email] Resend notification sent to ${customerEmail} for order ${input.orderId}`);
          return { success: true, message: "Notificação reenviada com sucesso" };
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
          
          // Log failed email
          await logEmailNotification(
            input.orderId,
            order.userId,
            customerEmail,
            "resend",
            mailOptions.subject,
            false,
            errorMsg
          );

          console.error("[Email] Failed to resend notification:", emailError);
          return { success: false, message: "Falha ao reenviar notificação" };
        }
      } catch (error) {
        console.error("[Notification] Error resending notification:", error);
        return { success: false, message: "Erro ao processar reenvio" };
      }
    }),

  /**
   * Get email logs for a user
   */
  getUserEmailLogs: publicProcedure
    .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Only allow users to see their own logs, admins can see all
        if (ctx.user?.id !== input.userId && ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const logs = await db
          .select()
          .from(emailLogs)
          .where(eq(emailLogs.userId, input.userId))
          .limit(input.limit);

        return logs;
      } catch (error) {
        console.error("[Email Logs] Error fetching user logs:", error);
        return [];
      }
    }),
});
