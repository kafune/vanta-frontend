/**
 * useInventoryValidation Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useInventoryValidation } from "../useInventoryValidation";
import { trpc } from "@/lib/trpc";

vi.mock("@/lib/trpc");

describe("useInventoryValidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty inventory status", () => {
    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
        }),
      },
    };

    const { result } = renderHook(() => useInventoryValidation([]));

    expect(result.current.inventoryStatus.size).toBe(0);
    expect(result.current.errors).toEqual([]);
    expect(result.current.hasErrors).toBe(false);
  });

  it("should validate inventory for cart items", async () => {
    const mockMutation = vi.fn().mockResolvedValue({
      available: 10,
      reserved: 0,
    });

    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const items = [
      { id: "prod-1", name: "Product 1", quantity: 2 },
      { id: "prod-2", name: "Product 2", quantity: 1 },
    ];

    const { result } = renderHook(() => useInventoryValidation(items));

    await waitFor(() => {
      expect(result.current.inventoryStatus.size).toBe(2);
    });
  });

  it("should detect low stock", async () => {
    const mockMutation = vi.fn().mockImplementation((input) => {
      if (input.productId === "prod-1") {
        return Promise.resolve({ available: 1, reserved: 0 });
      }
      return Promise.resolve({ available: 10, reserved: 0 });
    });

    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const items = [
      { id: "prod-1", name: "Product 1", quantity: 2 },
      { id: "prod-2", name: "Product 2", quantity: 1 },
    ];

    const { result } = renderHook(() => useInventoryValidation(items));

    await waitFor(() => {
      expect(result.current.errors.length).toBeGreaterThan(0);
      expect(result.current.hasErrors).toBe(true);
    });
  });

  it("should detect out of stock", async () => {
    const mockMutation = vi.fn().mockResolvedValue({
      available: 0,
      reserved: 5,
    });

    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const items = [
      { id: "prod-1", name: "Product 1", quantity: 1 },
    ];

    const { result } = renderHook(() => useInventoryValidation(items));

    await waitFor(() => {
      expect(result.current.errors.length).toBeGreaterThan(0);
      expect(result.current.hasErrors).toBe(true);
    });
  });

  it("should mark all items as available when sufficient stock", async () => {
    const mockMutation = vi.fn().mockResolvedValue({
      available: 10,
      reserved: 0,
    });

    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const items = [
      { id: "prod-1", name: "Product 1", quantity: 2 },
      { id: "prod-2", name: "Product 2", quantity: 1 },
    ];

    const { result } = renderHook(() => useInventoryValidation(items));

    await waitFor(() => {
      expect(result.current.allAvailable).toBe(true);
      expect(result.current.hasErrors).toBe(false);
    });
  });

  it("should handle validation errors", async () => {
    const mockMutation = vi.fn().mockRejectedValue(
      new Error("Validation failed")
    );

    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const items = [
      { id: "prod-1", name: "Product 1", quantity: 1 },
    ];

    const { result } = renderHook(() => useInventoryValidation(items));

    await waitFor(() => {
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  it("should clear inventory status when items are empty", async () => {
    const mockMutation = vi.fn().mockResolvedValue({
      available: 10,
      reserved: 0,
    });

    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const { result, rerender } = renderHook(
      ({ items }) => useInventoryValidation(items),
      {
        initialProps: {
          items: [{ id: "prod-1", name: "Product 1", quantity: 1 }],
        },
      }
    );

    await waitFor(() => {
      expect(result.current.inventoryStatus.size).toBe(1);
    });

    rerender({ items: [] });

    await waitFor(() => {
      expect(result.current.inventoryStatus.size).toBe(0);
      expect(result.current.errors).toEqual([]);
    });
  });
});
