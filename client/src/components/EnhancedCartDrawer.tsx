/**
 * Enhanced Cart Drawer Component
 * Features: Real-time inventory validation, promotion code support, discount calculation
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, X, ShoppingBag, AlertCircle, CheckCircle, Tag } from "lucide-react";
import { useCart, CartItem } from "@/hooks/useCart";
import { useAuth } from "@/_core/hooks/useAuth";
import { useInventoryValidation } from "@/hooks/useInventoryValidation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface EnhancedCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InventoryStatus {
  productId: string;
  available: number;
  reserved: number;
  status: "available" | "low" | "out_of_stock";
}

interface AppliedPromotion {
  code: string;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
}

export default function EnhancedCartDrawer({ open, onOpenChange }: EnhancedCartDrawerProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, subtotal, tax, shipping, total, itemCount } = useCart();
  
  // Promotion and inventory state
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(null);
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Local state for syncing with hook
  const [inventoryStatus, setInventoryStatus] = useState<Map<string, InventoryStatus>>(new Map());
  const [isValidatingInventory, setIsValidatingInventory] = useState(false);
  const [inventoryErrors, setInventoryErrors] = useState<string[]>([]);

  // tRPC mutations and queries
  const applyPromotionMutation = trpc.promotions.applyPromotionCode.useMutation();
  const sendOrderConfirmationMutation = trpc.email.sendOrderConfirmation.useMutation();
  
  // Use the useInventoryValidation hook for real-time inventory checks
  const { inventoryStatus: hookInventoryStatus, isValidating: isValidatingInventoryHook, errors: inventoryErrorsHook } = useInventoryValidation(items);

  // Sync inventory validation from hook
  useEffect(() => {
    setInventoryStatus(hookInventoryStatus);
    setInventoryErrors(inventoryErrorsHook);
    setIsValidatingInventory(isValidatingInventoryHook);

    if (inventoryErrorsHook.length > 0) {
      toast.error("Alguns itens têm disponibilidade limitada");
    }
  }, [hookInventoryStatus, isValidatingInventoryHook, inventoryErrorsHook]);

  // Handle promotion code application
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) {
      toast.error("Digite um código de promoção");
      return;
    }

    setIsApplyingPromotion(true);
    try {
      const result = await applyPromotionMutation.mutateAsync({
        code: promotionCode,
        cartTotal: total,
      });

      const promotion: AppliedPromotion = {
        code: promotionCode,
        discountPercentage: result.discountPercentage,
        discountAmount: result.discount,
        finalTotal: result.finalTotal,
      };

      setAppliedPromotion(promotion);
      setPromotionCode("");
      toast.success(`Promoção aplicada! Desconto de R$ ${result.discount.toFixed(2)}`);
    } catch (error: any) {
      toast.error(error.message || "Código de promoção inválido");
    } finally {
      setIsApplyingPromotion(false);
    }
  };

  // Remove applied promotion
  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    toast.info("Promoção removida");
  };

  // Calculate final totals
  const discountAmount = appliedPromotion?.discountAmount || 0;
  const finalTotal = total - discountAmount;

  // Handle checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    if (inventoryErrors.length > 0) {
      toast.error("Verifique a disponibilidade dos itens");
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderId = Math.random().toString(36).substring(2, 11).toUpperCase();
      const trackingNumber = `VANTA-${orderId}-2025`;

      // Send order confirmation
      await sendOrderConfirmationMutation.mutateAsync({
        orderId,
        trackingNumber,
        customerEmail: user?.email || "customer@example.com",
        customerName: user?.name || "Valued Customer",
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        subtotal,
        tax,
        shipping,
        total: finalTotal,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "pt-PT",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        promotionCode: appliedPromotion?.code,
        discountAmount,
      });

      toast.success("Pedido processado com sucesso!", {
        description: "Email de confirmação enviado...",
      });

      setTimeout(() => {
        clearCart();
        setAppliedPromotion(null);
        setPromotionCode("");
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

        {/* Cart Items with Inventory Status */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag size={40} className="text-[rgba(239,239,239,0.2)] mb-3" />
              <p className="font-heading text-sm text-[rgba(239,239,239,0.5)]">Carrinho vazio</p>
            </div>
          ) : (
            items.map((item) => {
              const status = inventoryStatus.get(item.id);
              const isOutOfStock = status?.status === "low";

              return (
                <div
                  key={item.id}
                  className={`bg-[rgba(255,255,255,0.03)] border rounded-sm p-3 ${
                    isOutOfStock
                      ? "border-red-500/30"
                      : "border-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm text-[#EFEFEF] truncate">
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                          Tamanho: {item.size}
                        </p>
                      )}
                      <p className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.6)] mt-1">
                        R$ {item.price.toFixed(2)}
                      </p>

                      {/* Inventory Status */}
                      {status && (
                        <div className="flex items-center gap-1 mt-2">
                          {isOutOfStock ? (
                            <>
                              <AlertCircle size={12} className="text-red-400" />
                              <span className="font-mono-label text-[0.6rem] text-red-400">
                                {status.available} disponível
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} className="text-green-400" />
                              <span className="font-mono-label text-[0.6rem] text-green-400">
                                Em estoque
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="font-mono-label text-sm text-[#EFEFEF] w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Divider */}
        {items.length > 0 && <div className="h-px bg-[rgba(255,255,255,0.08)]" />}

        {/* Promotion and Summary Section */}
        {items.length > 0 && (
          <div className="p-4 space-y-3 border-t border-[rgba(255,255,255,0.08)]">
            {/* Promotion Code Section */}
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-3 rounded-sm">
              {appliedPromotion ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-green-400" />
                      <span className="font-heading text-sm text-green-400">
                        Promoção aplicada
                      </span>
                    </div>
                    <button
                      onClick={handleRemovePromotion}
                      className="text-[0.65rem] text-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.7)]"
                    >
                      Remover
                    </button>
                  </div>
                  <p className="font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.5)]">
                    {appliedPromotion.code} - {appliedPromotion.discountPercentage}% de desconto
                  </p>
                  <p className="font-mono-label text-[0.7rem] text-green-400">
                    Economia: R$ {appliedPromotion.discountAmount.toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código de promoção"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF] placeholder-[rgba(239,239,239,0.3)] text-sm h-8"
                    disabled={isApplyingPromotion}
                  />
                  <Button
                    onClick={handleApplyPromotion}
                    disabled={isApplyingPromotion || !promotionCode.trim()}
                    className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-[#EFEFEF] text-sm h-8 px-3"
                  >
                    {isApplyingPromotion ? "..." : "Aplicar"}
                  </Button>
                </div>
              )}
            </div>

            {/* Inventory Warnings */}
            {inventoryErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-sm">
                <p className="font-heading text-sm text-red-400 mb-1">⚠️ Aviso de Estoque</p>
                {inventoryErrors.map((error, idx) => (
                  <p key={idx} className="font-mono-label text-[0.65rem] text-red-300">
                    • {error}
                  </p>
                ))}
              </div>
            )}

            {/* Price Summary */}
            <div className="space-y-2 bg-[rgba(255,255,255,0.02)] p-3 rounded-sm">
              <div className="flex justify-between font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.6)]">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.6)]">
                <span>Frete:</span>
                <span>R$ {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono-label text-[0.7rem] text-[rgba(239,239,239,0.6)]">
                <span>Impostos:</span>
                <span>R$ {tax.toFixed(2)}</span>
              </div>

              {appliedPromotion && (
                <div className="flex justify-between font-mono-label text-[0.7rem] text-green-400">
                  <span>Desconto:</span>
                  <span>-R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="h-px bg-[rgba(255,255,255,0.1)] my-2" />

              <div className="flex justify-between font-heading text-sm text-[#EFEFEF]">
                <span>Total:</span>
                <span>R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={
                isCheckingOut ||
                items.length === 0 ||
                inventoryErrors.length > 0 ||
                isValidatingInventory
              }
              className="w-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-[#EFEFEF] font-heading"
            >
              {isCheckingOut ? "Processando..." : "Ir para Checkout"}
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
