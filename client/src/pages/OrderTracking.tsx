/**
 * VANTA Order Tracking Page
 * Status do pedido real (orders.getById). A timeline é derivada do status
 * (pendente → confirmado → enviado → entregue); nada de locais/carrier fake.
 */

import { useParams, useLocation } from "wouter";
import { Package, Truck, Clock, CheckCircle, AlertCircle, ArrowLeft, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

// Estágios lineares do pedido, na ordem em que acontecem.
const STAGES = [
  { key: "pendente", title: "Pedido Recebido", description: "Aguardando confirmação do pagamento.", icon: Clock },
  { key: "confirmado", title: "Pagamento Confirmado", description: "Pedido confirmado e em preparação.", icon: CheckCircle },
  { key: "enviado", title: "Enviado", description: "Seu pedido está a caminho.", icon: Truck },
  { key: "entregue", title: "Entregue", description: "Pedido entregue com sucesso.", icon: Package },
] as const;

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId: orderId ?? "" },
    { enabled: !!orderId }
  );

  if (isLoading || (orderId && order === undefined)) {
    return (
      <div className="min-h-screen pt-32 pb-16" style={{ background: "#0B0B0B" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="font-heading text-[rgba(239,239,239,0.6)]">Carregando informações de rastreamento...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 pb-16" style={{ background: "#0B0B0B" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          <div className="text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="font-display text-2xl text-[#EFEFEF] mb-2">Pedido não encontrado</h1>
            <p className="font-heading text-[rgba(239,239,239,0.6)]">
              Não conseguimos encontrar informações para este pedido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelado";
  // Índice do estágio atual na linha do tempo.
  const currentIndex = STAGES.findIndex((s) => s.key === order.status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const orderDate = new Date(order.createdAt).toLocaleDateString("pt-BR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen pt-32 pb-16" style={{ background: "#0B0B0B" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-3">Rastreamento de Pedido</h1>
          <p className="font-heading text-[rgba(239,239,239,0.6)]">
            {order.trackingNumber ? "Número de Rastreamento: " : "Código do Pedido: "}
            <span className="font-mono text-[#EFEFEF]">{order.trackingNumber || order.id}</span>
          </p>
        </motion.div>

        {isCancelled ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 lg:p-8 mb-8 rounded-lg flex items-start gap-4">
            <XCircle size={24} className="text-red-400 flex-shrink-0" />
            <div>
              <h2 className="font-display text-2xl text-[#EFEFEF] mb-2">Pedido Cancelado</h2>
              <p className="font-heading text-[rgba(239,239,239,0.6)]">Este pedido foi cancelado.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Delivery estimate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg mb-8"
            >
              <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-2">Entrega Estimada</p>
              <p className="font-heading font-semibold text-[#EFEFEF]">3 a 5 dias úteis após o envio</p>
            </motion.div>

            {/* Timeline derivada do status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8 rounded-lg"
            >
              <h3 className="font-heading font-semibold text-[#EFEFEF] mb-6">Status do Pedido</h3>
              <div className="space-y-6">
                {STAGES.map((stage, index) => {
                  const completed = index <= activeIndex;
                  const Icon = completed ? stage.icon : Clock;
                  return (
                    <div key={stage.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            completed ? "bg-green-500/20" : "bg-[rgba(255,255,255,0.1)]"
                          }`}
                        >
                          <Icon size={16} className={completed ? "text-green-400" : "text-[rgba(239,239,239,0.4)]"} />
                        </div>
                        {index < STAGES.length - 1 && (
                          <div className={`w-px h-12 mt-2 ${completed ? "bg-[rgba(255,255,255,0.2)]" : "bg-[rgba(255,255,255,0.1)]"}`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`font-heading font-semibold ${completed ? "text-[#EFEFEF]" : "text-[rgba(239,239,239,0.6)]"}`}>
                          {stage.title}
                        </p>
                        {index === 0 && (
                          <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-1">{orderDate}</p>
                        )}
                        <p className="font-heading text-[rgba(239,239,239,0.5)] text-sm">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8 rounded-lg"
        >
          <h3 className="font-heading font-semibold text-[#EFEFEF] mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0"
              >
                <p className="font-heading text-[rgba(239,239,239,0.8)]">{item.productName}</p>
                <p className="font-mono-label text-[rgba(239,239,239,0.5)]">Qtd: {item.quantity}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
