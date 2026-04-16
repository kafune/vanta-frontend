/**
 * VANTA Canvas Section — Carbon Fiber Design System
 * "Your Canvas" customization module with advanced drag-and-drop,
 * real-time SVG mockup, download/share, and design history
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Share2, RotateCcw, Palette, Move, Save } from "lucide-react";
import { toast } from "sonner";
import DesignHistory from "./DesignHistory";
import { useDesignHistory, Design } from "@/hooks/useDesignHistory";

// T-shirt SVG mockup with dynamic color support
const getTshirtSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 50 L 50 110 L 80 140 L 80 450 L 320 450 L 320 140 L 350 110 L 280 50 C 260 70 230 80 200 80 C 170 80 140 70 120 50 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve -->
  <path d="M 120 50 L 50 110 L 80 140 L 130 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve -->
  <path d="M 280 50 L 350 110 L 320 140 L 270 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Collar -->
  <path d="M 120 50 C 140 70 170 80 200 80 C 230 80 260 70 280 50" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  <!-- Seam lines -->
  <line x1="80" y1="140" x2="80" y2="450" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="5,5"/>
  <line x1="320" y1="140" x2="320" y2="450" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="5,5"/>
  <!-- Print area guide -->
  <rect x="140" y="150" width="120" height="140" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

export default function CanvasSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [shirtColor, setShirtColor] = useState("#000000");
  const [imageX, setImageX] = useState(50);
  const [imageY, setImageY] = useState(50);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { saveDesign } = useDesignHistory();

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
      toast.success("Imagem carregada!", { description: "Customize a posição e tamanho." });
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

  const handleDownload = async () => {
    if (!uploadedImage || !canvasRef.current) {
      toast.error("Nada para descarregar");
      return;
    }
    
    try {
      const link = document.createElement("a");
      link.href = canvasRef.current.toDataURL("image/png");
      link.download = `obsidian-custom-${Date.now()}.png`;
      link.click();
      toast.success("Descarregado!", { description: "Sua customização foi salva." });
    } catch (error) {
      toast.error("Erro ao descarregar");
    }
  };

  const handleShare = async () => {
    if (!uploadedImage) {
      toast.error("Nada para compartilhar");
      return;
    }

    const shareText = "Criei uma customização incrível na VANTA! 🎨";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Minha Customização VANTA",
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast.success("Link copiado!", { description: "Compartilhe com seus amigos." });
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImageX(50);
    setImageY(50);
    setImageScale(1);
    setImageRotation(0);
    setShirtColor("#000000");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Resetado", { description: "Comece uma nova customização." });
  };

  const handleSaveDesign = () => {
    if (!uploadedImage) {
      toast.error("Adicione uma imagem primeiro");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    if (!uploadedImage) return;
    
    const saved = saveDesign(
      saveName || `Design ${new Date().toLocaleDateString("pt-PT")}`,
      uploadedImage,
      shirtColor,
      imageX,
      imageY,
      imageScale,
      imageRotation
    );

    if (saved) {
      toast.success("Design salvo!", { description: saved.name });
      setShowSaveDialog(false);
      setSaveName("");
    }
  };

  const handleLoadDesign = (design: Design) => {
    setUploadedImage(design.imageData);
    setShirtColor(design.shirtColor);
    setImageX(design.imageX);
    setImageY(design.imageY);
    setImageScale(design.imageScale);
    setImageRotation(design.imageRotation);
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

  const printAreaStyle = (): React.CSSProperties => ({
    position: "absolute",
    left: `${imageX}%`,
    top: `${imageY}%`,
    transform: `translate(-50%, -50%) scale(${imageScale}) rotate(${imageRotation}deg)`,
    transformOrigin: "center",
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "2px",
  });

  return (
    <section id="canvas" className="py-24 lg:py-32 px-6 lg:px-8 overflow-hidden" style={{ background: "#0B0B0B" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className={`mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="section-divider mb-12" />
          <div className="max-w-2xl">
            <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Personalização</div>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] leading-tight text-[#EFEFEF] mb-4">
              YOUR CANVAS
            </h2>
            <p className="font-heading text-base font-light text-[rgba(239,239,239,0.6)] max-w-xl">
              Crie sua peça única. Upload da sua estampa, customize a posição, escala e rotação em tempo real. Salve seus designs para usar depois.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Upload & Controls */}
          <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "100ms" }}>
            {/* Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragOver
                  ? "border-white bg-[rgba(255,255,255,0.08)]"
                  : "border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)]"
              }`}
              style={{ borderRadius: "4px" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-[rgba(239,239,239,0.5)]" />
                <div>
                  <p className="font-heading font-semibold text-[#EFEFEF]">
                    {uploadedImage ? "Imagem carregada ✓" : "Arraste sua estampa aqui"}
                  </p>
                  <p className="font-heading text-xs text-[rgba(239,239,239,0.4)] mt-1">
                    PNG, JPG ou WebP • Máximo 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="font-heading font-semibold text-[#EFEFEF] block mb-3 flex items-center gap-2">
                <Palette size={16} />
                Cor da Peça
              </label>
              <div className="flex gap-2">
                {["#000000", "#FFFFFF", "#1a1a1a", "#333333"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setShirtColor(color)}
                    className={`w-12 h-12 border-2 transition-all ${
                      shirtColor === color
                        ? "border-white scale-110"
                        : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.5)]"
                    }`}
                    style={{ backgroundColor: color, borderRadius: "3px" }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="w-12 h-12 cursor-pointer"
                  style={{ borderRadius: "3px" }}
                />
              </div>
            </div>

            {/* Position Controls */}
            {uploadedImage && (
              <div className="space-y-4 p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]" style={{ borderRadius: "3px" }}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-heading text-sm font-semibold text-[#EFEFEF] flex items-center gap-2">
                      <Move size={14} />
                      Posição X
                    </label>
                    <span className="font-mono-label text-[rgba(239,239,239,0.4)]">{imageX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageX}
                    onChange={(e) => setImageX(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-heading text-sm font-semibold text-[#EFEFEF] flex items-center gap-2">
                      <Move size={14} />
                      Posição Y
                    </label>
                    <span className="font-mono-label text-[rgba(239,239,239,0.4)]">{imageY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imageY}
                    onChange={(e) => setImageY(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-heading text-sm font-semibold text-[#EFEFEF]">Escala</label>
                    <span className="font-mono-label text-[rgba(239,239,239,0.4)]">{(imageScale * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={imageScale}
                    onChange={(e) => setImageScale(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-heading text-sm font-semibold text-[#EFEFEF]">Rotação</label>
                    <span className="font-mono-label text-[rgba(239,239,239,0.4)]">{imageRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={imageRotation}
                    onChange={(e) => setImageRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!uploadedImage || isSubmitting}
                  className="btn-cta flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? "Enviando..." : "Encomendar Agora"}</span>
                </button>
                {uploadedImage && (
                  <>
                    <button
                      onClick={handleSaveDesign}
                      className="w-12 h-12 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
                      title="Salvar Design"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-12 h-12 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
                      title="Resetar"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Design History */}
              <DesignHistory onLoadDesign={handleLoadDesign} />
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#111111] border border-[rgba(255,255,255,0.15)] p-6 max-w-sm w-full" style={{ borderRadius: "4px" }}>
                  <h3 className="font-display text-xl text-[#EFEFEF] mb-4">Salvar Design</h3>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder={`Design ${new Date().toLocaleDateString("pt-PT")}`}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] px-3 py-2 text-[#EFEFEF] font-heading mb-4 focus:outline-none focus:border-[rgba(255,255,255,0.4)]"
                    style={{ borderRadius: "3px" }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmSave();
                      if (e.key === "Escape") setShowSaveDialog(false);
                    }}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="flex-1 py-2 border border-[rgba(255,255,255,0.15)] text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] font-heading text-sm transition-all"
                      style={{ borderRadius: "3px" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmSave}
                      className="flex-1 py-2 bg-[#FFFFFF] text-[#0B0B0B] font-heading text-sm transition-all hover:bg-[#F0F0F0]"
                      style={{ borderRadius: "3px" }}
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Mockup Preview */}
          <div className={`flex flex-col items-center gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
            {/* SVG Mockup */}
            <div className="w-full max-w-sm aspect-square relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]" style={{ borderRadius: "4px" }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* SVG Background */}
                  <div dangerouslySetInnerHTML={{ __html: getTshirtSVG(shirtColor) }} />

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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-heading text-center text-[rgba(239,239,239,0.25)] text-sm">
                        Sua estampa<br />aparecerá aqui
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hidden Canvas for Download */}
            <canvas ref={canvasRef} className="hidden" width={400} height={500} />

            {/* Preview Info */}
            <div className="w-full text-center">
              <p className="font-heading text-xs text-[rgba(239,239,239,0.4)]">
                Pré-visualização em tempo real
              </p>
            </div>

            {/* Download & Share Buttons */}
            {uploadedImage && (
              <div className="w-full flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 btn-outline py-3 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Descarregar</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 btn-outline py-3 flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  <span>Compartilhar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
