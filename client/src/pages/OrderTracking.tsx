/**
 * OBSIDIAN Order Tracking Page
 * Real-time order status tracking with timeline and delivery info
 */

import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, ArrowLeft, Phone, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface TrackingEvent {
  status: "confirmed" | "processing" | "shipped" | "in_transit" | "out_for_delivery" | "delivered";
  title: string;
  description: string;
  timestamp: Date;
  location?: string;
  completed: boolean;
}

interface OrderTrackingData {
  orderId: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  currentLocation: string;
  carrier: string;
  events: TrackingEvent[];
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

const statusColors: Record<string, string> = {
  confirmed: "text-blue-400",
  processing: "text-purple-400",
  shipped: "text-indigo-400",
  in_transit: "text-cyan-400",
  out_for_delivery: "text-yellow-400",
  delivered: "text-green-400",
};

const statusBgColors: Record<string, string> = {
  confirmed: "bg-blue-500/20",
  processing: "bg-purple-500/20",
  shipped: "bg-indigo-500/20",
  in_transit: "bg-cyan-500/20",
  out_for_delivery: "bg-yellow-500/20",
  delivered: "bg-green-500/20",
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const [tracking, setTracking] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching tracking data
    const mockTracking: OrderTrackingData = {
      orderId: orderId || "UNKNOWN",
      trackingNumber: `OBSIDIAN-${orderId?.toUpperCase()}-2025`,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-PT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      currentLocation: "Centro de Distribuição - Lisboa",
      carrier: "DHL Express",
      items: [
        { name: "Essential Tee 280g", quantity: 2 },
        { name: "Urban Oversized", quantity: 1 },
      ],
      events: [
        {
          status: "confirmed",
          title: "Pedido Confirmado",
          description: "Seu pedido foi confirmado e processado",
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          location: "OBSIDIAN Store",
          completed: true,
        },
        {
          status: "processing",
          title: "Em Preparação",
          description: "Seu pedido está sendo preparado para envio",
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
          location: "Armazém OBSIDIAN",
          completed: true,
        },
        {
          status: "shipped",
          title: "Despachado",
          description: "Seu pedido foi despachado e está a caminho",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          location: "Centro de Distribuição - Porto",
          completed: true,
        },
        {
          status: "in_transit",
          title: "Em Trânsito",
          description: "Seu pedido está em trânsito para sua região",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          location: "Centro de Distribuição - Lisboa",
          completed: true,
        },
        {
          status: "out_for_delivery",
          title: "Saiu para Entrega",
          description: "Seu pedido saiu para entrega hoje",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          location: "Zona de Entrega - Lisboa",
          completed: false,
        },
        {
          status: "delivered",
          title: "Entregue",
          description: "Seu pedido foi entregue com sucesso",
          timestamp: new Date(),
          location: "Endereço de Entrega",
          completed: false,
        },
      ],
    };

    setTimeout(() => {
      setTracking(mockTracking);
      setLoading(false);
    }, 500);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16" style={{ background: "#0B0B0B" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="font-heading text-[rgba(239,239,239,0.6)]">Carregando informações de rastreamento...</div>
        </div>
      </div>
    );
  }

  if (!tracking) {
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

  const currentEventIndex = tracking.events.findIndex(e => !e.completed);
  const currentEvent = tracking.events[currentEventIndex] || tracking.events[tracking.events.length - 1];

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
            Número de Rastreamento: <span className="font-mono text-[#EFEFEF]">{tracking.trackingNumber}</span>
          </p>
        </motion.div>

        {/* Current Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`${statusBgColors[currentEvent.status]} border border-[rgba(255,255,255,0.15)] p-6 lg:p-8 mb-8 rounded-lg`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${statusBgColors[currentEvent.status]} flex items-center justify-center flex-shrink-0`}>
              {currentEvent.status === "delivered" ? (
                <CheckCircle size={24} className={statusColors[currentEvent.status]} />
              ) : currentEvent.status === "out_for_delivery" ? (
                <Truck size={24} className={statusColors[currentEvent.status]} />
              ) : (
                <Package size={24} className={statusColors[currentEvent.status]} />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl text-[#EFEFEF] mb-2">{currentEvent.title}</h2>
              <p className="font-heading text-[rgba(239,239,239,0.6)] mb-3">{currentEvent.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2 text-[rgba(239,239,239,0.5)]">
                  <MapPin size={16} />
                  <span>{currentEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[rgba(239,239,239,0.5)]">
                  <Clock size={16} />
                  <span>{currentEvent.timestamp.toLocaleDateString("pt-PT")}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg">
            <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-2">Entrega Estimada</p>
            <p className="font-heading font-semibold text-[#EFEFEF]">{tracking.estimatedDelivery}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg">
            <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-2">Transportadora</p>
            <p className="font-heading font-semibold text-[#EFEFEF]">{tracking.carrier}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8 rounded-lg"
        >
          <h3 className="font-heading font-semibold text-[#EFEFEF] mb-6">Histórico de Rastreamento</h3>
          <div className="space-y-6">
            {tracking.events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex gap-4"
              >
                {/* Timeline Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      event.completed
                        ? statusBgColors[event.status]
                        : "bg-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    {event.completed ? (
                      <CheckCircle size={16} className={statusColors[event.status]} />
                    ) : (
                      <Clock size={16} className="text-[rgba(239,239,239,0.4)]" />
                    )}
                  </div>
                  {index < tracking.events.length - 1 && (
                    <div
                      className={`w-px h-12 mt-2 ${
                        event.completed
                          ? "bg-[rgba(255,255,255,0.2)]"
                          : "bg-[rgba(255,255,255,0.1)]"
                      }`}
                    />
                  )}
                </div>

                {/* Event Content */}
                <div className="pb-4">
                  <p className={`font-heading font-semibold ${event.completed ? "text-[#EFEFEF]" : "text-[rgba(239,239,239,0.6)]"}`}>
                    {event.title}
                  </p>
                  <p className="font-mono-label text-[rgba(239,239,239,0.4)] text-sm mb-2">
                    {event.timestamp.toLocaleDateString("pt-PT", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="font-heading text-[rgba(239,239,239,0.5)] text-sm mb-2">
                    {event.description}
                  </p>
                  {event.location && (
                    <div className="flex items-center gap-2 text-[rgba(239,239,239,0.4)] text-sm">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 mb-8 rounded-lg"
        >
          <h3 className="font-heading font-semibold text-[#EFEFEF] mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {tracking.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.08)] last:border-0 last:pb-0"
              >
                <p className="font-heading text-[rgba(239,239,239,0.8)]">{item.name}</p>
                <p className="font-mono-label text-[rgba(239,239,239,0.5)]">Qtd: {item.quantity}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-6 lg:p-8 rounded-lg"
        >
          <h3 className="font-heading font-semibold text-[#EFEFEF] mb-4">Precisa de Ajuda?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:support@obsidian.com"
              className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)] rounded-lg transition-colors"
            >
              <Phone size={18} className="text-[rgba(239,239,239,0.6)]" />
              <div>
                <p className="font-heading text-sm text-[#EFEFEF]">Contacte-nos</p>
                <p className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.4)]">support@obsidian.com</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)] rounded-lg transition-colors"
            >
              <MessageSquare size={18} className="text-[rgba(239,239,239,0.6)]" />
              <div>
                <p className="font-heading text-sm text-[#EFEFEF]">Chat ao Vivo</p>
                <p className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.4)]">Disponível 9h-18h</p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
