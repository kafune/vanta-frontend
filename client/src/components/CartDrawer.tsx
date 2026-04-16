/**
 * OBSIDIAN Cart Drawer Component
 * Slide-out drawer with cart items, quantity controls, and checkout
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, X, ShoppingBag } from "lucide-react";
import { useCart, CartItem } from "@/hooks/useCart";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, subtotal, tax, shipping, total, itemCount } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const sendOrderConfirmationMutation = trpc.email.sendOrderConfirmation.useMutation();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    setIsCheckingOut(true);
    try {
      // Generate order ID
      const orderId = Math.random().toString(36).substring(2, 11).toUpperCase();
      const trackingNumber = `OBSIDIAN-${orderId}-2025`;
      
      // Send order confirmation email
      const emailData = {
        orderId,
        trackingNumber,
        customerEmail: "customer@example.com", // TODO: Get from user auth
        customerName: "Valued Customer",
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        subtotal,
        tax,
        shipping,
        total,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-PT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      await sendOrderConfirmationMutation.mutateAsync(emailData);
      
      // TODO: Integrate with Stripe checkout
      // For now, simulate successful checkout and redirect
      toast.success("Pedido processado com sucesso!", {
        description: "Email de confirmação enviado...",
      });
      
      // Clear cart and redirect to success page
      setTimeout(() => {
        clearCart();
        setIsCheckingOut(false);
        onOpenChange(false);
        setLocation(`/checkout/success?orderId=${orderId}`);
      }, 1500);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erro ao processar checkout");
      setIsCheckingOut(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#111111] border-[rgba(255,255,255,0.1)]">
        <DrawerHeader className="border-b border-[rgba(255,255,255,0.08)] pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-display text-xl text-[#EFEFEF] flex items-center gap-2">
              <ShoppingBag size={20} />
              Carrinho ({itemCount})
            </DrawerTitle>
            <DrawerClose className="text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF]">
              <X size={20} />
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag size={40} className="text-[rgba(239,239,239,0.2)] mb-3" />
              <p className="font-heading text-sm text-[rgba(239,239,239,0.5)]">Carrinho vazio</p>
              <p className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.3)] mt-1">
                Adicione produtos para começar
              </p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Divider */}
        {items.length > 0 && <div className="h-px bg-[rgba(255,255,255,0.08)]" />}

        {/* Summary */}
        {items.length > 0 && (
          <div className="p-4 space-y-3 border-t border-[rgba(255,255,255,0.08)]">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
                <span>IVA (10%)</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
                <span>Envio</span>
                <span className={shipping === 0 ? "text-green-400" : ""}>
                  {shipping === 0 ? "Grátis" : `€${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.08)]" />

            <div className="flex justify-between font-heading font-semibold text-[#EFEFEF]">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut || sendOrderConfirmationMutation.isPending}
                className="w-full bg-[#FFFFFF] text-[#0B0B0B] hover:bg-[#F0F0F0] font-heading font-semibold"
              >
                {isCheckingOut || sendOrderConfirmationMutation.isPending ? "Processando..." : "Checkout"}
              </Button>
              <Button
                onClick={() => clearCart()}
                variant="outline"
                className="w-full border-[rgba(255,255,255,0.15)] text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF]"
              >
                Limpar Carrinho
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-3 p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all" style={{ borderRadius: "3px" }}>
      {/* Image */}
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-cover"
        style={{ borderRadius: "2px" }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-[rgba(239,239,239,0.8)] text-sm truncate">
          {item.name}
        </p>
        <p className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.4)]">
          €{item.price.toFixed(2)} cada
        </p>

        {/* Size & Color */}
        {(item.size || item.color) && (
          <div className="flex gap-2 mt-1 text-[0.65rem] text-[rgba(239,239,239,0.3)]">
            {item.size && <span>{item.size}</span>}
            {item.color && <span>{item.color}</span>}
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
            style={{ borderRadius: "2px" }}
          >
            <Minus size={12} />
          </button>
          <span className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.6)] w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
            style={{ borderRadius: "2px" }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Price & Delete */}
      <div className="flex flex-col items-end justify-between">
        <p className="font-heading font-semibold text-[#EFEFEF] text-sm">
          €{(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-[rgba(200,100,100,0.5)] hover:text-[rgba(200,100,100,1)] hover:bg-[rgba(200,100,100,0.1)] transition-all"
          style={{ borderRadius: "2px" }}
          title="Remover"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
