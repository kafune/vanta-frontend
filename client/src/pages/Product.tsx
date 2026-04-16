/**
 * OBSIDIAN Product Page — Carbon Fiber Design System
 * Detailed product page with gallery, size selector, and specifications
 */

import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart, Share2, Truck, RotateCcw, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import SizeSelector from "@/components/SizeSelector";

// Product data
const products: Record<string, any> = {
  "essential-tee-280g": {
    id: "essential-tee-280g",
    name: "Essential Tee 280g",
    category: "Algodão Premium",
    price: 89,
    originalPrice: null,
    rating: 4.9,
    reviews: 127,
    description: "A camiseta perfeita. Feita com 100% algodão penteado de gramatura superior (280g/m²), oferece conforto absoluto e durabilidade excepcional. Pré-encolhida e com costuras reforçadas.",
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-cotton-6C3ChDmVfT5oxo4PDhFrbf.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/product-detail-1-FGrzrLBX82KeThKTTGH6am.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/product-detail-2-aWGKvfCZk8dbv7JukEyuwe.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/product-detail-3-UZb5s66z8ayiNCaGFkKok4.webp",
    ],
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto"],
    composition: "100% Algodão Penteado",
    care: "Lavar em água fria. Secar na sombra. Não usar alvejante.",
    features: [
      { icon: "🧵", title: "Algodão Premium", description: "280g/m² de gramatura superior" },
      { icon: "✓", title: "Pré-encolhido", description: "Mantém o tamanho após lavagens" },
      { icon: "💪", title: "Costuras Reforçadas", description: "Durabilidade garantida" },
      { icon: "🌍", title: "Sustentável", description: "Produção responsável" },
    ],
    inStock: true,
  },
  "urban-oversized": {
    id: "urban-oversized",
    name: "Urban Oversized",
    category: "Oversized",
    price: 109,
    originalPrice: null,
    rating: 4.8,
    reviews: 89,
    description: "Silhueta urbana com caimento largo e elegante. Drop shoulder e barra alongada para o fit oversized perfeito. Ideal para quem busca conforto sem abrir mão do estilo.",
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-oversized-fkaeTb24PqHL7RPsvGjmFY.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/product-detail-2-aWGKvfCZk8dbv7JukEyuwe.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/product-detail-1-FGrzrLBX82KeThKTTGH6am.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/product-detail-3-UZb5s66z8ayiNCaGFkKok4.webp",
    ],
    sizes: ["P", "M", "G", "GG", "XGG"],
    colors: ["Preto"],
    composition: "100% Algodão",
    care: "Lavar em água fria. Secar na sombra.",
    features: [
      { icon: "📐", title: "Drop Shoulder", description: "Ombro caído para fit relaxado" },
      { icon: "📏", title: "Barra Alongada", description: "Comprimento extra para cobertura" },
      { icon: "🎨", title: "Versátil", description: "Combina com qualquer estilo" },
      { icon: "⚡", title: "Confortável", description: "Máxima liberdade de movimento" },
    ],
    inStock: true,
  },
};

export default function Product() {
  const [, params] = useRoute("/produto/:id");
  const [, setLocation] = useLocation();
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const productId = params?.id as string;
  const product = products[productId];

  useEffect(() => {
    if (!product) {
      setLocation("/404");
    }
  }, [product, setLocation]);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho", { description: "É necessário escolher um tamanho para adicionar ao carrinho." });
      return;
    }
    toast.success(`${product.name} adicionado!`, {
      description: `Tamanho ${selectedSize} × ${quantity} unidade(s) - R$ ${(product.price * quantity).toFixed(2)}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      toast.success("Link copiado!", { description: "Compartilhe com seus amigos." });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-32 pb-6 px-6 lg:px-8 border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 font-heading text-xs text-[rgba(239,239,239,0.5)] hover:text-[rgba(239,239,239,0.8)] transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
          <span className="text-[rgba(239,239,239,0.25)]">/</span>
          <span className="font-mono-label text-[rgba(239,239,239,0.4)]">{product.category}</span>
          <span className="text-[rgba(239,239,239,0.25)]">/</span>
          <span className="font-heading text-xs text-[rgba(239,239,239,0.6)]">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 lg:py-16 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-2">{product.category}</div>
              <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating) ? "text-[#EFEFEF]" : "text-[rgba(239,239,239,0.2)]"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-heading font-semibold text-[#EFEFEF]">{product.rating}</span>
                <span className="font-mono-label text-[rgba(239,239,239,0.3)] text-[0.65rem]">({product.reviews} avaliações)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl text-[#EFEFEF]">R$ {product.price}</span>
                {product.originalPrice && (
                  <span className="font-heading text-lg text-[rgba(239,239,239,0.35)] line-through">
                    R$ {product.originalPrice}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-4">
                <span className={`font-heading text-xs font-semibold tracking-widest uppercase ${product.inStock ? "text-[rgba(100,200,100,0.8)]" : "text-[rgba(200,100,100,0.8)]"}`}>
                  {product.inStock ? "✓ Em Estoque" : "Fora de Estoque"}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="font-heading text-base font-light text-[rgba(239,239,239,0.6)] leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <SizeSelector sizes={product.sizes} onSizeSelect={setSelectedSize} selectedSize={selectedSize} />

            {/* Quantity */}
            <div>
              <label className="font-heading font-semibold text-[#EFEFEF] block mb-3">Quantidade</label>
              <div className="flex items-center gap-3 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 h-10 text-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] font-heading focus:outline-none focus:border-[rgba(255,255,255,0.4)]"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-4">
              <button onClick={handleAddToCart} className="btn-cta flex-1 py-3.5">
                <span>Adicionar ao Carrinho</span>
              </button>
              <button
                onClick={() => { setLiked(!liked); toast(liked ? "Removido dos favoritos" : "Adicionado aos favoritos"); }}
                className="w-12 h-12 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
              >
                <Heart size={18} className={liked ? "fill-white text-white" : ""} />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Benefits */}
            <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              {[
                { icon: Truck, text: "Entrega express em 48h" },
                { icon: RotateCcw, text: "Devoluções grátis em 30 dias" },
                { icon: Shield, text: "Garantia de qualidade" },
              ].map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon size={16} className="text-[rgba(239,239,239,0.5)]" />
                    <span className="font-heading text-sm text-[rgba(239,239,239,0.5)]">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="max-w-[1400px] mx-auto mt-20 pt-12 border-t border-[rgba(255,255,255,0.06)]">
          <h2 className="font-display text-3xl text-[#EFEFEF] mb-8">ESPECIFICAÇÕES</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Features */}
            <div>
              <h3 className="font-heading font-semibold text-[#EFEFEF] mb-6">Características</h3>
              <div className="space-y-4">
                {product.features.map((feature: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                    <div>
                      <p className="font-heading font-semibold text-[rgba(239,239,239,0.8)]">{feature.title}</p>
                      <p className="font-heading text-sm text-[rgba(239,239,239,0.5)]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Care & Composition */}
            <div className="space-y-8">
              <div>
                <h3 className="font-heading font-semibold text-[#EFEFEF] mb-3">Composição</h3>
                <p className="font-heading text-[rgba(239,239,239,0.5)]">{product.composition}</p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[#EFEFEF] mb-3">Cuidados</h3>
                <p className="font-heading text-[rgba(239,239,239,0.5)]">{product.care}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
