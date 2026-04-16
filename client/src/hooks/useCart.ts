/**
 * OBSIDIAN useCart Hook
 * Manages shopping cart state with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";

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
  };
}

const STORAGE_KEY = "obsidian_cart";
const MAX_QUANTITY = 99;

export function useCart() {
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
      const existingItem = items.find(
        (i) =>
          i.id === item.id &&
          i.size === item.size &&
          i.color === item.color &&
          JSON.stringify(i.customization) === JSON.stringify(item.customization)
      );

      if (existingItem) {
        // Update quantity if item already exists
        const updated = items.map((i) =>
          i === existingItem
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, MAX_QUANTITY) }
            : i
        );
        persistCart(updated);
      } else {
        // Add new item
        const updated = [...items, { ...item, quantity: Math.min(item.quantity, MAX_QUANTITY) }];
        persistCart(updated);
      }
    },
    [items, persistCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    (itemId: string) => {
      const updated = items.filter((i) => i.id !== itemId);
      persistCart(updated);
    },
    [items, persistCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

      const updated = items.map((i) =>
        i.id === itemId ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i
      );
      persistCart(updated);
    },
    [items, persistCart, removeItem]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    persistCart([]);
  }, [persistCart]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0; // Free shipping over €100
  const total = subtotal + tax + shipping;

  // Get item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoading,
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
