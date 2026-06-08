/**
 * VANTA Testimonials Section — Carbon Fiber Design System
 * Depoimentos reais (avaliações aprovadas via trpc.reviews). Sem avaliações,
 * a seção não é renderizada (nada de social proof inventado).
 */

import { useRef, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Primeiro nome + inicial do sobrenome (ex.: "Lucas Macedo" -> "Lucas M.").
function shortName(name: string | null): string {
  if (!name) return "Cliente";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const { data: reviews } = trpc.reviews.getRecent.useQuery({ limit: 4 });
  const { data: stats } = trpc.reviews.getGlobalStats.useQuery();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Sem avaliações reais ainda → não renderiza a seção.
  if (!reviews || reviews.length === 0) return null;

  const average = stats?.average || 0;
  const total = stats?.total || reviews.length;

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
            {average > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i <= Math.round(average) ? "fill-[#EFEFEF] text-[#EFEFEF]" : "text-[rgba(239,239,239,0.25)]"}
                    />
                  ))}
                </div>
                <span className="font-heading font-semibold text-[#EFEFEF]">{average.toFixed(1)}</span>
                <span className="font-mono-label text-[rgba(239,239,239,0.35)]">/ {total} {total === 1 ? "avaliação" : "avaliações"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((t, i) => (
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
                "{t.comment || t.title}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-semibold text-[#EFEFEF] text-sm">{shortName(t.userName)}</div>
                </div>
                {t.productName && (
                  <div className="font-mono-label text-[rgba(239,239,239,0.25)] text-[0.6rem] text-right">
                    {t.productName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
