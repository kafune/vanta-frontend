/**
 * VANTA useCart Hook
 * Carrinho com store COMPARTILHADO entre todas as instâncias do hook
 * (Navbar, CartDrawer, páginas) via useSyncExternalStore — assim adicionar
 * um item reflete na hora em todo lugar, sem precisar recarregar a página.
 * Persistência em localStorage.
 */

import { useCallback, useSyncExternalStore } from "react";

export interface CartItem {
  id: string;
  name: string;
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

// ── Store compartilhado (module-level) ───────────────────────
function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

let cartItems: CartItem[] = loadFromStorage();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setCart(next: CartItem[]) {
  cartItems = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Sincroniza entre abas
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cartItems = loadFromStorage();
      emit();
    }
  });
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, () => cartItems, () => cartItems);

  const addItem = useCallback((item: CartItem) => {
    const existing = cartItems.find(
      (i) =>
        i.id === item.id &&
        i.size === item.size &&
        i.color === item.color &&
        JSON.stringify(i.customization) === JSON.stringify(item.customization)
    );
    if (existing) {
      setCart(
        cartItems.map((i) =>
          i === existing ? { ...i, quantity: Math.min(i.quantity + item.quantity, MAX_QUANTITY) } : i
        )
      );
    } else {
      setCart([...cartItems, { ...item, quantity: Math.min(item.quantity, MAX_QUANTITY) }]);
    }
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart(cartItems.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cartItems.filter((i) => i.id !== itemId));
      return;
    }
    setCart(cartItems.map((i) => (i.id === itemId ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10%
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0; // grátis acima de R$100
  const total = subtotal + tax + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoading: false,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    shipping,
    total,
    itemCount,
  };
}
