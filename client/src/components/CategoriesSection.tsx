/**
 * VANTA Categories Section — Carbon Fiber Design System
 * Categorias derivadas do catálogo real (trpc.products.getCategoryStats):
 * só aparecem categorias que têm produtos, com preço "a partir de" real.
 * O texto/imagem por categoria é copy de UI (não dado de produto).
 */

import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type Category = "cotton" | "oversized" | "dryfit" | "hoodie";

// Metadados de apresentação por categoria (ordem define o layout).
const CATEGORY_META: Record<Category, { slug: string; tag: string; name: string; description: string; detail: string; image: string }> = {
  cotton: {
    slug: "algodao",
    tag: "01 / Cotton",
    name: "Algodão Premium",
    description: "Textura incomparável e conforto absoluto. Tecido 100% algodão penteado de gramatura superior.",
    detail: "280g/m² · Pré-encolhido · Costuras reforçadas",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-cotton-6C3ChDmVfT5oxo4PDhFrbf.webp",
  },
  oversized: {
    slug: "oversized",
    tag: "02 / Oversized",
    name: "Oversized",
    description: "Silhueta urbana com caimento largo. O equilíbrio perfeito entre volume e elegância.",
    detail: "Drop shoulder · Barra alongada · Fit relaxado",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/oversized-offwhite-c8WohVPsQ9PCtLcY97nDkj.webp",
  },
  dryfit: {
    slug: "dryfit",
    tag: "03 / Performance",
    name: "Dry Fit",
    description: "Tecnologia de secagem rápida para máxima performance. Visual técnico e esportivo.",
    detail: "Moisture-wicking · UV Protection · 4-way stretch",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-dryfit-fpbTLZXZdYCMYERV2Myz4g.webp",
  },
  hoodie: {
    slug: "moleton",
    tag: "04 / Hoodie",
    name: "Essential Hoodies",
    description: "Moletons de luxo com volume e acabamento premium. Conforto que veste atitude.",
    detail: "Interior felpudo · Bolso canguru · Gola dupla",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-hoodie-Z6BCR25Eed5suvi3SXqxEz.webp",
  },
};

// Ordem fixa de exibição entre as categorias que tiverem produtos.
const CATEGORY_ORDER: Category[] = ["cotton", "oversized", "dryfit", "hoodie"];

const formatFrom = (minPriceCents: number) => `A partir de R$ ${Math.floor(minPriceCents / 100)}`;

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [, setLocation] = useLocation();

  const { data: stats } = trpc.products.getCategoryStats.useQuery();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Monta os cards a partir das categorias reais que têm produtos.
  const minByCategory = new Map<string, number>(
    (stats ?? []).map((s) => [s.category, s.minPrice])
  );
  const cards = CATEGORY_ORDER.filter((c) => minByCategory.has(c)).map((c) => ({
    ...CATEGORY_META[c],
    price: formatFrom(minByCategory.get(c)!),
  }));

  if (cards.length === 0) return null;

  const [featured, ...rest] = cards;

  return (
    <section id="categories" className="py-24 lg:py-32" style={{ background: "#0B0B0B" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Categorias / {String(cards.length).padStart(2, "0")}</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-[#EFEFEF]">
              NOSSAS<br />CATEGORIAS
            </h2>
            <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.5)] max-w-xs leading-relaxed">
              Cada linha com identidade própria e qualidade certificada.
            </p>
          </div>
        </div>

        <div className="section-divider mb-14" />

        {/* Grid Layout — Asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Featured large card */}
          <div className={`lg:col-span-1 lg:row-span-2 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="product-card h-full cursor-pointer" style={{ borderRadius: "4px" }} onClick={() => setLocation(`/categoria/${featured.slug}`)}>
              <div className="relative overflow-hidden h-[380px] lg:h-[520px]">
                <img
                  src={featured.image}
                  alt={featured.name}
                  className="product-image w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to top, rgba(11,11,11,0.95) 0%, rgba(11,11,11,0.3) 50%, transparent 100%)"
                }} />
                <div className="absolute top-4 left-4">
                  <span className="font-mono-label text-[rgba(239,239,239,0.5)] bg-[rgba(11,11,11,0.6)] backdrop-blur-sm px-2 py-1 text-[0.6rem]">
                    {featured.tag}
                  </span>
                </div>
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="font-heading font-bold text-[#EFEFEF] text-2xl lg:text-3xl mb-3">{featured.name}</h3>
                <p className="text-[rgba(239,239,239,0.55)] text-sm leading-relaxed mb-3 font-light">
                  {featured.description}
                </p>
                <div className="font-mono-label text-[rgba(239,239,239,0.3)] mb-5 text-[0.6rem]">
                  {featured.detail}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-[#EFEFEF]">{featured.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/categoria/${featured.slug}`);
                    }}
                    className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] transition-colors group"
                  >
                    Ver Mais <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — smaller cards */}
          {rest.map((cat, i) => (
            <div
              key={cat.slug}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${(i + 2) * 100}ms` }}
            >
              <div className="product-card h-full cursor-pointer" style={{ borderRadius: "4px" }} onClick={() => setLocation(`/categoria/${cat.slug}`)}>
                <div className="relative overflow-hidden h-[220px] lg:h-[240px]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="product-image w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(to top, rgba(11,11,11,0.9) 0%, rgba(11,11,11,0.2) 60%, transparent 100%)"
                  }} />
                  <div className="absolute top-4 left-4">
                    <span className="font-mono-label text-[rgba(239,239,239,0.5)] bg-[rgba(11,11,11,0.6)] backdrop-blur-sm px-2 py-1 text-[0.6rem]">
                      {cat.tag}
                    </span>
                  </div>
                </div>
                <div className="p-5 lg:p-6">
                  <h3 className="font-heading font-bold text-[#EFEFEF] text-lg lg:text-xl mb-2">{cat.name}</h3>
                  <p className="text-[rgba(239,239,239,0.55)] text-sm leading-relaxed mb-3 font-light">{cat.description}</p>
                  <div className="font-mono-label text-[rgba(239,239,239,0.3)] mb-4 text-[0.6rem]">{cat.detail}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-[#EFEFEF] text-sm">{cat.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/categoria/${cat.slug}`);
                      }}
                      className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] transition-colors group"
                    >
                      Ver Mais <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
