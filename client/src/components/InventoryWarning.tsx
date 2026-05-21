/**
 * Inventory Warning Component
 * Displays inventory-related warnings and alerts
 */

import { AlertCircle, CheckCircle, TrendingDown } from "lucide-react";

export interface InventoryWarningProps {
  errors: string[];
  hasLowStock?: boolean;
  allAvailable?: boolean;
}

export default function InventoryWarning({
  errors,
  hasLowStock = false,
  allAvailable = false,
}: InventoryWarningProps) {
  if (errors.length === 0 && !hasLowStock && allAvailable) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* All Available - Success State */}
      {allAvailable && errors.length === 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-3">
          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-heading text-sm text-green-400">
              ✓ Todos os itens em estoque
            </p>
            <p className="font-mono-label text-[0.65rem] text-green-300/70 mt-1">
              Seu carrinho está pronto para checkout
            </p>
          </div>
        </div>
      )}

      {/* Low Stock Warning */}
      {hasLowStock && errors.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
          <TrendingDown size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-heading text-sm text-yellow-400">
              ⚠️ Estoque limitado
            </p>
            <p className="font-mono-label text-[0.65rem] text-yellow-300/70 mt-1">
              Alguns itens têm disponibilidade reduzida
            </p>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-heading text-sm text-red-400">
                ⚠️ Problemas de Estoque
              </p>
              <ul className="space-y-1 mt-2">
                {errors.map((error, idx) => (
                  <li
                    key={idx}
                    className="font-mono-label text-[0.65rem] text-red-300/70 flex items-start gap-2"
                  >
                    <span className="flex-shrink-0 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
              <p className="font-mono-label text-[0.6rem] text-red-300/50 mt-2">
                Ajuste as quantidades para continuar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
