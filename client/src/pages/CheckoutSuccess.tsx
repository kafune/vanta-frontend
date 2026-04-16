/**
 * OBSIDIAN Checkout Success Page
 * Order confirmation with tracking number and delivery details
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, Truck, Calendar, Copy, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

interface OrderDetails {
  orderId: string;
  trackingNumber: string;
  estimatedDelivery: string;
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
  customerEmail: string;
  orderDate: string;
}

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get order details from URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    if (orderId) {
      // Simulate fetching order details
      const mockOrder: OrderDetails = {
        orderId: orderId,
        trackingNumber: `OBSIDIAN-${orderId.toUpperCase()}-2025`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-PT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: [
          { name: "Essential Tee 280g", quantity: 2, price: 89, size: "M" },
          { name: "Urban Oversized", quantity: 1, price: 109, size: "G" },
        ],
        subtotal: 287,
        tax: 28.7,
        shipping: 0,
        total: 315.7,
        customerEmail: "customer@example.com",
        orderDate: new Date().toLocaleDateString("pt-PT", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setOrder(mockOrder);
    }
  }, []);

  const handleCopyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      toast.success("Número de rastreamento copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0B" }}>
        <div className="text-center">
          <div className="font-heading text-[rgba(239,239,239,0.6)]">Carregando detalhes do pedido...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16" style={{ background: "#0B0B0B" }}>
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
              <CheckCircle size={40} className="text-green-400" />
            </div>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-3">
            Pedido Confirmado!
          </h1>
          <p className="font-heading text-[rgba(239,239,239,0.6)] text-lg">
            Obrigado pela sua compra. Seu pedido foi processado com sucesso.
          </p>
        </div>

        {/* Tracking Section */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8" style={{ borderRadius: "4px" }}>
          <div className="mb-6">
            <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-2">Número de Rastreamento</p>
            <div className="flex items-center gap-3">
              <code className="font-mono text-[#EFEFEF] text-lg lg:text-xl font-semibold tracking-wider">
                {order.trackingNumber}
              </code>
              <button
                onClick={handleCopyTracking}
                className="p-2 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                title="Copiar número de rastreamento"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.08)] mb-6" />

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-400" />
                </div>
                <div className="w-px h-12 bg-[rgba(255,255,255,0.1)] mt-2" />
              </div>
              <div className="pb-4">
                <p className="font-heading font-semibold text-[#EFEFEF]">Pedido Confirmado</p>
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">{order.orderDate}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <Package size={16} className="text-[rgba(239,239,239,0.4)]" />
                </div>
                <div className="w-px h-12 bg-[rgba(255,255,255,0.1)] mt-2" />
              </div>
              <div className="pb-4">
                <p className="font-heading font-semibold text-[rgba(239,239,239,0.7)]">Em Preparação</p>
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">Seu pedido está sendo preparado</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <Truck size={16} className="text-[rgba(239,239,239,0.4)]" />
                </div>
              </div>
              <div>
                <p className="font-heading font-semibold text-[rgba(239,239,239,0.7)]">Entrega Estimada</p>
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">{order.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8" style={{ borderRadius: "4px" }}>
          <h2 className="font-heading font-semibold text-[#EFEFEF] mb-6">Detalhes do Pedido</h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start pb-4 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0">
                <div>
                  <p className="font-heading text-[#EFEFEF]">{item.name}</p>
                  <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">
                    {item.quantity}x {item.size && `Tamanho ${item.size}`}
                  </p>
                </div>
                <p className="font-heading font-semibold text-[#EFEFEF]">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
              <span>Subtotal</span>
              <span>€{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
              <span>IVA (10%)</span>
              <span>€{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
              <span>Envio</span>
              <span className={order.shipping === 0 ? "text-green-400" : ""}>
                {order.shipping === 0 ? "Grátis" : `€${order.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="h-px bg-[rgba(255,255,255,0.08)] my-3" />
            <div className="flex justify-between font-heading font-semibold text-[#EFEFEF] text-base">
              <span>Total</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Confirmation Email */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8" style={{ borderRadius: "4px" }}>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-green-400" />
            </div>
            <div>
              <p className="font-heading text-[#EFEFEF] mb-1">Confirmação por Email</p>
              <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">
                Um email de confirmação foi enviado para <strong>{order.customerEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setLocation("/")}
            className="flex-1 btn-outline-cta py-3 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Voltar ao Início</span>
          </button>
          <button
            onClick={() => setLocation("/produto/essential-tee-280g")}
            className="flex-1 btn-cta py-3 flex items-center justify-center gap-2"
          >
            <span>Continuar Comprando</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.08)]">
          <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-4">Precisa de ajuda?</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@obsidian.com"
              className="font-heading text-[#EFEFEF] hover:text-[rgba(239,239,239,0.7)] transition-colors"
            >
              Contacte o Suporte
            </a>
            <span className="text-[rgba(239,239,239,0.2)]">•</span>
            <a
              href="#"
              className="font-heading text-[#EFEFEF] hover:text-[rgba(239,239,239,0.7)] transition-colors"
            >
              Rastrear Pedido
            </a>
            <span className="text-[rgba(239,239,239,0.2)]">•</span>
            <a
              href="#"
              className="font-heading text-[#EFEFEF] hover:text-[rgba(239,239,239,0.7)] transition-colors"
            >
              Política de Devoluções
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
