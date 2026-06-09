/**
 * VANTA useCart Hook Tests
 * Comprehensive test suite for cart functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart, CartProvider, CartItem } from "./useCart";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useCart Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it("should add item to cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    const item: CartItem = {
      id: "test-1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
      size: "M",
    };

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject(item);
    expect(result.current.itemCount).toBe(1);
  });

  it("should increment quantity for duplicate items", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    const item: CartItem = {
      id: "test-1",
      name: "Test Product",
      price: 100,
      quantity: 1,
      image: "test.jpg",
      size: "M",
    };

    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
  });

  it("should calculate subtotal correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 2,
        image: "test.jpg",
      });
      result.current.addItem({
        id: "test-2",
        name: "Product 2",
        price: 50,
        quantity: 1,
        image: "test.jpg",
      });
    });

    // price em centavos: (100*2 + 50*1) = 250 centavos = R$ 2,50
    expect(result.current.subtotal).toBe(2.5);
  });

  it("should calculate tax correctly (10%)", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 1,
        image: "test.jpg",
      });
    });

    // 100 centavos * 0,1 = 10 centavos = R$ 0,10
    expect(result.current.tax).toBe(0.1);
  });

  it("should give free shipping for orders over R$200", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 20000, // R$ 200,00 em centavos
        quantity: 1,
        image: "test.jpg",
      });
    });

    expect(result.current.shipping).toBe(0);
  });

  it("should charge R$15 shipping on orders under R$200", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 5000, // R$ 50,00 em centavos
        quantity: 1,
        image: "test.jpg",
      });
    });

    expect(result.current.shipping).toBe(15);
  });

  it("should calculate total correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 25000, // R$ 250,00 em centavos
        quantity: 1,
        image: "test.jpg",
      });
    });

    // Subtotal: R$ 250,00, IVA: R$ 25,00, Frete: grátis (>= R$200) => Total: R$ 275,00
    expect(result.current.subtotal).toBe(250);
    expect(result.current.tax).toBe(25);
    expect(result.current.shipping).toBe(0);
    expect(result.current.total).toBe(275);
  });

  it("should remove item from cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 1,
        image: "test.jpg",
      });
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.removeItem("test-1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("should update item quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 1,
        image: "test.jpg",
      });
    });

    act(() => {
      result.current.updateQuantity("test-1", 5);
    });

    expect(result.current.items[0]?.quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
  });

  it("should remove item when quantity is set to 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 1,
        image: "test.jpg",
      });
    });

    act(() => {
      result.current.updateQuantity("test-1", 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("should clear entire cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 1,
        image: "test.jpg",
      });
      result.current.addItem({
        id: "test-2",
        name: "Product 2",
        price: 50,
        quantity: 2,
        image: "test.jpg",
      });
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("should persist cart to localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 1,
        image: "test.jpg",
      });
    });

    const stored = localStorage.getItem("obsidian_cart");
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it("should respect MAX_QUANTITY limit", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addItem({
        id: "test-1",
        name: "Product 1",
        price: 100,
        quantity: 100,
        image: "test.jpg",
      });
    });

    expect(result.current.items[0]?.quantity).toBe(99); // MAX_QUANTITY is 99
  });

  it("should handle items with customization", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    const item: CartItem = {
      id: "test-1",
      name: "Custom Product",
      price: 150,
      quantity: 1,
      image: "test.jpg",
      customization: {
        imageData: "data:image/png;base64,...",
        shirtColor: "#000000",
      },
    };

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.items[0]?.customization).toBeDefined();
    expect(result.current.items[0]?.customization?.shirtColor).toBe("#000000");
  });

});
