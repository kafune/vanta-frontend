/**
 * VANTA Collection Section – Carbon Fiber Design System
 * Featured products grid with filter tabs
 */

import { useLocation } from "wouter";
import { PaginatedProductGrid } from "./PaginatedProductGrid";

export default function CollectionSection() {
  const [, setLocation] = useLocation();

  return (
    <section id="collection" className="py-24 lg:py-32" style={{ background: "#0B0B0B" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Coleção / 2025</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-[#EFEFEF]">
              PRODUTOS<br />EM DESTAQUE
            </h2>
          </div>
        </div>

        <div className="section-divider mb-10" />

        {/* Paginated Products Grid */}
        <PaginatedProductGrid
          category="todos"
          limit={12}
          onProductClick={(productId) => setLocation(`/produto/${productId}`)}
        />
      </div>
    </section>
  );
}
