/**
 * OBSIDIAN Category Products Page
 * Display products by category with color filters and image upload
 */

import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { ChevronLeft, Upload, X, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ProductModel {
  id: string;
  name: string;
  color: string;
  colorCode: string;
  image?: string;
}

interface CategoryData {
  name: string;
  description: string;
  colors: string[];
  models: ProductModel[];
}

const categoryData: Record<string, CategoryData> = {
  moleton: {
    name: "Essential Hoodies",
    description: "Moletons de luxo com volume e acabamento premium",
    colors: ["Preto", "Branco", "Cinza", "Azul Marinho", "Bordeaux"],
    models: [
      { id: "hoodie-1", name: "Classic Hoodie", color: "Preto", colorCode: "#0B0B0B" },
      { id: "hoodie-2", name: "Oversized Hoodie", color: "Branco", colorCode: "#FFFFFF" },
      { id: "hoodie-3", name: "Cropped Hoodie", color: "Cinza", colorCode: "#808080" },
    ],
  },
  dryfit: {
    name: "Performance Dry Fit",
    description: "Camisetas de performance com tecnologia de secagem rápida",
    colors: ["Preto", "Branco", "Cinza", "Verde", "Vermelho"],
    models: [
      { id: "dryfit-1", name: "Sport Tee", color: "Preto", colorCode: "#0B0B0B" },
      { id: "dryfit-2", name: "Training Shirt", color: "Branco", colorCode: "#FFFFFF" },
      { id: "dryfit-3", name: "Athletic Tank", color: "Cinza", colorCode: "#808080" },
    ],
  },
  oversized: {
    name: "Oversized",
    description: "Silhueta urbana com caimento largo e confortável",
    colors: ["Preto", "Branco", "Bege", "Cáqui", "Cinza"],
    models: [
      { id: "oversized-1", name: "Oversized Tee", color: "Preto", colorCode: "#0B0B0B" },
      { id: "oversized-2", name: "Baggy Fit", color: "Branco", colorCode: "#FFFFFF" },
      { id: "oversized-3", name: "Relaxed Fit", color: "Bege", colorCode: "#D4A574" },
    ],
  },
  algodao: {
    name: "Algodão Premium",
    description: "100% algodão premium com foco em textura e conforto",
    colors: ["Preto", "Branco", "Cáqui", "Azul", "Marrom"],
    models: [
      { id: "cotton-1", name: "Premium Cotton Tee", color: "Preto", colorCode: "#0B0B0B" },
      { id: "cotton-2", name: "Classic Cotton", color: "Branco", colorCode: "#FFFFFF" },
      { id: "cotton-3", name: "Cotton Comfort", color: "Cáqui", colorCode: "#D4A574" },
    ],
  },
};

export default function CategoryProducts() {
  const [, params] = useRoute("/categoria/:category");
  const [, setLocation] = useLocation();
  const category = params?.category?.toLowerCase();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<CategoryData | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (category && categoryData[category]) {
      const data = categoryData[category];
      setCategoryInfo(data);
      setModels(data.models);
      setSelectedColor(data.colors[0]);
    } else {
      setLocation("/");
    }
  }, [category, setLocation]);

  const filteredModels = selectedColor
    ? models.filter((m) => m.color === selectedColor)
    : models;

  const handleImageUpload = (modelId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, image: imageData } : m))
      );
      toast.success("Imagem carregada com sucesso!");
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[rgba(239,239,239,0.5)]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]" style={{ background: "#0B0B0B" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0B0B0B] border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-heading text-sm">Voltar</span>
          </button>
          <h1 className="font-display text-2xl text-[#EFEFEF]">{categoryInfo.name}</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Description */}
        <p className="text-[rgba(239,239,239,0.5)] text-center mb-12 max-w-2xl mx-auto">
          {categoryInfo.description}
        </p>

        {/* Color Filter */}
        <div className="mb-12">
          <h2 className="font-heading text-sm text-[rgba(239,239,239,0.6)] mb-4">
            Filtrar por Cor
          </h2>
          <div className="flex flex-wrap gap-3">
            {categoryInfo.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-full font-heading text-xs font-semibold transition-all ${
                  selectedColor === color
                    ? "bg-[#EFEFEF] text-[#0B0B0B]"
                    : "bg-[rgba(255,255,255,0.08)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.12)]"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <ProductCard
              key={model.id}
              model={model}
              onImageUpload={(file) => handleImageUpload(model.id, file)}
              isUploading={uploadingId === model.id}
              onUploadStart={() => setUploadingId(model.id)}
            />
          ))}
        </div>

        {/* Add New Model Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              const newModel: ProductModel = {
                id: `${category}-${Date.now()}`,
                name: "Novo Modelo",
                color: selectedColor || categoryInfo.colors[0],
                colorCode: "#808080",
              };
              setModels([...models, newModel]);
              toast.success("Novo modelo adicionado!");
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.12)] transition-all rounded-full font-heading text-sm"
          >
            <Plus size={16} />
            Adicionar Novo Modelo
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  model: ProductModel;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
  onUploadStart: () => void;
}

function ProductCard({ model, onImageUpload, isUploading, onUploadStart }: ProductCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all p-6"
      style={{ borderRadius: "4px" }}
    >
      {/* Image Preview */}
      <div
        className="w-full aspect-square bg-[rgba(255,255,255,0.05)] border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-all relative overflow-hidden group"
        onClick={() => fileInputRef.current?.click()}
      >
        {model.image ? (
          <>
            <img
              src={model.image}
              alt={model.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <Upload size={24} className="text-[#EFEFEF] mx-auto mb-2" />
                <p className="text-[#EFEFEF] text-xs font-heading">Trocar Imagem</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Upload size={32} className="text-[rgba(239,239,239,0.3)] mx-auto mb-2" />
            <p className="text-[rgba(239,239,239,0.4)] text-xs font-heading">
              Clique para carregar imagem
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUploadStart();
              onImageUpload(file);
            }
          }}
          className="hidden"
        />
      </div>

      {/* Model Info */}
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-[#EFEFEF] mb-1">
          {model.name}
        </h3>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-[rgba(255,255,255,0.2)]"
            style={{ backgroundColor: model.colorCode }}
          />
          <p className="text-[rgba(239,239,239,0.5)] text-xs font-mono-label">
            {model.color}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 px-3 py-2 bg-[#EFEFEF] text-[#0B0B0B] hover:bg-[#F0F0F0] disabled:opacity-50 font-heading text-xs font-semibold rounded transition-all"
        >
          {isUploading ? "Carregando..." : "Upload"}
        </button>
        <button
          onClick={() => {
            // TODO: Add to cart or view details
          }}
          className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.08)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.12)] font-heading text-xs font-semibold rounded transition-all"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}
