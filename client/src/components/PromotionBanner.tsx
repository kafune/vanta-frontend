/**
 * Promotion Banner Component
 * Displays active promotions and encourages users to apply codes
 */

import { useState } from "react";
import { Tag, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface PromotionBannerProps {
  onPromotionSelect?: (code: string) => void;
}

export default function PromotionBanner({ onPromotionSelect }: PromotionBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedPromotions, setDismissedPromotions] = useState<Set<string>>(new Set());

  // Fetch active promotions
  const { data: promotions, isLoading } = trpc.promotions.getActivePromotions.useQuery();

  if (isLoading || !promotions || promotions.length === 0) {
    return null;
  }

  const visiblePromotions = promotions.filter((p) => !dismissedPromotions.has(p.id));

  if (visiblePromotions.length === 0) {
    return null;
  }

  const handleDismiss = (promotionId: string) => {
    setDismissedPromotions((prev) => new Set([...prev, promotionId]));
  };

  const handleSelectPromotion = (promotionId: string) => {
    onPromotionSelect?.(promotionId);
  };

  return (
    <div className="bg-gradient-to-r from-[rgba(255,215,0,0.1)] to-[rgba(255,165,0,0.1)] border border-[rgba(255,215,0,0.2)] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag size={20} className="text-yellow-400" />
          <div>
            <p className="font-heading text-sm text-[#EFEFEF]">
              {visiblePromotions.length} Promoção{visiblePromotions.length > 1 ? "ões" : ""} Ativa{visiblePromotions.length > 1 ? "s" : ""}
            </p>
            <p className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.6)]">
              Clique para ver detalhes
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-yellow-400 hover:text-yellow-300"
        >
          <ChevronRight
            size={16}
            className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </Button>
      </div>

      {/* Expanded Promotions List */}
      {isExpanded && (
        <div className="mt-4 space-y-2 border-t border-[rgba(255,215,0,0.1)] pt-4">
          {visiblePromotions.map((promotion) => (
            <div
              key={promotion.id}
              className="flex items-center justify-between bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)] p-3 rounded-sm"
            >
              <div className="flex-1">
                <p className="font-heading text-sm text-[#EFEFEF]">
                  {promotion.name}
                </p>
                <p className="font-mono-label text-[0.65rem] text-yellow-400">
                  {promotion.discount}% de desconto
                </p>
                {promotion.applicableCategories && (
                  <p className="font-mono-label text-[0.6rem] text-[rgba(239,239,239,0.4)] mt-1">
                    Categorias: {promotion.applicableCategories.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSelectPromotion(promotion.id)}
                  className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs h-7"
                >
                  Usar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(promotion.id)}
                  className="h-7 w-7 p-0 text-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.7)]"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
