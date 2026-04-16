/**
 * OBSIDIAN Hero Section — Carbon Fiber Design System
 * Full-viewport hero with editorial typography and asymmetric layout
 * Dark image background with white text (high contrast)
 */

import { ArrowRight } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/hero-main-KwojdHS6JZBE23rvunJQaZ.webp";

export default function HeroSection() {
  const scrollToCanvas = () => {
    document.querySelector("#canvas")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToCollection = () => {
    document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden" style={{ background: "#0B0B0B" }}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="OBSIDIAN Premium Fashion"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.75 }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.3) 60%, rgba(11,11,11,0.1) 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(11,11,11,0.95) 0%, rgba(11,11,11,0.4) 40%, transparent 70%)"
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="max-w-3xl">
          {/* Eyebrow label */}
          <div className="font-mono-label text-[rgba(239,239,239,0.45)] mb-6 animate-fade-up animate-fade-up-delay-1">
            Nova Coleção — 2025
          </div>

          {/* Main headline */}
          <h1
            className="font-display text-[clamp(4rem,12vw,10rem)] leading-[0.9] text-white mb-6 animate-fade-up animate-fade-up-delay-2"
            style={{ textShadow: "0 0 80px rgba(0,0,0,0.5)" }}
          >
            WEAR<br />
            <span style={{ color: "rgba(239,239,239,0.85)" }}>YOUR</span><br />
            STORY
          </h1>

          {/* Subtitle */}
          <p className="font-heading text-base lg:text-lg font-light text-[rgba(239,239,239,0.65)] max-w-md mb-10 leading-relaxed animate-fade-up animate-fade-up-delay-3">
            Vestuário premium com personalização exclusiva. Cada peça é uma tela em branco para a sua expressão.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 animate-fade-up animate-fade-up-delay-4">
            <button className="btn-cta" onClick={scrollToCollection}>
              <span className="flex items-center gap-2">
                Explorar Coleção
                <ArrowRight size={14} />
              </span>
            </button>
            <button className="btn-outline-cta" onClick={scrollToCanvas}>
              <span>Criar Minha Peça</span>
            </button>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.08)] flex flex-wrap gap-8 lg:gap-16">
          {[
            { value: "4", label: "Categorias Premium" },
            { value: "100%", label: "Algodão Certificado" },
            { value: "48h", label: "Entrega Express" },
            { value: "∞", label: "Possibilidades" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-2xl lg:text-3xl text-white tracking-wide">{stat.value}</div>
              <div className="font-mono-label text-[rgba(239,239,239,0.4)] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 opacity-40">
        <div className="font-mono-label text-[rgba(239,239,239,0.5)] rotate-90 origin-center" style={{ writingMode: "vertical-rl" }}>
          scroll
        </div>
        <div className="w-px h-12 bg-gradient-to-b from-[rgba(239,239,239,0.4)] to-transparent" />
      </div>
    </section>
  );
}
