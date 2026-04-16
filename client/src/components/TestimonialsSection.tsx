/**
 * OBSIDIAN Testimonials Section — Carbon Fiber Design System
 * Social proof with customer reviews in horizontal scroll
 */

import { useRef, useEffect, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Lucas M.",
    handle: "@lucasm_style",
    rating: 5,
    text: "A qualidade do algodão é incomparável. Já comprei em outras marcas premium e a OBSIDIAN está num nível acima. O processo de customização é incrível.",
    product: "Essential Tee 280g",
  },
  {
    id: 2,
    name: "Ana P.",
    handle: "@anapires",
    rating: 5,
    text: "O Hoodie chegou numa embalagem linda e a qualidade do tecido é absurda. Parece que vai durar anos. Já fiz o segundo pedido.",
    product: "Luxury Hoodie",
  },
  {
    id: 3,
    name: "Rafael S.",
    handle: "@rafaelstreet",
    rating: 5,
    text: "Usei o Your Canvas para criar uma estampa personalizada e ficou exatamente como eu imaginei. O mockup em tempo real ajudou muito na decisão.",
    product: "Your Canvas — Oversized",
  },
  {
    id: 4,
    name: "Mariana C.",
    handle: "@mari.creates",
    rating: 5,
    text: "Finalmente uma marca que entende o que é moda premium acessível. O Dry Fit é perfeito para treinos e ainda fica estiloso no dia a dia.",
    product: "Performance Pro",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 lg:py-28 overflow-hidden" style={{ background: "#0B0B0B" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="section-divider mb-12" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Clientes / Reviews</div>
              <h2 className="font-display text-[clamp(2rem,5vw,4rem)] leading-none text-[#EFEFEF]">
                O QUE DIZEM<br />SOBRE NÓS
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className="fill-[#EFEFEF] text-[#EFEFEF]" />
                ))}
              </div>
              <span className="font-heading font-semibold text-[#EFEFEF]">4.9</span>
              <span className="font-mono-label text-[rgba(239,239,239,0.35)]">/ 500+ avaliações</span>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`glass-card p-6 lg:p-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ borderRadius: "4px", transitionDelay: `${i * 80}ms` }}
            >
              {/* Stars */}
              <div className="flex mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-[rgba(239,239,239,0.7)] text-[rgba(239,239,239,0.7)]" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.65)] leading-relaxed mb-5">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-semibold text-[#EFEFEF] text-sm">{t.name}</div>
                  <div className="font-mono-label text-[rgba(239,239,239,0.3)] text-[0.6rem]">{t.handle}</div>
                </div>
                <div className="font-mono-label text-[rgba(239,239,239,0.25)] text-[0.6rem] text-right">
                  {t.product}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
