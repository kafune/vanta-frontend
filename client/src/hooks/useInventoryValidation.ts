/**
 * useInventoryValidation Hook
 * Validates product inventory in real-time
 */

import { useState, useEffect, useCallback } from "react";
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

  const checkInventoryMutation = trpc.inventory.checkAvailability.useMutation?.() || { mutateAsync: async () => ({ available: 0, reserved: 0 }) };

  const validateInventory = useCallback(async () => {
    if (items.length === 0) {
      setInventoryStatus(new Map());
      setErrors([]);
      return;
    }

    setIsValidating(true);
    const errorList: string[] = [];
    const statusMap = new Map<string, InventoryItem>();

    try {
      for (const item of items) {
        try {
          const result = await (checkInventoryMutation?.mutateAsync || (async () => ({ available: 0, reserved: 0 })))({
            productId: item.id,
            quantity: item.quantity,
          });

          const status: InventoryItem = {
            productId: item.id,
            available: result.available,
            reserved: result.reserved,
            status:
              result.available === 0
                ? "out_of_stock"
                : result.available < item.quantity
                  ? "low"
                  : "available",
          };

          statusMap.set(item.id, status);

          if (result.available < item.quantity) {
            errorList.push(
              `${item.name}: apenas ${result.available} unidade(s) disponível(is)`
            );
          }

          if (result.available === 0) {
            errorList.push(`${item.name}: fora de estoque`);
          }
        } catch (error) {
          errorList.push(`Erro ao validar ${item.name}`);
        }
      }

      setInventoryStatus(statusMap);
      setErrors(errorList);
    } finally {
      setIsValidating(false);
    }
  }, [items, checkInventoryMutation]);

  // Validate inventory whenever items change
  useEffect(() => {
    validateInventory();
  }, [items, validateInventory]);

  const hasErrors = errors.length > 0;
  const allAvailable = items.every((item) => {
    const status = inventoryStatus.get(item.id);
    return status && status.status === "available";
  });

  return {
    inventoryStatus,
    isValidating,
    errors,
    hasErrors,
    allAvailable,
    validateInventory,
  };
}
