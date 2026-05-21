/**
 * usePromotions Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePromotions } from "../usePromotions";
import { trpc } from "@/lib/trpc";

vi.mock("@/lib/trpc");

describe("usePromotions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no promotion applied", () => {
    (trpc as any).promotions = {
      applyPromotionCode: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
        }),
      },
    };

    const { result } = renderHook(() => usePromotions());

    expect(result.current.appliedPromotion).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should apply promotion code successfully", async () => {
    const mockMutation = vi.fn().mockResolvedValue({
      success: true,
      discount: 20,
      discountPercentage: 10,
      finalTotal: 180,
    });

    (trpc as any).promotions = {
      applyPromotionCode: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const { result } = renderHook(() => usePromotions());

    await act(async () => {
      await result.current.applyPromotion("SUMMER20", 200);
    });

    await waitFor(() => {
      expect(result.current.appliedPromotion).not.toBeNull();
      expect(result.current.appliedPromotion?.code).toBe("SUMMER20");
      expect(result.current.appliedPromotion?.discountPercentage).toBe(10);
    });
  });

  it("should handle promotion error", async () => {
    const mockMutation = vi.fn().mockRejectedValue(
      new Error("Invalid promotion code")
    );

    (trpc as any).promotions = {
      applyPromotionCode: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const { result } = renderHook(() => usePromotions());

    await act(async () => {
      try {
        await result.current.applyPromotion("INVALID", 200);
      } catch (error) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.appliedPromotion).toBeNull();
    });
  });

  it("should remove promotion", async () => {
    const mockMutation = vi.fn().mockResolvedValue({
      success: true,
      discount: 20,
      discountPercentage: 10,
      finalTotal: 180,
    });

    (trpc as any).promotions = {
      applyPromotionCode: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const { result } = renderHook(() => usePromotions());

    await act(async () => {
      await result.current.applyPromotion("SUMMER20", 200);
    });

    await waitFor(() => {
      expect(result.current.appliedPromotion).not.toBeNull();
    });

    act(() => {
      result.current.removePromotion();
    });

    expect(result.current.appliedPromotion).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should clear error", async () => {
    const mockMutation = vi.fn().mockRejectedValue(
      new Error("Invalid promotion code")
    );

    (trpc as any).promotions = {
      applyPromotionCode: {
        useMutation: () => ({
          mutateAsync: mockMutation,
        }),
      },
    };

    const { result } = renderHook(() => usePromotions());

    await act(async () => {
      try {
        await result.current.applyPromotion("INVALID", 200);
      } catch (error) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
