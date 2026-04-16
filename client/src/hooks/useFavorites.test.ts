import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites, FavoriteProduct } from "./useFavorites";

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty favorites", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("should add a favorite product", () => {
    const { result } = renderHook(() => useFavorites());
    const product: FavoriteProduct = {
      id: "test-1",
      name: "Test Product",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addFavorite(product);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toMatchObject({
      id: "test-1",
      name: "Test Product",
    });
  });

  it("should not add duplicate favorites", () => {
    const { result } = renderHook(() => useFavorites());
    const product: FavoriteProduct = {
      id: "test-1",
      name: "Test Product",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addFavorite(product);
      result.current.addFavorite(product);
    });

    expect(result.current.favorites).toHaveLength(1);
  });

  it("should remove a favorite product", () => {
    const { result } = renderHook(() => useFavorites());
    const product: FavoriteProduct = {
      id: "test-1",
      name: "Test Product",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addFavorite(product);
      result.current.removeFavorite("test-1");
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it("should check if product is favorite", () => {
    const { result } = renderHook(() => useFavorites());
    const product: FavoriteProduct = {
      id: "test-1",
      name: "Test Product",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addFavorite(product);
    });

    expect(result.current.isFavorite("test-1")).toBe(true);
    expect(result.current.isFavorite("test-2")).toBe(false);
  });

  it("should toggle favorite status", () => {
    const { result } = renderHook(() => useFavorites());
    const product: FavoriteProduct = {
      id: "test-1",
      name: "Test Product",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.toggleFavorite(product);
    });

    expect(result.current.isFavorite("test-1")).toBe(true);

    act(() => {
      result.current.toggleFavorite(product);
    });

    expect(result.current.isFavorite("test-1")).toBe(false);
  });

  it("should clear all favorites", () => {
    const { result } = renderHook(() => useFavorites());
    const product1: FavoriteProduct = {
      id: "test-1",
      name: "Test Product 1",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };
    const product2: FavoriteProduct = {
      id: "test-2",
      name: "Test Product 2",
      color: "White",
      price: 79.99,
      image: "test2.jpg",
      category: "dryfit",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addFavorite(product1);
      result.current.addFavorite(product2);
      result.current.clearAllFavorites();
    });

    expect(result.current.favorites).toHaveLength(0);
  });

  it("should persist favorites to localStorage", () => {
    const { result: result1 } = renderHook(() => useFavorites());
    const product: FavoriteProduct = {
      id: "test-1",
      name: "Test Product",
      color: "Black",
      price: 99.99,
      image: "test.jpg",
      category: "moleton",
      addedAt: new Date().toISOString(),
    };

    act(() => {
      result1.current.addFavorite(product);
    });

    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useFavorites());

    // Wait for loading to complete
    act(() => {
      // Give time for localStorage to be read
    });

    expect(result2.current.favorites).toHaveLength(1);
    expect(result2.current.favorites[0]?.id).toBe("test-1");
  });
});
