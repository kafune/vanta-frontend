/**
 * OBSIDIAN Canvas Section — Carbon Fiber Design System
 * "Your Canvas" customization module with drag-and-drop upload
 * and interactive t-shirt mockup preview
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

// T-shirt SVG mockup paths
const TSHIRT_SVG = `
<svg viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 130 60 L 60 120 L 90 145 L 90 380 L 310 380 L 310 145 L 340 120 L 270 60 C 250 80 220 90 200 90 C 180 90 150 80 130 60 Z" 
    fill="#1a1a1a" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <!-- Left sleeve -->
  <path d="M 130 60 L 60 120 L 90 145 L 140 100 Z" 
    fill="#161616" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <!-- Right sleeve -->
  <path d="M 270 60 L 340 120 L 310 145 L 260 100 Z" 
    fill="#161616" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <!-- Collar -->
  <path d="M 130 60 C 150 80 180 90 200 90 C 220 90 250 80 270 60" 
    fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <!-- Seam lines -->
  <line x1="90" y1="145" x2="90" y2="380" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="310" y1="145" x2="310" y2="380" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4,4"/>
  <!-- Print area indicator (dashed) -->
  <rect x="145" y="130" width="110" height="120" rx="2" 
    fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="6,3"/>
</svg>
`;

type PrintPosition = "chest" | "center" | "back";

export default function CanvasSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [printPosition, setPrintPosition] = useState<PrintPosition>("chest");
  const [printScale, setPrintScale] = useState(70);
  const [shirtColor, setShirtColor] = useState<"black" | "white" | "gray">("black");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const processFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error("Formato inválido", { description: "Use PNG, JPG ou WebP." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande", { description: "Máximo 10MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      toast.success("Imagem carregada!", { description: "Ajuste a posição e o tamanho." });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = () => {
    if (!uploadedImage) {
      toast.error("Adicione uma imagem primeiro");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Pedido enviado!", { description: "Entraremos em contacto em breve." });
    }, 2000);
  };

  // Print area position based on selection
  const printAreaStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: `${printScale}%`,
      aspectRatio: "1",
      objectFit: "contain",
    };
    if (printPosition === "chest") return { ...base, top: "30%", left: "50%", transform: "translateX(-50%)" };
    if (printPosition === "center") return { ...base, top: "38%", left: "50%", transform: "translateX(-50%)" };
    return { ...base, top: "30%", left: "50%", transform: "translateX(-50%)", opacity: 0.4 };
  };

  const shirtColors = {
    black: { bg: "#1a1a1a", label: "Preto" },
    white: { bg: "#e8e8e8", label: "Branco" },
    gray: { bg: "#4a4a4a", label: "Cinza" },
  };

  return (
    <section id="canvas" className="py-24 lg:py-32" style={{ background: "#0D0D0D" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Customização / Exclusivo</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-[#EFEFEF]">
              YOUR<br />CANVAS
            </h2>
            <p className="font-heading text-sm font-light text-[rgba(239,239,239,0.5)] max-w-sm leading-relaxed">
              Transforme qualquer imagem na sua estampa exclusiva. Faça o upload, posicione e visualize em tempo real.
            </p>
          </div>
        </div>

        <div className="section-divider mb-14" />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left: Upload + Controls */}
          <div className={`flex flex-col gap-6 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Upload Zone */}
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.4)] mb-3">01 — Sua Estampa</div>
              <div
                className={`drop-zone relative rounded-sm p-8 text-center cursor-pointer transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center ${isDragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadedImage ? (
                  <div className="relative w-full">
                    <img
                      src={uploadedImage}
                      alt="Estampa carregada"
                      className="max-h-40 mx-auto object-contain rounded"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[rgba(239,239,239,0.1)] hover:bg-[rgba(239,239,239,0.2)] rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <p className="font-mono-label text-[rgba(239,239,239,0.4)] mt-4">
                      Clique para substituir
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.15)] flex items-center justify-center mb-4">
                      <Upload size={20} className="text-[rgba(239,239,239,0.5)]" />
                    </div>
                    <p className="font-heading font-medium text-[rgba(239,239,239,0.7)] mb-1">
                      Arraste sua imagem aqui
                    </p>
                    <p className="font-mono-label text-[rgba(239,239,239,0.3)]">
                      PNG, JPG ou WebP · Máx. 10MB
                    </p>
                    <div className="mt-4 px-4 py-2 border border-[rgba(255,255,255,0.15)] font-heading text-xs font-medium tracking-widest uppercase text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.3)] transition-colors">
                      Selecionar Arquivo
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Shirt Color */}
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.4)] mb-3">02 — Cor da Peça</div>
              <div className="flex gap-3">
                {(Object.entries(shirtColors) as [typeof shirtColor, { bg: string; label: string }][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setShirtColor(key)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${shirtColor === key ? "border-white scale-110" : "border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.4)]"}`}
                      style={{ background: val.bg }}
                    />
                    <span className="font-mono-label text-[rgba(239,239,239,0.4)] text-[0.55rem]">{val.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.4)] mb-3">03 — Posição da Estampa</div>
              <div className="flex gap-2">
                {([
                  { key: "chest", label: "Peito" },
                  { key: "center", label: "Centro" },
                  { key: "back", label: "Costas" },
                ] as { key: PrintPosition; label: string }[]).map((pos) => (
                  <button
                    key={pos.key}
                    onClick={() => setPrintPosition(pos.key)}
                    className={`category-tag flex-1 text-center transition-all ${printPosition === pos.key ? "active" : ""}`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.4)] mb-3">
                04 — Tamanho da Estampa — <span className="text-[#EFEFEF]">{printScale}%</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPrintScale(Math.max(20, printScale - 10))}
                  className="w-8 h-8 border border-[rgba(255,255,255,0.15)] flex items-center justify-center hover:border-[rgba(255,255,255,0.4)] transition-colors"
                >
                  <ZoomOut size={14} />
                </button>
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)] relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 bg-[#EFEFEF] rounded-full transition-all duration-200"
                    style={{ width: `${printScale}%` }}
                  />
                </div>
                <button
                  onClick={() => setPrintScale(Math.min(100, printScale + 10))}
                  className="w-8 h-8 border border-[rgba(255,255,255,0.15)] flex items-center justify-center hover:border-[rgba(255,255,255,0.4)] transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Reset + Submit */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setUploadedImage(null); setPrintScale(70); setPrintPosition("chest"); setShirtColor("black"); }}
                className="btn-outline-cta flex-1 flex items-center justify-center gap-2"
              >
                <span className="flex items-center gap-2"><RotateCcw size={12} /> Resetar</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-cta flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isSubmitting ? (
                    <span className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  {isSubmitting ? "Enviando..." : "Encomendar"}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Mockup Preview */}
          <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="font-mono-label text-[rgba(239,239,239,0.4)] mb-3">Preview em Tempo Real</div>
            <div
              className="glass-card relative flex items-center justify-center"
              style={{
                minHeight: "480px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {/* Background grid pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* T-shirt mockup */}
              <div className="relative z-10 w-[280px] lg:w-[320px]">
                {/* SVG Shirt with color overlay */}
                <div
                  className="relative"
                  style={{
                    filter: shirtColor === "white"
                      ? "invert(0.85) brightness(1.1)"
                      : shirtColor === "gray"
                      ? "brightness(1.4)"
                      : "none",
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: TSHIRT_SVG }} />

                  {/* Print image overlay */}
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Estampa"
                      style={printAreaStyle()}
                    />
                  )}

                  {/* Placeholder text when no image */}
                  {!uploadedImage && (
                    <div
                      style={{
                        position: "absolute",
                        top: "34%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "80px",
                        textAlign: "center",
                      }}
                    >
                      <p className="font-mono-label text-[rgba(239,239,239,0.2)] text-[0.55rem] leading-relaxed">
                        Sua estampa<br />aparece aqui
                      </p>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="text-center mt-4">
                  <div className="font-mono-label text-[rgba(239,239,239,0.3)] text-[0.6rem]">
                    OBSIDIAN · {shirtColor === "black" ? "Preto" : shirtColor === "white" ? "Branco" : "Cinza"} · {printPosition === "chest" ? "Peito" : printPosition === "center" ? "Centro" : "Costas"}
                  </div>
                </div>
              </div>

              {/* Corner labels */}
              <div className="absolute top-4 right-4 font-mono-label text-[rgba(239,239,239,0.2)] text-[0.55rem]">
                MOCKUP 3D
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Resolução Mín.", value: "300 DPI" },
                { label: "Área de Impressão", value: "30×30cm" },
                { label: "Prazo", value: "5–7 dias" },
              ].map((info) => (
                <div key={info.label} className="glass-card p-3 text-center" style={{ borderRadius: "4px" }}>
                  <div className="font-heading font-semibold text-[#EFEFEF] text-sm">{info.value}</div>
                  <div className="font-mono-label text-[rgba(239,239,239,0.35)] mt-0.5">{info.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
