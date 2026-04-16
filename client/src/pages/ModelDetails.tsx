/**
 * VANTA Model Details Page
 * Display different variations of a specific model
 */

import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { ChevronLeft, ShoppingBag, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface ModelVariation {
  id: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  image?: string;
  inStock: boolean;
}

interface ModelData {
  id: string;
  name: string;
  category: string;
  description: string;
  variations: ModelVariation[];
}

const modelDatabase: Record<string, ModelData> = {
  "hoodie-1": {
    id: "hoodie-1",
    name: "Classic Hoodie",
    category: "Essential Hoodies",
    description: "Moleton clássico com acabamento premium, perfeito para qualquer ocasião.",
    variations: [
      { id: "v1", color: "Preto", colorCode: "#0B0B0B", size: "P", price: 189, inStock: true },
      { id: "v2", color: "Preto", colorCode: "#0B0B0B", size: "M", price: 189, inStock: true },
      { id: "v3", color: "Preto", colorCode: "#0B0B0B", size: "G", price: 189, inStock: true },
      { id: "v4", color: "Branco", colorCode: "#FFFFFF", size: "P", price: 189, inStock: true },
      { id: "v5", color: "Branco", colorCode: "#FFFFFF", size: "M", price: 189, inStock: true },
      { id: "v6", color: "Branco", colorCode: "#FFFFFF", size: "G", price: 189, inStock: false },
      { id: "v7", color: "Cinza", colorCode: "#808080", size: "P", price: 189, inStock: true },
      { id: "v8", color: "Cinza", colorCode: "#808080", size: "M", price: 189, inStock: true },
      { id: "v9", color: "Cinza", colorCode: "#808080", size: "G", price: 189, inStock: true },
    ],
  },
  "hoodie-2": {
    id: "hoodie-2",
    name: "Oversized Hoodie",
    category: "Essential Hoodies",
    description: "Moleton oversized com caimento largo e confortável, ideal para um look urbano.",
    variations: [
      { id: "v1", color: "Preto", colorCode: "#0B0B0B", size: "P", price: 199, inStock: true },
      { id: "v2", color: "Preto", colorCode: "#0B0B0B", size: "M", price: 199, inStock: true },
      { id: "v3", color: "Preto", colorCode: "#0B0B0B", size: "G", price: 199, inStock: true },
      { id: "v4", color: "Branco", colorCode: "#FFFFFF", size: "P", price: 199, inStock: true },
      { id: "v5", color: "Branco", colorCode: "#FFFFFF", size: "M", price: 199, inStock: true },
      { id: "v6", color: "Branco", colorCode: "#FFFFFF", size: "G", price: 199, inStock: true },
    ],
  },
  "dryfit-1": {
    id: "dryfit-1",
    name: "Sport Tee",
    category: "Performance Dry Fit",
    description: "Camiseta de performance com tecnologia de secagem rápida.",
    variations: [
      { id: "v1", color: "Preto", colorCode: "#0B0B0B", size: "P", price: 99, inStock: true },
      { id: "v2", color: "Preto", colorCode: "#0B0B0B", size: "M", price: 99, inStock: true },
      { id: "v3", color: "Preto", colorCode: "#0B0B0B", size: "G", price: 99, inStock: true },
      { id: "v4", color: "Branco", colorCode: "#FFFFFF", size: "P", price: 99, inStock: true },
      { id: "v5", color: "Branco", colorCode: "#FFFFFF", size: "M", price: 99, inStock: true },
      { id: "v6", color: "Verde", colorCode: "#22C55E", size: "P", price: 99, inStock: true },
      { id: "v7", color: "Verde", colorCode: "#22C55E", size: "M", price: 99, inStock: true },
    ],
  },
  "oversized-1": {
    id: "oversized-1",
    name: "Oversized Tee",
    category: "Oversized",
    description: "Camiseta oversized com silhueta urbana e caimento largo.",
    variations: [
      { id: "v1", color: "Preto", colorCode: "#0B0B0B", size: "P", price: 109, inStock: true },
      { id: "v2", color: "Preto", colorCode: "#0B0B0B", size: "M", price: 109, inStock: true },
      { id: "v3", color: "Preto", colorCode: "#0B0B0B", size: "G", price: 109, inStock: true },
      { id: "v4", color: "Branco", colorCode: "#FFFFFF", size: "P", price: 109, inStock: true },
      { id: "v5", color: "Branco", colorCode: "#FFFFFF", size: "M", price: 109, inStock: true },
      { id: "v6", color: "Bege", colorCode: "#D4A574", size: "P", price: 109, inStock: true },
      { id: "v7", color: "Bege", colorCode: "#D4A574", size: "M", price: 109, inStock: true },
    ],
  },
  "cotton-1": {
    id: "cotton-1",
    name: "Premium Cotton Tee",
    category: "Algodão Premium",
    description: "Camiseta 100% algodão premium com textura incomparável.",
    variations: [
      { id: "v1", color: "Preto", colorCode: "#0B0B0B", size: "P", price: 89, inStock: true },
      { id: "v2", color: "Preto", colorCode: "#0B0B0B", size: "M", price: 89, inStock: true },
      { id: "v3", color: "Preto", colorCode: "#0B0B0B", size: "G", price: 89, inStock: true },
      { id: "v4", color: "Branco", colorCode: "#FFFFFF", size: "P", price: 89, inStock: true },
      { id: "v5", color: "Branco", colorCode: "#FFFFFF", size: "M", price: 89, inStock: true },
      { id: "v6", color: "Cáqui", colorCode: "#A0826D", size: "P", price: 89, inStock: true },
      { id: "v7", color: "Cáqui", colorCode: "#A0826D", size: "M", price: 89, inStock: true },
    ],
  },
};

export default function ModelDetails() {
  const [, params] = useRoute("/modelo/:id");
  const [, setLocation] = useLocation();
  const modelId = params?.id;
  const [model, setModel] = useState<ModelData | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ModelVariation | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (modelId && modelDatabase[modelId]) {
      const data = modelDatabase[modelId];
      setModel(data);
      setSelectedVariation(data.variations[0]);
    } else {
      setLocation("/");
    }
  }, [modelId, setLocation]);

  const handleAddToCart = () => {
    if (selectedVariation) {
      addItem({
        id: selectedVariation.id,
        name: model?.name || "Produto",
        price: selectedVariation.price,
        quantity: 1,
        image: selectedVariation.image || "",
        size: selectedVariation.size,
        color: selectedVariation.color,
      });
      toast.success("Adicionado ao carrinho!", {
        description: `${model?.name} - ${selectedVariation.color} (${selectedVariation.size})`,
      });
    }
  };

  if (!model || !selectedVariation) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <p className="text-[rgba(239,239,239,0.5)]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]" style={{ background: "#0B0B0B" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0B0B0B] border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-heading text-sm">Voltar</span>
          </button>
          <h1 className="font-display text-2xl text-[#EFEFEF]">{model.name}</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg p-8 mb-6 aspect-square flex items-center justify-center">
              {selectedVariation.image ? (
                <img
                  src={selectedVariation.image}
                  alt={model.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-4"
                    style={{ backgroundColor: selectedVariation.colorCode }}
                  />
                  <p className="text-[rgba(239,239,239,0.4)] text-sm">Imagem não disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div className="mb-6">
              <p className="text-[rgba(239,239,239,0.5)] text-sm mb-2">{model.category}</p>
              <h2 className="font-display text-4xl text-[#EFEFEF] mb-4">{model.name}</h2>
              <p className="text-[rgba(239,239,239,0.6)] text-lg mb-6">{model.description}</p>
              <div className="text-3xl font-heading text-[#EFEFEF] mb-6">
                R$ {selectedVariation.price.toFixed(2)}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="font-heading text-sm text-[rgba(239,239,239,0.6)] mb-4">
                Cores Disponíveis
              </h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(model.variations.map((v) => v.color))).map((color) => {
                  const colorVariation = model.variations.find((v) => v.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        const newVariation = model.variations.find(
                          (v) => v.color === color && v.size === selectedVariation.size
                        );
                        if (newVariation) setSelectedVariation(newVariation);
                      }}
                      className={`px-4 py-2 rounded-full font-heading text-xs font-semibold transition-all ${
                        selectedVariation.color === color
                          ? "bg-[#EFEFEF] text-[#0B0B0B]"
                          : "bg-[rgba(255,255,255,0.08)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.12)]"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="font-heading text-sm text-[rgba(239,239,239,0.6)] mb-4">
                Tamanho
              </h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(model.variations.map((v) => v.size))).map((size) => {
                  const sizeVariation = model.variations.find(
                    (v) => v.size === size && v.color === selectedVariation.color
                  );
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (sizeVariation) setSelectedVariation(sizeVariation);
                      }}
                      disabled={!sizeVariation?.inStock}
                      className={`px-4 py-2 rounded-full font-heading text-xs font-semibold transition-all ${
                        selectedVariation.size === size
                          ? "bg-[#EFEFEF] text-[#0B0B0B]"
                          : "bg-[rgba(255,255,255,0.08)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {!selectedVariation.inStock && (
                <p className="text-red-500 text-xs mt-2">Fora de estoque</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariation.inStock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#EFEFEF] text-[#0B0B0B] hover:bg-[#F0F0F0] disabled:opacity-50 font-heading text-sm font-semibold rounded transition-all"
              >
                <ShoppingBag size={18} />
                Adicionar ao Carrinho
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="px-6 py-3 bg-[rgba(255,255,255,0.08)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.12)] font-heading text-sm font-semibold rounded transition-all"
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* All Variations Grid */}
        <div className="mt-16">
          <h3 className="font-display text-2xl text-[#EFEFEF] mb-8">Todas as Variações</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {model.variations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => setSelectedVariation(variation)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedVariation.id === variation.id
                    ? "border-[#EFEFEF] bg-[rgba(255,255,255,0.08)]"
                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]"
                }`}
                disabled={!variation.inStock}
              >
                <div className="mb-2">
                  <div
                    className="w-full aspect-square rounded mb-2"
                    style={{ backgroundColor: variation.colorCode }}
                  />
                </div>
                <p className="text-xs text-[rgba(239,239,239,0.6)] mb-1">{variation.color}</p>
                <p className="text-xs font-heading text-[#EFEFEF]">{variation.size}</p>
                {!variation.inStock && (
                  <p className="text-[0.65rem] text-red-500 mt-1">Fora de estoque</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
