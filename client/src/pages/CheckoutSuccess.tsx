/**
 * VANTA Checkout Success Page
 * Confirmação do pedido com dados reais (orders.getById): itens, total e rastreio.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, Truck, Copy, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const orderId = new URLSearchParams(window.location.search).get("orderId") ?? "";
  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: !!orderId }
  );

  const handleCopyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      toast.success("Número de rastreamento copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || (orderId && order === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0B" }}>
        <div className="text-center">
          <div className="font-heading text-[rgba(239,239,239,0.6)]">Carregando detalhes do pedido...</div>
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0B" }}>
        <div className="text-center">
          <p className="font-heading text-[rgba(239,239,239,0.6)] mb-4">Pedido não encontrado.</p>
          <button onClick={() => setLocation("/")} className="btn-cta py-3 px-6">Voltar ao início</button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
            <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-2">
              {order.trackingNumber ? "Número de Rastreamento" : "Código do Pedido"}
            </p>
            <div className="flex items-center gap-3">
              <code className="font-mono text-[#EFEFEF] text-lg lg:text-xl font-semibold tracking-wider">
                {order.trackingNumber || order.id}
              </code>
              {order.trackingNumber && (
                <button
                  onClick={handleCopyTracking}
                  className="p-2 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                  title="Copiar número de rastreamento"
                >
                  <Copy size={18} />
                </button>
              )}
            </div>
            {!order.trackingNumber && (
              <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-xs mt-2">
                O rastreamento será gerado quando o pedido for enviado.
              </p>
            )}
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
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">{orderDate}</p>
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
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">3 a 5 dias úteis após o envio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8" style={{ borderRadius: "4px" }}>
          <h2 className="font-heading font-semibold text-[#EFEFEF] mb-6">Detalhes do Pedido</h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0">
                <div>
                  <p className="font-heading text-[#EFEFEF]">{item.productName}</p>
                  <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">
                    {item.quantity}x {item.size && `Tamanho ${item.size}`}
                  </p>
                </div>
                <p className="font-heading font-semibold text-[#EFEFEF]">R$ {((item.price * item.quantity) / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between font-heading font-semibold text-[#EFEFEF] text-base">
            <span>Total</span>
            <span>R$ {(order.totalPrice / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Confirmation Email */}
        {user?.email && (
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8" style={{ borderRadius: "4px" }}>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} className="text-green-400" />
              </div>
              <div>
                <p className="font-heading text-[#EFEFEF] mb-1">Confirmação por Email</p>
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">
                  Um email de confirmação foi enviado para <strong>{user.email}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setLocation(`/track/${order.id}`)}
            className="flex-1 btn-cta py-3 flex items-center justify-center gap-2"
          >
            <Package size={16} />
            <span>Rastrear Pedido</span>
          </button>
          <button
            onClick={() => setLocation("/")}
            className="flex-1 btn-outline-cta py-3 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Voltar ao Início</span>
          </button>
          <button
            onClick={() => setLocation("/")}
            className="flex-1 btn-outline-cta py-3 flex items-center justify-center gap-2"
          >
            <span>Continuar Comprando</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
