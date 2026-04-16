/**
 * Email Service
 * Handles email notifications for orders, shipments, and delivery updates
 */

import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

interface OrderConfirmationData {
  orderId: string;
  trackingNumber: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  estimatedDelivery: string;
}

interface ShipmentNotificationData {
  orderId: string;
  trackingNumber: string;
  customerEmail: string;
  customerName?: string;
  carrier: string;
  estimatedDelivery: string;
  trackingUrl: string;
}

interface DeliveryUpdateData {
  orderId: string;
  trackingNumber: string;
  customerEmail: string;
  customerName?: string;
  status: string;
  location: string;
  timestamp: Date;
  trackingUrl: string;
}

// Configure email transporter (using test service for development)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "test@ethereal.email",
    pass: "test123456",
  },
});

/**
 * Order Confirmation Email Template
 */
function getOrderConfirmationTemplate(data: OrderConfirmationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left; color: #333;">${item.name}</td>
      <td style="padding: 12px; text-align: center; color: #333;">${item.quantity}x ${item.size ? `(${item.size})` : ""}</td>
      <td style="padding: 12px; text-align: right; color: #333;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

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
          .section { margin-bottom: 30px; }
          .section h2 { color: #0B0B0B; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #0B0B0B; padding-bottom: 10px; }
          .tracking-box { background-color: #f9f9f9; border-left: 4px solid #0B0B0B; padding: 15px; margin: 15px 0; }
          .tracking-number { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #0B0B0B; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .summary-row.total { border-bottom: 2px solid #0B0B0B; font-weight: bold; font-size: 16px; padding: 15px 0; }
          .cta-button { display: inline-block; background-color: #0B0B0B; color: #EFEFEF; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          .footer a { color: #0B0B0B; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VANTA</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(239,239,239,0.7);">Confirmação de Pedido</p>
          </div>
          
          <div class="content">
            <p style="color: #333; margin-top: 0;">Olá${data.customerName ? ` ${data.customerName}` : ""},</p>
            <p style="color: #333;">Obrigado pela sua compra! Seu pedido foi confirmado com sucesso e está sendo preparado para envio.</p>
            
            <div class="section">
              <h2>Número de Rastreamento</h2>
              <div class="tracking-box">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">VANTA Tracking Number</p>
                <p class="tracking-number">${data.trackingNumber}</p>
              </div>
            </div>
            
            <div class="section">
              <h2>Detalhes do Pedido</h2>
              <table>
                <thead>
                  <tr style="background-color: #f9f9f9;">
                    <th style="padding: 12px; text-align: left; color: #0B0B0B; font-weight: bold;">Produto</th>
                    <th style="padding: 12px; text-align: center; color: #0B0B0B; font-weight: bold;">Quantidade</th>
                    <th style="padding: 12px; text-align: right; color: #0B0B0B; font-weight: bold;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="summary-row">
                <span>Subtotal</span>
                <span>€${data.subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>IVA (10%)</span>
                <span>€${data.tax.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Envio</span>
                <span>${data.shipping === 0 ? "Grátis" : `€${data.shipping.toFixed(2)}`}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>€${data.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="section">
              <h2>Entrega Estimada</h2>
              <p style="color: #333; margin: 0;">${data.estimatedDelivery}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://darkfashn-ljqd3zro.manus.space/track/${data.orderId}" class="cta-button">Rastrear Pedido</a>
            </div>
            
            <div class="section">
              <h2>Próximos Passos</h2>
              <p style="color: #333; margin: 0;">1. Seu pedido será preparado em nosso armazém<br>2. Receberá um email quando for despachado<br>3. Poderá rastrear em tempo real a entrega</p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">VANTA — Premium Fashion Store</p>
            <p style="margin: 8px 0 0 0;">
              <a href="https://darkfashn-ljqd3zro.manus.space">Visitar Loja</a> • 
              <a href="mailto:support@obsidian.com">Suporte</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Shipment Notification Email Template
 */
function getShipmentNotificationTemplate(data: ShipmentNotificationData): string {
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
          .section { margin-bottom: 30px; }
          .section h2 { color: #0B0B0B; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #0B0B0B; padding-bottom: 10px; }
          .tracking-box { background-color: #f9f9f9; border-left: 4px solid #0B0B0B; padding: 15px; margin: 15px 0; }
          .tracking-number { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #0B0B0B; }
          .info-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
          .cta-button { display: inline-block; background-color: #0B0B0B; color: #EFEFEF; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          .footer a { color: #0B0B0B; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VANTA</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(239,239,239,0.7);">Seu Pedido Foi Despachado!</p>
          </div>
          
          <div class="content">
            <p style="color: #333; margin-top: 0;">Olá${data.customerName ? ` ${data.customerName}` : ""},</p>
            <p style="color: #333;">Ótimas notícias! Seu pedido foi despachado e está a caminho.</p>
            
            <div class="info-box">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">✓ Pedido Despachado com Sucesso</p>
            </div>
            
            <div class="section">
              <h2>Informações de Envio</h2>
              <div class="tracking-box">
                <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">Número de Rastreamento</p>
                <p class="tracking-number">${data.trackingNumber}</p>
              </div>
              <p style="color: #333; margin: 15px 0 5px 0;"><strong>Transportadora:</strong> ${data.carrier}</p>
              <p style="color: #333; margin: 5px 0;"><strong>Entrega Estimada:</strong> ${data.estimatedDelivery}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.trackingUrl}" class="cta-button">Rastrear Agora</a>
            </div>
            
            <div class="section">
              <h2>O Que Fazer Agora?</h2>
              <p style="color: #333; margin: 0;">1. Clique no botão acima para rastrear seu pedido em tempo real<br>2. Receberá atualizações de status por email<br>3. Prepare-se para receber sua encomenda na data estimada</p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">VANTA — Premium Fashion Store</p>
            <p style="margin: 8px 0 0 0;">
              <a href="https://darkfashn-ljqd3zro.manus.space">Visitar Loja</a> • 
              <a href="mailto:support@obsidian.com">Suporte</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Delivery Update Email Template
 */
function getDeliveryUpdateTemplate(data: DeliveryUpdateData): string {
  const statusMessages: Record<string, string> = {
    in_transit: "Seu pedido está em trânsito",
    out_for_delivery: "Seu pedido saiu para entrega hoje",
    delivered: "Seu pedido foi entregue com sucesso",
  };

  const statusColors: Record<string, string> = {
    in_transit: "#2196f3",
    out_for_delivery: "#ff9800",
    delivered: "#4caf50",
  };

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
          .status-banner { background-color: ${statusColors[data.status] || "#0B0B0B"}; color: white; padding: 20px; text-align: center; border-radius: 4px; margin-bottom: 30px; }
          .status-banner h2 { margin: 0; font-size: 20px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #0B0B0B; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #0B0B0B; padding-bottom: 10px; }
          .tracking-box { background-color: #f9f9f9; border-left: 4px solid #0B0B0B; padding: 15px; margin: 15px 0; }
          .tracking-number { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #0B0B0B; }
          .info-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .cta-button { display: inline-block; background-color: #0B0B0B; color: #EFEFEF; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          .footer a { color: #0B0B0B; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VANTA</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(239,239,239,0.7);">Atualização de Entrega</p>
          </div>
          
          <div class="content">
            <div class="status-banner">
              <h2>${statusMessages[data.status] || "Atualização de Pedido"}</h2>
            </div>
            
            <p style="color: #333; margin-top: 0;">Olá${data.customerName ? ` ${data.customerName}` : ""},</p>
            
            <div class="info-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">Localização Atual</p>
              <p style="margin: 0; color: #0B0B0B; font-weight: bold; font-size: 16px;">${data.location}</p>
              <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">${data.timestamp.toLocaleDateString("pt-PT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}</p>
            </div>
            
            <div class="section">
              <h2>Número de Rastreamento</h2>
              <div class="tracking-box">
                <p class="tracking-number">${data.trackingNumber}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.trackingUrl}" class="cta-button">Ver Rastreamento Completo</a>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">VANTA — Premium Fashion Store</p>
            <p style="margin: 8px 0 0 0;">
              <a href="https://darkfashn-ljqd3zro.manus.space">Visitar Loja</a> • 
              <a href="mailto:support@obsidian.com">Suporte</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<boolean> {
  try {
    const html = getOrderConfirmationTemplate(data);
    await transporter.sendMail({
      from: '"VANTA Store" <noreply@obsidian.com>',
      to: data.customerEmail,
      subject: `Pedido Confirmado - ${data.trackingNumber}`,
      html,
    });
    console.log(`[Email] Order confirmation sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send order confirmation:", error);
    return false;
  }
}

/**
 * Send Shipment Notification Email
 */
export async function sendShipmentNotificationEmail(data: ShipmentNotificationData): Promise<boolean> {
  try {
    const html = getShipmentNotificationTemplate(data);
    await transporter.sendMail({
      from: '"VANTA Store" <noreply@obsidian.com>',
      to: data.customerEmail,
      subject: `Seu Pedido Foi Despachado - ${data.trackingNumber}`,
      html,
    });
    console.log(`[Email] Shipment notification sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send shipment notification:", error);
    return false;
  }
}

/**
 * Send Delivery Update Email
 */
export async function sendDeliveryUpdateEmail(data: DeliveryUpdateData): Promise<boolean> {
  try {
    const html = getDeliveryUpdateTemplate(data);
    await transporter.sendMail({
      from: '"VANTA Store" <noreply@obsidian.com>',
      to: data.customerEmail,
      subject: `Atualização de Entrega - ${data.trackingNumber}`,
      html,
    });
    console.log(`[Email] Delivery update sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send delivery update:", error);
    return false;
  }
}
