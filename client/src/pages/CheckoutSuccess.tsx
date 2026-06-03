/**
 * VANTA Checkout Success Page
 * Confirmação do pedido com dados REAIS (orders.getById). Sem mocks.
 */

import { useLocation } from "wouter";
import { CheckCircle, Package, ArrowRight, Home, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const fmt = (cents: number) => `R$ ${(cents / 100).toFixed(2)}`;

const STATUS_LABEL: Record<string, string> = {
  pendente: "Aguardando pagamento",
  confirmado: "Pagamento confirmado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const orderId = new URLSearchParams(window.location.search).get("orderId") ?? "";

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: !!orderId, retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#EFEFEF]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-[#EFEFEF] mb-3">Pedido não encontrado</h1>
        <p className="text-[rgba(239,239,239,0.6)] mb-6">Não localizamos este pedido na sua conta.</p>
        <button onClick={() => setLocation("/")} className="btn-cta px-6 py-3">Voltar ao início</button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-400" />
            </div>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-3">Pedido recebido!</h1>
          <p className="font-heading text-[rgba(239,239,239,0.6)] text-lg">
            {STATUS_LABEL[order.status] ?? order.status}
          </p>
        </div>

        {/* Pedido */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8 rounded">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">Pedido</p>
              <code className="font-mono text-[#EFEFEF] text-sm">{order.id}</code>
            </div>
            {order.trackingNumber && (
              <div className="text-right">
                <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">Rastreamento</p>
                <code className="font-mono text-[#EFEFEF] text-sm">{order.trackingNumber}</code>
              </div>
            )}
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.08)] mb-6" />

          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4 pb-4 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0">
                <div className="flex gap-3">
                  {item.customImageUrl && (
                    <img src={item.customImageUrl} alt="estampa" className="w-12 h-12 object-cover rounded border border-[rgba(255,255,255,0.1)]" />
                  )}
                  <div>
                    <p className="font-heading text-[#EFEFEF]">{item.productName}</p>
                    <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm">
                      {item.quantity}x {item.size && `· ${item.size}`} {item.color && `· ${item.color}`}
                      {item.customImageUrl && " · estampa personalizada"}
                    </p>
                  </div>
                </div>
                <p className="font-heading font-semibold text-[#EFEFEF]">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-heading font-semibold text-[#EFEFEF] text-base">
            <span>Total</span>
            <span>{fmt(order.totalPrice)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setLocation(`/track/${order.id}`)} className="flex-1 btn-cta py-3 flex items-center justify-center gap-2">
            <Package size={16} /> <span>Acompanhar pedido</span>
          </button>
          <button onClick={() => setLocation("/")} className="flex-1 btn-outline-cta py-3 flex items-center justify-center gap-2">
            <Home size={16} /> <span>Voltar ao início</span>
          </button>
          <button onClick={() => setLocation("/collections")} className="flex-1 btn-outline-cta py-3 flex items-center justify-center gap-2">
            <span>Continuar comprando</span> <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
