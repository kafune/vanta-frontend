/**
 * VANTA Category Products Page
 * Lista produtos reais de uma categoria (via tRPC) usando o grid paginado.
 */

import { useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { PaginatedProductGrid } from "@/components/PaginatedProductGrid";

type Category = "cotton" | "oversized" | "dryfit" | "hoodie";

// Mapeia o slug da URL para a categoria real do catálogo (aceita aliases pt-br).
const SLUG_TO_CATEGORY: Record<string, Category> = {
  cotton: "cotton",
  algodao: "cotton",
  oversized: "oversized",
  dryfit: "dryfit",
  hoodie: "hoodie",
  moleton: "hoodie",
  moletom: "hoodie",
};

// Copy de UI por categoria (título + descrição). Não são dados de produto.
const CATEGORY_INFO: Record<Category, { name: string; description: string }> = {
  cotton: {
    name: "Algodão Premium",
    description: "100% algodão premium com foco em textura e conforto.",
  },
  oversized: {
    name: "Oversized",
    description: "Silhueta urbana com caimento largo e confortável.",
  },
  dryfit: {
    name: "Performance Dry Fit",
    description: "Camisetas de performance com tecnologia de secagem rápida.",
  },
  hoodie: {
    name: "Essential Hoodies",
    description: "Moletons de luxo com volume e acabamento premium.",
  },
};

export default function CategoryProducts() {
  const [, params] = useRoute("/categoria/:category");
  const [, setLocation] = useLocation();

  const slug = params?.category?.toLowerCase();
  const category = useMemo(() => (slug ? SLUG_TO_CATEGORY[slug] : undefined), [slug]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[rgba(239,239,239,0.5)] mb-4">Categoria não encontrada</p>
          <button
            onClick={() => setLocation("/")}
            className="font-heading text-sm text-[#EFEFEF] underline"
          >
            Voltar à loja
          </button>
        </div>
      </div>
    );
  }

  const info = CATEGORY_INFO[category];

  return (
    <div className="min-h-screen bg-[#0B0B0B]" style={{ background: "#0B0B0B" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0B0B0B] border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-heading text-sm">Voltar</span>
          </button>
          <h1 className="font-display text-2xl text-[#EFEFEF]">{info.name}</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-[rgba(239,239,239,0.5)] text-center mb-12 max-w-2xl mx-auto">
          {info.description}
        </p>

        <PaginatedProductGrid category={category} limit={12} />
      </div>
    </div>
  );
}
