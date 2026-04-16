/**
 * OBSIDIAN Size Selector — Carbon Fiber Design System
 * Size selection with measurement guide modal and fit information
 */

import { useState } from "react";
import { Ruler, X, Info } from "lucide-react";
import { toast } from "sonner";

interface SizeSelectorProps {
  sizes: string[];
  onSizeSelect: (size: string) => void;
  selectedSize: string | null;
}

// Measurement guide data (in cm)
const measurementGuide = {
  P: { chest: "84-92", length: "68", sleeve: "19", weight: "280g" },
  M: { chest: "92-100", length: "71", sleeve: "20", weight: "280g" },
  G: { chest: "100-108", length: "74", sleeve: "21", weight: "280g" },
  GG: { chest: "108-116", length: "77", sleeve: "22", weight: "280g" },
  XGG: { chest: "116-124", length: "80", sleeve: "23", weight: "280g" },
};

const sizeDescriptions = {
  P: "Ajustado. Ideal para corpos mais compactos.",
  M: "Regular. O fit clássico OBSIDIAN.",
  G: "Confortável. Espaço generoso no peito.",
  GG: "Relaxado. Caimento amplo e arejado.",
  XGG: "Oversized. Máximo conforto e volume.",
};

export default function SizeSelector({ sizes, onSizeSelect, selectedSize }: SizeSelectorProps) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="font-heading font-semibold text-[#EFEFEF]">Tamanho</label>
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 font-heading text-xs font-medium text-[rgba(239,239,239,0.5)] hover:text-[rgba(239,239,239,0.8)] transition-colors"
          >
            <Ruler size={14} />
            Guia de Medidas
          </button>
        </div>

        {/* Size buttons */}
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                onSizeSelect(size);
                toast.success(`Tamanho ${size} selecionado`);
              }}
              className={`py-3 px-2 border-2 font-heading font-semibold text-sm transition-all duration-200 ${
                selectedSize === size
                  ? "border-white bg-[rgba(255,255,255,0.08)] text-white"
                  : "border-[rgba(255,255,255,0.12)] text-[rgba(239,239,239,0.6)] hover:border-[rgba(255,255,255,0.4)] hover:text-[rgba(239,239,239,0.9)]"
              }`}
              style={{ borderRadius: "3px" }}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Size description */}
        {selectedSize && (
          <div className="mt-4 p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]" style={{ borderRadius: "3px" }}>
            <p className="font-heading text-xs text-[rgba(239,239,239,0.5)]">
              {sizeDescriptions[selectedSize as keyof typeof sizeDescriptions]}
            </p>
          </div>
        )}
      </div>

      {/* Measurement Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(11,11,11,0.95)] backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ borderRadius: "4px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(11,11,11,0.8)] backdrop-blur-sm">
              <h2 className="font-display text-2xl text-[#EFEFEF]">GUIA DE MEDIDAS</h2>
              <button
                onClick={() => setShowGuide(false)}
                className="text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Info box */}
              <div className="flex gap-3 p-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]" style={{ borderRadius: "3px" }}>
                <Info size={16} className="text-[rgba(239,239,239,0.5)] flex-shrink-0 mt-0.5" />
                <p className="font-heading text-sm text-[rgba(239,239,239,0.5)]">
                  Todas as medidas são em <strong>centímetros</strong>. Para o melhor ajuste, meça uma peça que já usa e compare com a tabela abaixo.
                </p>
              </div>

              {/* Measurement table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.1)]">
                      <th className="text-left py-3 px-3 font-heading font-semibold text-[#EFEFEF]">Tamanho</th>
                      <th className="text-left py-3 px-3 font-heading font-semibold text-[#EFEFEF]">Peito (cm)</th>
                      <th className="text-left py-3 px-3 font-heading font-semibold text-[#EFEFEF]">Comprimento (cm)</th>
                      <th className="text-left py-3 px-3 font-heading font-semibold text-[#EFEFEF]">Manga (cm)</th>
                      <th className="text-left py-3 px-3 font-heading font-semibold text-[#EFEFEF]">Peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(measurementGuide).map(([size, measurements]) => (
                      <tr key={size} className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="py-3 px-3 font-heading font-semibold text-[#EFEFEF]">{size}</td>
                        <td className="py-3 px-3 font-heading text-[rgba(239,239,239,0.6)]">{measurements.chest}</td>
                        <td className="py-3 px-3 font-heading text-[rgba(239,239,239,0.6)]">{measurements.length}</td>
                        <td className="py-3 px-3 font-heading text-[rgba(239,239,239,0.6)]">{measurements.sleeve}</td>
                        <td className="py-3 px-3 font-mono-label text-[rgba(239,239,239,0.4)] text-[0.65rem]">{measurements.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Diagram */}
              <div>
                <h3 className="font-heading font-semibold text-[#EFEFEF] mb-4">Como Medir</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                      1
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-[rgba(239,239,239,0.8)]">Peito</p>
                      <p className="font-heading text-xs text-[rgba(239,239,239,0.4)]">
                        Meça horizontalmente ao redor da parte mais larga do peito, mantendo a fita métrica paralela ao chão.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                      2
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-[rgba(239,239,239,0.8)]">Comprimento</p>
                      <p className="font-heading text-xs text-[rgba(239,239,239,0.4)]">
                        Meça do ombro até a barra inferior, seguindo a linha central da peça.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0 font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                      3
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-[rgba(239,239,239,0.8)]">Manga</p>
                      <p className="font-heading text-xs text-[rgba(239,239,239,0.4)]">
                        Meça do ponto do ombro até o final da manga, com o braço ligeiramente dobrado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowGuide(false)}
                className="w-full btn-cta py-3"
              >
                <span>Fechar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
