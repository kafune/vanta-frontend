/**
 * useInventoryValidation Hook
 * Validates product inventory in real-time using tRPC queries
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";

export interface InventoryItem {
  productId: string;
  available: number;
  reserved: number;
  status: "available" | "low" | "out_of_stock";
}

export interface CartItemForValidation {
  id: string;
  name: string;
  quantity: number;
}

export function useInventoryValidation(items: CartItemForValidation[]) {
  const [inventoryStatus, setInventoryStatus] = useState<Map<string, InventoryItem>>(new Map());
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Extract product IDs for batch inventory check
  const productIds = useMemo(() => items.map((item) => item.id), [items]);

  // Use tRPC query to fetch inventory for all products at once
  const { data: inventoryData, isLoading } = trpc.inventory.getInventoryBatch.useQuery(
    { productIds },
    {
      enabled: productIds.length > 0,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Validate inventory whenever items or inventory data changes
  const validateInventory = useCallback(() => {
    if (!inventoryData || items.length === 0) {
      setInventoryStatus(new Map());
      setErrors([]);
      return;
    }

    const errorList: string[] = [];
    const statusMap = new Map<string, InventoryItem>();

    for (const item of items) {
      const inv = inventoryData.find((i) => i.productId === item.id);

      if (!inv) {
        errorList.push(`${item.name}: produto não encontrado`);
        continue;
      }

      const status: InventoryItem = {
        productId: item.id,
        available: inv.available || 0,
        reserved: inv.reserved || 0,
        status:
          inv.available === 0
            ? "out_of_stock"
            : inv.available < item.quantity
              ? "low"
              : "available",
      };

      statusMap.set(item.id, status);

      if (inv.available < item.quantity) {
        errorList.push(
          `${item.name}: apenas ${inv.available} unidade(s) disponível(is)`
        );
      }

      if (inv.available === 0) {
        errorList.push(`${item.name}: fora de estoque`);
      }
    }

    setInventoryStatus(statusMap);
    setErrors(errorList);
  }, [items, inventoryData]);

  // Validate whenever items or inventory data changes
  useEffect(() => {
    setIsValidating(isLoading);
    validateInventory();
  }, [items, inventoryData, isLoading, validateInventory]);

  const hasErrors = errors.length > 0;
  const allAvailable = items.every((item) => {
    const status = inventoryStatus.get(item.id);
    return status && status.status === "available";
  });

  return {
    inventoryStatus,
    isValidating: isValidating || isLoading,
    errors,
    hasErrors,
    allAvailable,
    validateInventory,
  };
}
