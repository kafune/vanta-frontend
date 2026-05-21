/**
 * usePromotions Hook
 * Manages promotion code application and validation
 */

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export interface PromotionState {
  code: string;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
}

export function usePromotions() {
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPromotionMutation = trpc.promotions.applyPromotionCode.useMutation();

  const applyPromotion = useCallback(
    async (code: string, cartTotal: number): Promise<PromotionState> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await applyPromotionMutation.mutateAsync({
          code,
          cartTotal,
        });

        const promotion: PromotionState = {
          code,
          discountPercentage: result.discountPercentage,
          discountAmount: result.discount,
          finalTotal: result.finalTotal,
        };

        setAppliedPromotion(promotion);
        return promotion;
      } catch (err: any) {
        const errorMessage = err.message || "Código de promoção inválido";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [applyPromotionMutation]
  );

  const removePromotion = useCallback(() => {
    setAppliedPromotion(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    appliedPromotion,
    isLoading,
    error,
    applyPromotion,
    removePromotion,
    clearError,
  };
}
