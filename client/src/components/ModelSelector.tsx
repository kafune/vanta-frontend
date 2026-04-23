/**
 * Model Selector Component
 * Allows users to choose different clothing models for customization
 */

import { Shirt, Layers } from "lucide-react";

export type ClothingModel = 
  | "regular-shirt"
  | "oversized-shirt"
  | "regular-hoodie"
  | "oversized-hoodie"
  | "sweatshirt"
  | "tank-top"
  | "long-sleeve";

export interface ModelOption {
  id: ClothingModel;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "shirts" | "hoodies" | "other";
}

export const CLOTHING_MODELS: ModelOption[] = [
  {
    id: "regular-shirt",
    label: "Camiseta Regular",
    description: "Fit clássico e confortável",
    icon: <Shirt className="w-5 h-5" />,
    category: "shirts",
  },
  {
    id: "oversized-shirt",
    label: "Camiseta Oversized",
    description: "Fit largo e descontraído",
    icon: <Shirt className="w-5 h-5" />,
    category: "shirts",
  },
  {
    id: "long-sleeve",
    label: "Manga Comprida",
    description: "Conforto com cobertura extra",
    icon: <Shirt className="w-5 h-5" />,
    category: "shirts",
  },
  {
    id: "tank-top",
    label: "Regata",
    description: "Leve e minimalista",
    icon: <Shirt className="w-5 h-5" />,
    category: "shirts",
  },
  {
    id: "regular-hoodie",
    label: "Moletom Regular",
    description: "Quente e aconchegante",
    icon: <Layers className="w-5 h-5" />,
    category: "hoodies",
  },
  {
    id: "oversized-hoodie",
    label: "Moletom Oversized",
    description: "Fit largo e relaxado",
    icon: <Layers className="w-5 h-5" />,
    category: "hoodies",
  },
  {
    id: "sweatshirt",
    label: "Sweatshirt",
    description: "Elegante e versátil",
    icon: <Shirt className="w-5 h-5" />,
    category: "other",
  },
];

interface ModelSelectorProps {
  selectedModel: ClothingModel;
  onModelChange: (model: ClothingModel) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-sm font-semibold text-[#EFEFEF] mb-3">
          Escolha o Modelo
        </h3>
        <p className="text-xs text-[rgba(239,239,239,0.5)] mb-4">
          Selecione o tipo de peça que deseja personalizar
        </p>
      </div>

      {/* Shirts Section */}
      <div>
        <h4 className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.4)] uppercase mb-2">
          Camisetas
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {CLOTHING_MODELS.filter((m) => m.category === "shirts").map(
            (model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  selectedModel === model.id
                    ? "border-white bg-[rgba(255,255,255,0.1)] text-white"
                    : "border-[rgba(239,239,239,0.2)] text-[rgba(239,239,239,0.7)] hover:border-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.9)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {model.icon}
                  <span className="text-xs font-medium">{model.label}</span>
                </div>
                <p className="text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                  {model.description}
                </p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Hoodies Section */}
      <div>
        <h4 className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.4)] uppercase mb-2">
          Moletom
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {CLOTHING_MODELS.filter((m) => m.category === "hoodies").map(
            (model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  selectedModel === model.id
                    ? "border-white bg-[rgba(255,255,255,0.1)] text-white"
                    : "border-[rgba(239,239,239,0.2)] text-[rgba(239,239,239,0.7)] hover:border-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.9)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {model.icon}
                  <span className="text-xs font-medium">{model.label}</span>
                </div>
                <p className="text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                  {model.description}
                </p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Other Section */}
      <div>
        <h4 className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.4)] uppercase mb-2">
          Outros
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {CLOTHING_MODELS.filter((m) => m.category === "other").map(
            (model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  selectedModel === model.id
                    ? "border-white bg-[rgba(255,255,255,0.1)] text-white"
                    : "border-[rgba(239,239,239,0.2)] text-[rgba(239,239,239,0.7)] hover:border-[rgba(239,239,239,0.4)] hover:text-[rgba(239,239,239,0.9)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {model.icon}
                  <span className="text-xs font-medium">{model.label}</span>
                </div>
                <p className="text-[0.65rem] text-[rgba(239,239,239,0.5)]">
                  {model.description}
                </p>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
