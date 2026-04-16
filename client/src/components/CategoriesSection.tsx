/**
 * OBSIDIAN Categories Section — Carbon Fiber Design System
 * Four main product categories with editorial card layout
 * Asymmetric grid: large featured card + 3 smaller cards
 */

import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORY_IMAGES = {
  cotton: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-cotton-6C3ChDmVfT5oxo4PDhFrbf.webp",
  oversized: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-oversized-fkaeTb24PqHL7RPsvGjmFY.webp",
  dryfit: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-dryfit-fpbTLZXZdYCMYERV2Myz4g.webp",
  hoodie: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-hoodie-Z6BCR25Eed5suvi3SXqxEz.webp",
};

const categories = [
  {
    id: "algodao",
    tag: "01 / Cotton",
    name: "Algodão Premium",
    description: "Textura incomparável e conforto absoluto. Tecido 100% algodão penteado de gramatura superior.",
    detail: "280g/m² · Pré-encolhido · Costuras reforçadas",
    price: "A partir de R$ 89",
    image: CATEGORY_IMAGES.cotton,
    featured: true,
  },
  {
    id: "oversized",
    tag: "02 / Oversized",
    name: "Oversized",
    description: "Silhueta urbana com caimento largo. O equilíbrio perfeito entre volume e elegância.",
    detail: "Drop shoulder · Barra alongada · Fit relaxado",
    price: "A partir de R$ 109",
    image: CATEGORY_IMAGES.oversized,
    featured: false,
  },
  {
    id: "dryfit",
    tag: "03 / Performance",
    name: "Dry Fit",
    description: "Tecnologia de secagem rápida para máxima performance. Visual técnico e esportivo.",
    detail: "Moisture-wicking · UV Protection · 4-way stretch",
    price: "A partir de R$ 99",
    image: CATEGORY_IMAGES.dryfit,
    featured: false,
  },
  {
    id: "moleton",
    tag: "04 / Essentials",
    name: "Essential Hoodies",
    description: "Moletons com acabamento de luxo. Volume generoso e tecido de alta gramatura.",
    detail: "400g/m² · Forro interno · Bolso canguru",
    price: "A partir de R$ 189",
    image: CATEGORY_IMAGES.hoodie,
    featured: false,
  },
];

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="categories" className="py-24 lg:py-32" style={{ background: "#0B0B0B" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Categorias / 04</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-[#EFEFEF]">
              NOSSAS<br />CATEGORIAS
            </h2>
            <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.5)] max-w-xs leading-relaxed">
              Quatro linhas distintas, cada uma com identidade própria e qualidade certificada.
            </p>
          </div>
        </div>

        <div className="section-divider mb-14" />

        {/* Grid Layout — Asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Featured large card — Cotton */}
          <div className={`lg:col-span-1 lg:row-span-2 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="product-card h-full cursor-pointer" style={{ borderRadius: "4px" }} onClick={() => setLocation("/categoria/algodao")}>
              <div className="relative overflow-hidden h-[380px] lg:h-[520px]">
                <img
                  src={CATEGORY_IMAGES.cotton}
                  alt="Algodão Premium"
                  className="product-image w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to top, rgba(11,11,11,0.95) 0%, rgba(11,11,11,0.3) 50%, transparent 100%)"
                }} />
                <div className="absolute top-4 left-4">
                  <span className="font-mono-label text-[rgba(239,239,239,0.5)] bg-[rgba(11,11,11,0.6)] backdrop-blur-sm px-2 py-1 text-[0.6rem]">
                    01 / Cotton
                  </span>
                </div>
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="font-heading font-bold text-[#EFEFEF] text-2xl lg:text-3xl mb-3">Algodão Premium</h3>
                <p className="text-[rgba(239,239,239,0.55)] text-sm leading-relaxed mb-3 font-light">
                  Textura incomparável e conforto absoluto. Tecido 100% algodão penteado de gramatura superior.
                </p>
                <div className="font-mono-label text-[rgba(239,239,239,0.3)] mb-5 text-[0.6rem]">
                  280g/m² · Pré-encolhido · Costuras reforçadas
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-[#EFEFEF]">A partir de R$ 89</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation("/categoria/algodao");
                    }}
                    className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] transition-colors group"
                  >
                    Ver Mais <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — 3 smaller cards */}
          {categories.slice(1).map((cat, i) => (
            <div
              key={cat.id}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${(i + 2) * 100}ms` }}
            >
              <div className="product-card h-full cursor-pointer" style={{ borderRadius: "4px" }} onClick={() => setLocation(`/categoria/${cat.id}`)}>
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
                        setLocation(`/categoria/${cat.id}`);
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
