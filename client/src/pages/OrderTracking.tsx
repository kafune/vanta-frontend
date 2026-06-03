/**
 * VANTA Order Tracking Page
 * Acompanhamento com dados REAIS (orders.getById): status do pedido + itens.
 * O timeline é derivado do status real (pendente→confirmado→enviado→entregue).
 */

import { useParams, useLocation } from "wouter";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";

const fmt = (cents: number) => `R$ ${(cents / 100).toFixed(2)}`;

// Etapas lineares do pedido (cancelado é tratado à parte).
const STEPS = [
  { key: "pendente", label: "Pedido criado", desc: "Aguardando confirmação do pagamento", icon: Clock },
  { key: "confirmado", label: "Pagamento confirmado", desc: "Recebemos seu pagamento", icon: CreditCard },
  { key: "enviado", label: "Enviado", desc: "Seu pedido está a caminho", icon: Truck },
  { key: "entregue", label: "Entregue", desc: "Pedido entregue", icon: CheckCircle },
];
const ORDER_INDEX: Record<string, number> = { pendente: 0, confirmado: 1, enviado: 2, entregue: 3 };

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId: orderId ?? "" },
    { enabled: !!orderId, retry: false }
  );

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#EFEFEF]" /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="font-display text-2xl text-[#EFEFEF] mb-2">Pedido não encontrado</h1>
        <p className="font-heading text-[rgba(239,239,239,0.6)] mb-6">Não localizamos este pedido na sua conta.</p>
        <button onClick={() => setLocation("/")} className="btn-cta px-6 py-3">Voltar</button>
      </div>
    );
  }

  const cancelled = order.status === "cancelado";
  const currentIndex = ORDER_INDEX[order.status] ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8">
      <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] mb-8 transition-colors">
        <ArrowLeft size={18} /> <span>Voltar</span>
      </button>

      <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-2">Acompanhar pedido</h1>
      <p className="font-heading text-[rgba(239,239,239,0.6)] mb-8">
        Pedido <span className="font-mono text-[#EFEFEF]">{order.id}</span>
        {order.trackingNumber && <> · Rastreamento <span className="font-mono text-[#EFEFEF]">{order.trackingNumber}</span></>}
      </p>

      {cancelled ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg mb-8 flex items-center gap-3">
          <AlertCircle className="text-red-400" /> <span className="text-[#EFEFEF] font-heading">Este pedido foi cancelado.</span>
        </div>
      ) : (
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8 rounded-lg">
          <div className="space-y-6">
            {STEPS.map((step, i) => {
              const done = i <= currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-green-500/20" : "bg-[rgba(255,255,255,0.08)]"}`}>
                      <Icon size={16} className={done ? "text-green-400" : "text-[rgba(239,239,239,0.4)]"} />
                    </div>
                    {i < STEPS.length - 1 && <div className={`w-px h-10 mt-1 ${done ? "bg-green-500/30" : "bg-[rgba(255,255,255,0.1)]"}`} />}
                  </div>
                  <div className="pb-2">
                    <p className={`font-heading font-semibold ${done ? "text-[#EFEFEF]" : "text-[rgba(239,239,239,0.6)]"}`}>{step.label}</p>
                    <p className="font-heading text-sm text-[rgba(239,239,239,0.45)]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Itens */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 rounded-lg">
        <h3 className="font-heading font-semibold text-[#EFEFEF] mb-4">Itens do pedido</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center gap-3 pb-3 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                {item.customImageUrl && <img src={item.customImageUrl} alt="estampa" className="w-10 h-10 object-cover rounded border border-[rgba(255,255,255,0.1)]" />}
                <p className="font-heading text-[rgba(239,239,239,0.85)]">{item.productName}</p>
              </div>
              <div className="text-right">
                <p className="font-mono-label text-[rgba(239,239,239,0.5)] text-sm">Qtd: {item.quantity}</p>
                <p className="font-heading text-[#EFEFEF] text-sm">{fmt(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-heading font-semibold text-[#EFEFEF] mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <span>Total</span><span>{fmt(order.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
