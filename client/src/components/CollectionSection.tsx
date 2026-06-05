/**
 * VANTA Collection Section – Carbon Fiber Design System
 * Featured products grid with filter tabs
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { PaginatedProductGrid } from "./PaginatedProductGrid";

// Removidas categorias: cotton, oversized, dryfit, hoodie
// Mantido apenas "todos" para mostrar todos os produtos
type FilterType = "todos";

const filters: { key: FilterType; label: string }[] = [
  { key: "todos", label: "Todos" },
];

export default function CollectionSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const [, setLocation] = useLocation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true); // Começa como true para carregar imediatamente

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="collection" className="py-24 lg:py-32" style={{ background: "#0B0B0B" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8" ref={sectionRef}>
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
          category={activeFilter}
          limit={12}
          onProductClick={(productId) => setLocation(`/produto/${productId}`)}
        />
      </div>
    </section>
  );
}
