/**
 * VANTA Category Products Page
 * Lista produtos reais (do banco) por categoria, via PaginatedProductGrid.
 */

import { useRoute, useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { PaginatedProductGrid } from "@/components/PaginatedProductGrid";

type DbCategory = "cotton" | "oversized" | "dryfit" | "hoodie";

// Mapeia o slug da URL para a categoria do banco + título/descrição da seção.
const CATEGORY_MAP: Record<string, { category: DbCategory; name: string; description: string }> = {
  algodao: { category: "cotton", name: "Algodão Premium", description: "100% algodão premium com foco em textura e conforto." },
  cotton: { category: "cotton", name: "Algodão Premium", description: "100% algodão premium com foco em textura e conforto." },
  oversized: { category: "oversized", name: "Oversized", description: "Silhueta urbana com caimento largo e confortável." },
  dryfit: { category: "dryfit", name: "Performance Dry Fit", description: "Camisetas de performance com tecnologia de secagem rápida." },
  moleton: { category: "hoodie", name: "Moletons", description: "Moletons de luxo com volume e acabamento premium." },
  hoodie: { category: "hoodie", name: "Moletons", description: "Moletons de luxo com volume e acabamento premium." },
};

export default function CategoryProducts() {
  const [, params] = useRoute("/categoria/:category");
  const [, setLocation] = useLocation();
  const slug = params?.category?.toLowerCase() ?? "";
  const info = CATEGORY_MAP[slug];

  if (!info) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[rgba(239,239,239,0.5)] mb-6">Categoria não encontrada.</p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="font-heading text-sm">Voltar à loja</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        <span className="font-heading text-sm">Voltar</span>
      </button>

      <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-3">{info.name}</h1>
      <p className="text-[rgba(239,239,239,0.5)] max-w-2xl mb-12">{info.description}</p>

      <PaginatedProductGrid
        category={info.category}
        limit={12}
        onProductClick={(id) => setLocation(`/produto/${id}`)}
      />
    </div>
  );
}
