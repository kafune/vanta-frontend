import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discount: number;
  couponId?: string;
}

export function useCoupon() {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateCoupon = trpc.coupons.validate.useQuery(
    { code: "" },
    { enabled: false }
  );

  const applyCouponMutation = trpc.coupons.applyCoupon.useMutation();

  const handleApplyCoupon = useCallback(
    async (code: string, cartTotal: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await applyCouponMutation.mutateAsync({
          code: code.toUpperCase(),
          cartTotal,
        });

        if (result.success) {
          setAppliedCoupon({
            code: code.toUpperCase(),
            discountType: result.discountType,
            discountValue: result.discountValue,
            discount: result.discount,
            couponId: result.couponId,
          });
          return result;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao aplicar cupom";
        setError(errorMessage);
        setAppliedCoupon(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyCouponMutation]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setError(null);
  }, []);

  return {
    appliedCoupon,
    error,
    loading,
    handleApplyCoupon,
    removeCoupon,
  };
}
