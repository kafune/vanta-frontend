/**
 * VANTA Cart Drawer Component
 * Slide-out drawer with cart items, quantity controls, and checkout
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, X, ShoppingBag } from "lucide-react";
import { useCart, CartItem } from "@/hooks/useCart";
import { useCoupon } from "@/hooks/useCoupon";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { PixCheckout } from "@/components/PixCheckout";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, subtotal, tax, shipping, total, itemCount } = useCart();
  const { appliedCoupon, error: couponError, loading: couponLoading, handleApplyCoupon, removeCoupon } = useCoupon();
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [applyCashback, setApplyCashback] = useState(false);
  const [showPixCheckout, setShowPixCheckout] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "other">("pix");
  
  const sendOrderConfirmationMutation = trpc.email.sendOrderConfirmation.useMutation();
  const recordCouponUsageMutation = trpc.coupons.recordUsage.useMutation();
  const getCashbackBalanceQuery = trpc.cashback.getBalance.useQuery(undefined, { enabled: !!user });
  const recordCashbackEarnedMutation = trpc.cashback.recordEarned.useMutation();
  const recordCashbackSpentMutation = trpc.cashback.recordSpent.useMutation();

  const handleApplyCouponClick = async () => {
    if (!couponCode.trim()) {
      toast.error("Digite um código de cupom");
      return;
    }

    try {
      await handleApplyCoupon(couponCode, subtotal * 100); // Convert to cents
      toast.success("Cupom aplicado com sucesso!");
      setCouponCode("");
    } catch (error) {
      toast.error(couponError || "Erro ao aplicar cupom");
    }
  };

  const cashbackDiscount = applyCashback && getCashbackBalanceQuery.data?.availableBalance ? Math.min(getCashbackBalanceQuery.data.availableBalance / 100, total) : 0;
  const finalTotal = (appliedCoupon ? total - (appliedCoupon.discount / 100) : total) - cashbackDiscount;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    setIsCheckingOut(true);
    try {
      // Generate order ID
      const orderId = Math.random().toString(36).substring(2, 11).toUpperCase();
      const trackingNumber = `VANTA-${orderId}-2025`;
      
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
        total: finalTotal,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-PT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      await sendOrderConfirmationMutation.mutateAsync(emailData);
      
      // Record coupon usage if a coupon was applied
      if (appliedCoupon?.couponId) {
        try {
          await recordCouponUsageMutation.mutateAsync({
            couponId: appliedCoupon.couponId,
            orderId,
          });
        } catch (error) {
          console.error("Error recording coupon usage:", error);
          // Don't block checkout if coupon recording fails
        }
      }
      
      // Record cashback spent if applied
      if (applyCashback && cashbackDiscount > 0 && user) {
        try {
          await recordCashbackSpentMutation.mutateAsync({
            orderId,
            spentAmount: Math.round(cashbackDiscount * 100),
          });
        } catch (error) {
          console.error("Error recording cashback spent:", error);
        }
      }
      
      // Record cashback earned (10% of final total)
      if (user) {
        try {
          await recordCashbackEarnedMutation.mutateAsync({
            orderId,
            orderTotal: Math.round(finalTotal * 100),
          });
        } catch (error) {
          console.error("Error recording cashback earned:", error);
        }
      }
      
      // TODO: Integrate with Stripe checkout
      // For now, simulate successful checkout and redirect
      toast.success("Pedido processado com sucesso!", {
        description: "Email de confirmação enviado...",
      });
      
      // Clear cart and redirect to success page
      setTimeout(() => {
        clearCart();
        removeCoupon();
        setApplyCashback(false);
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
            {/* Coupon Section */}
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-3 rounded-sm">
              {appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm text-green-400">✓ Cupom aplicado</span>
                    <button
                      onClick={removeCoupon}
                      className="text-[0.65rem] text-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.7)]"
                    >
                      Remover
                    </button>
                  </div>
                  <p className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.5)]">
                    {appliedCoupon.code} - {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : `R$ ${(appliedCoupon.discountValue / 100).toFixed(2)}`} de desconto
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código de cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF] placeholder-[rgba(239,239,239,0.3)] text-sm h-8"
                    disabled={couponLoading}
                  />
                  <Button
                    onClick={handleApplyCouponClick}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-[#EFEFEF] text-sm h-8 px-3"
                  >
                    Aplicar
                  </Button>
                </div>
              )}
              {couponError && <p className="font-mono-label text-[0.65rem] text-red-400 mt-1">{couponError}</p>}
            </div>
            
            {/* Cashback Section */}
            {user && getCashbackBalanceQuery.data && getCashbackBalanceQuery.data.availableBalance > 0 && (
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-3 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-sm text-blue-400">💰 Cashback Disponível</span>
                  <span className="font-mono-label text-[0.7rem] text-blue-400">R$ {(getCashbackBalanceQuery.data.availableBalance / 100).toFixed(2)}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyCashback}
                    onChange={(e) => setApplyCashback(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.6)]">Usar cashback nesta compra</span>
                </label>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
                <span>IVA (10%)</span>
                <span>R$ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[rgba(239,239,239,0.6)]">
                <span>Envio</span>
                <span className={shipping === 0 ? "text-green-400" : ""}>
                  {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2)}`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-400">
                  <span>Desconto (Cupom)</span>
                  <span>-R$ {(appliedCoupon.discount / 100).toFixed(2)}</span>
                </div>
              )}
              {applyCashback && cashbackDiscount > 0 && (
                <div className="flex justify-between text-blue-400">
                  <span>Desconto (Cashback)</span>
                  <span>-R$ {cashbackDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.08)]" />

            <div className="flex justify-between font-heading font-semibold text-[#EFEFEF]">
              <span>Total</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>

            {/* PIX Checkout */}
            {showPixCheckout && currentOrderId ? (
              <PixCheckout
                orderId={currentOrderId}
                amount={Math.round(finalTotal * 100)}
                onPaymentConfirmed={() => {
                  setShowPixCheckout(false);
                  clearCart();
                  removeCoupon();
                  setApplyCashback(false);
                  setIsCheckingOut(false);
                  onOpenChange(false);
                  setLocation(`/checkout/success?orderId=${currentOrderId}`);
                }}
                onCancel={() => {
                  setShowPixCheckout(false);
                  setCurrentOrderId(null);
                }}
              />
            ) : (
              <>
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {!user ? (
                    <Button
                      onClick={() => {
                        const loginUrl = new URL(window.location.origin);
                        loginUrl.pathname = '/api/oauth/login';
                        window.location.href = loginUrl.toString();
                      }}
                      className="w-full bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E] font-heading font-semibold"
                    >
                      🔐 Fazer Login para Comprar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        const orderId = Math.random().toString(36).substring(2, 11).toUpperCase();
                        setCurrentOrderId(orderId);
                        setShowPixCheckout(true);
                        setIsCheckingOut(true);
                      }}
                      disabled={isCheckingOut || sendOrderConfirmationMutation.isPending || items.length === 0}
                      className="w-full bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E] font-heading font-semibold"
                    >
                      💳 Pagar com PIX
                    </Button>
                  )}
                  <Button
                    onClick={() => clearCart()}
                    variant="outline"
                    className="w-full border-[rgba(255,255,255,0.15)] text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF]"
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </>
            )}
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
          R$ {(item.price / 100).toFixed(2)} cada
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
          R$ {((item.price * item.quantity) / 100).toFixed(2)}
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
