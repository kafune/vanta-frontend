/**
 * VANTA About Section — Carbon Fiber Design System
 * Brand manifesto with asymmetric layout
 */

import { useRef, useEffect, useState } from "react";

const features = [
  {
    number: "01",
    title: "Qualidade Certificada",
    description: "Cada tecido passa por rigoroso controle de qualidade. Apenas os melhores materiais chegam até você.",
  },
  {
    number: "02",
    title: "Customização Total",
    description: "Do algodão à estampa, cada detalhe é personalizável. Sua peça, sua identidade.",
  },
  {
    number: "03",
    title: "Produção Responsável",
    description: "Processos sustentáveis e condições de trabalho justas em toda a cadeia produtiva.",
  },
  {
    number: "04",
    title: "Entrega Premium",
    description: "Embalagem exclusiva e rastreamento em tempo real. A experiência começa antes de abrir a caixa.",
  },
];

export default function AboutSection() {
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
    <section id="about" className="py-24 lg:py-32" style={{ background: "#0E0E0E" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Top manifesto */}
        <div className={`mb-20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="section-divider mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-6">Manifesto / VANTA</div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-[#EFEFEF] mb-8">
                MODA QUE<br />FALA POR<br />VOCÊ
              </h2>
            </div>
            <div>
              <p className="font-heading text-base lg:text-lg font-light text-[rgba(239,239,239,0.6)] leading-relaxed mb-6">
                Na VANTA, acreditamos que roupas são mais do que tecido. São declarações. Cada peça que criamos é projetada para ser uma extensão da sua identidade — não uma cópia de tendências passageiras.
              </p>
              <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.4)] leading-relaxed">
                Fundada com a missão de democratizar o vestuário premium com personalização real, combinamos materiais de alta qualidade com tecnologia de impressão de última geração para entregar peças únicas.
              </p>
            </div>
          </div>
          <div className="section-divider mt-12" />
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          {features.map((feature, i) => (
            <div
              key={feature.number}
              className={`p-8 lg:p-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                background: "#0E0E0E",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-start gap-6">
                <span className="font-display text-5xl lg:text-6xl text-[rgba(239,239,239,0.08)] leading-none flex-shrink-0">
                  {feature.number}
                </span>
                <div>
                  <h3 className="font-heading font-bold text-[#EFEFEF] text-lg mb-3">{feature.title}</h3>
                  <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.5)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
