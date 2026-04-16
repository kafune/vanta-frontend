import { useRoute } from "wouter";
import { ChevronLeft, ShoppingCart, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";
import { toast } from "sonner";

interface ModelVariation {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image: string;
  description?: string;
}

// Mock data - múltiplas variações de cada tipo de roupa
const modelVariations: Record<string, ModelVariation[]> = {
  moleton: [
    {
      id: "moleton-1",
      name: "Moleton Premium Black",
      color: "Preto",
      size: "M",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce769?w=500&h=600&fit=crop",
      description: "Moleton premium com acabamento de luxo",
    },
    {
      id: "moleton-2",
      name: "Moleton Premium Gray",
      color: "Cinza",
      size: "M",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce769?w=500&h=600&fit=crop",
      description: "Moleton premium com acabamento de luxo",
    },
    {
      id: "moleton-3",
      name: "Moleton Premium Navy",
      color: "Azul Marinho",
      size: "M",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce769?w=500&h=600&fit=crop",
      description: "Moleton premium com acabamento de luxo",
    },
    {
      id: "moleton-4",
      name: "Moleton Premium White",
      color: "Branco",
      size: "M",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce769?w=500&h=600&fit=crop",
      description: "Moleton premium com acabamento de luxo",
    },
    {
      id: "moleton-5",
      name: "Moleton Premium Cream",
      color: "Creme",
      size: "M",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce769?w=500&h=600&fit=crop",
      description: "Moleton premium com acabamento de luxo",
    },
    {
      id: "moleton-6",
      name: "Moleton Premium Olive",
      color: "Oliva",
      size: "M",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1556821552-5ff63b1ce769?w=500&h=600&fit=crop",
      description: "Moleton premium com acabamento de luxo",
    },
  ],
  dryfit: [
    {
      id: "dryfit-1",
      name: "Performance Dry Fit Black",
      color: "Preto",
      size: "M",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Camiseta de performance com tecnologia dry fit",
    },
    {
      id: "dryfit-2",
      name: "Performance Dry Fit Navy",
      color: "Azul Marinho",
      size: "M",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Camiseta de performance com tecnologia dry fit",
    },
    {
      id: "dryfit-3",
      name: "Performance Dry Fit Gray",
      color: "Cinza",
      size: "M",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Camiseta de performance com tecnologia dry fit",
    },
    {
      id: "dryfit-4",
      name: "Performance Dry Fit White",
      color: "Branco",
      size: "M",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Camiseta de performance com tecnologia dry fit",
    },
    {
      id: "dryfit-5",
      name: "Performance Dry Fit Red",
      color: "Vermelho",
      size: "M",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Camiseta de performance com tecnologia dry fit",
    },
    {
      id: "dryfit-6",
      name: "Performance Dry Fit Green",
      color: "Verde",
      size: "M",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Camiseta de performance com tecnologia dry fit",
    },
  ],
  oversized: [
    {
      id: "oversized-1",
      name: "Oversized Tee Black",
      color: "Preto",
      size: "M",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3dd43?w=500&h=600&fit=crop",
      description: "Camiseta oversized com caimento urbano",
    },
    {
      id: "oversized-2",
      name: "Oversized Tee White",
      color: "Branco",
      size: "M",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3dd43?w=500&h=600&fit=crop",
      description: "Camiseta oversized com caimento urbano",
    },
    {
      id: "oversized-3",
      name: "Oversized Tee Beige",
      color: "Bege",
      size: "M",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3dd43?w=500&h=600&fit=crop",
      description: "Camiseta oversized com caimento urbano",
    },
    {
      id: "oversized-4",
      name: "Oversized Tee Brown",
      color: "Marrom",
      size: "M",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3dd43?w=500&h=600&fit=crop",
      description: "Camiseta oversized com caimento urbano",
    },
    {
      id: "oversized-5",
      name: "Oversized Tee Gray",
      color: "Cinza",
      size: "M",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3dd43?w=500&h=600&fit=crop",
      description: "Camiseta oversized com caimento urbano",
    },
    {
      id: "oversized-6",
      name: "Oversized Tee Charcoal",
      color: "Carvão",
      size: "M",
      price: 69.99,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3dd43?w=500&h=600&fit=crop",
      description: "Camiseta oversized com caimento urbano",
    },
  ],
  algodao: [
    {
      id: "algodao-1",
      name: "Premium Cotton Black",
      color: "Preto",
      size: "M",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Algodão premium com textura e conforto",
    },
    {
      id: "algodao-2",
      name: "Premium Cotton White",
      color: "Branco",
      size: "M",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Algodão premium com textura e conforto",
    },
    {
      id: "algodao-3",
      name: "Premium Cotton Navy",
      color: "Azul Marinho",
      size: "M",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Algodão premium com textura e conforto",
    },
    {
      id: "algodao-4",
      name: "Premium Cotton Cream",
      color: "Creme",
      size: "M",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Algodão premium com textura e conforto",
    },
    {
      id: "algodao-5",
      name: "Premium Cotton Sage",
      color: "Sálvia",
      size: "M",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Algodão premium com textura e conforto",
    },
    {
      id: "algodao-6",
      name: "Premium Cotton Taupe",
      color: "Taupo",
      size: "M",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      description: "Algodão premium com textura e conforto",
    },
  ],
};

const categoryTitles: Record<string, string> = {
  moleton: "Essential Hoodies",
  dryfit: "Performance Dry Fit",
  oversized: "Oversized",
  algodao: "Algodão Premium",
};

export default function ModelDetails() {
  const [, params] = useRoute("/modelo/:id");
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const modelId = params?.id || "moleton";
  const variations = modelVariations[modelId] || modelVariations.moleton;
  const categoryTitle = categoryTitles[modelId] || "Coleção";

  const handleAddToCart = (variation: ModelVariation) => {
    addItem({
      id: variation.id,
      name: variation.name,
      price: variation.price,
      quantity: 1,
      image: variation.image,
      size: variation.size,
      color: variation.color,
    });
    toast.success("Adicionado ao carrinho!", {
      description: `${variation.name} - ${variation.color}`,
    });
  };

  const handleToggleFavorite = (variation: ModelVariation) => {
    toggleFavorite({
      id: variation.id,
      name: variation.name,
      color: variation.color,
      price: variation.price,
      image: variation.image,
      category: modelId,
      addedAt: new Date().toISOString(),
    });
    const isFav = isFavorite(variation.id);
    toast.success(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos!");
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors mb-8"
          >
            <ChevronLeft size={20} />
            <span className="font-heading text-sm">Voltar</span>
          </button>

          <div className="mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-[#EFEFEF] mb-4">
              {categoryTitle}
            </h1>
            <p className="text-[rgba(239,239,239,0.6)] text-lg max-w-2xl">
              Explore nossa coleção completa de {categoryTitle.toLowerCase()} com múltiplas cores e tamanhos.
            </p>
          </div>
        </div>
      </section>

      {/* Grid de Produtos */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="group cursor-pointer"
              >
                {/* Imagem */}
                <div className="relative mb-4 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.05)]">
                  <img
                    src={variation.image}
                    alt={variation.name}
                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Botões de ação */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-between p-4">
                    <button
                      onClick={() => handleAddToCart(variation)}
                      className="flex items-center gap-2 bg-[#EFEFEF] text-[#0B0B0B] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ShoppingCart size={16} />
                      Adicionar
                    </button>

                    <button
                      onClick={() => handleToggleFavorite(variation)}
                      className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transition-opacity ${
                        isFavorite(variation.id)
                          ? "bg-red-500 text-white"
                          : "bg-[rgba(239,239,239,0.1)] text-[#EFEFEF] hover:bg-[rgba(239,239,239,0.2)]"
                      }`}
                    >
                      <Heart size={18} fill={isFavorite(variation.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-[#EFEFEF] font-semibold text-base mb-1">
                    {variation.name}
                  </h3>
                  <p className="text-[rgba(239,239,239,0.5)] text-sm mb-2">
                    {variation.color} • {variation.size}
                  </p>
                  <p className="text-[#EFEFEF] font-heading text-lg">
                    €{variation.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
