/**
 * VANTA useCart Hook
 * Estado global do carrinho via React Context (uma única instância para toda a
 * app) com persistência em localStorage.
 *
 * Convenção de moeda: `price` é armazenado em CENTAVOS (inteiro), igual ao que o
 * servidor devolve. Os totais expostos (subtotal/tax/shipping/total) são em
 * REAIS (float), prontos para exibição e para o cálculo de PIX (× 100 vira
 * centavos de novo no checkout).
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  /** Preço unitário em CENTAVOS. */
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  customization?: {
    imageData?: string;
    shirtColor?: string;
    selectedModel?: string;
    sleeveLength?: "short" | "long";
  };
}

const STORAGE_KEY = "obsidian_cart";
const MAX_QUANTITY = 99;

// Regras de frete (em centavos).
const FREE_SHIPPING_THRESHOLD_CENTS = 20000; // Frete grátis acima de R$ 200,00
const FLAT_SHIPPING_CENTS = 1500; // R$ 15,00

interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  /** Em REAIS. */
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function useCartState(): CartContextValue {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(parsed);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading cart:", error);
      setIsLoading(false);
    }
  }, []);

  // Persist cart to localStorage
  const persistCart = useCallback((newItems: CartItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, []);

  // Add item to cart
  const addItem = useCallback(
    (item: CartItem) => {
      setItems((current) => {
        const existingItem = current.find(
          (i) =>
            i.id === item.id &&
            i.size === item.size &&
            i.color === item.color &&
            JSON.stringify(i.customization) === JSON.stringify(item.customization)
        );

        const updated = existingItem
          ? current.map((i) =>
              i === existingItem
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, MAX_QUANTITY) }
                : i
            )
          : [...current, { ...item, quantity: Math.min(item.quantity, MAX_QUANTITY) }];

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving cart:", error);
        }
        return updated;
      });
    },
    []
  );

  // Remove item from cart
  const removeItem = useCallback(
    (itemId: string) => {
      setItems((current) => {
        const updated = current.filter((i) => i.id !== itemId);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving cart:", error);
        }
        return updated;
      });
    },
    []
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }
      setItems((current) => {
        const updated = current.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving cart:", error);
        }
        return updated;
      });
    },
    [removeItem]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    persistCart([]);
  }, [persistCart]);

  // Totais. price está em centavos; convertemos para reais na saída.
  const subtotalCents = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxCents = Math.round(subtotalCents * 0.1); // IVA 10%
  const shippingCents =
    subtotalCents === 0 ? 0 : subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const totalCents = subtotalCents + taxCents + shippingCents;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    shipping: shippingCents / 100,
    total: totalCents / 100,
    itemCount,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartState();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart precisa estar dentro de <CartProvider>");
  }
  return ctx;
}
