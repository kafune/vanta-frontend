/**
 * VANTA Product Page – Carbon Fiber Design System
 * Detailed product page with gallery, size selector, and specifications
 */

import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart, Share2, Truck, RotateCcw, Shield, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import SizeSelector from "@/components/SizeSelector";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/hooks/useCart";

export default function Product() {
  const [, params] = useRoute("/produto/:id");
  const [, setLocation] = useLocation();
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityInput, setQuantityInput] = useState<string>("1");
  const { addItem } = useCart();

  const productId = params?.id ?? "";

  // Busca o produto via API (igual ao que o CollectionSection já faz)
  const { data: product, isLoading, error } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  // Parse múltiplas imagens do campo JSON
  const productImages = useMemo(() => {
    if (!product) return [];
    try {
      // Se images é uma string JSON, faz parse
      if (typeof product.images === "string" && product.images.length > 0) {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed : [];
      }
      // Se já é array, retorna como está
      if (Array.isArray(product.images)) {
        return product.images;
      }
    } catch (e) {
      console.error("Erro ao parsear imagens:", e);
    }
    // Fallback: retorna a imagem principal
    return product.image ? [product.image] : [];
  }, [product]);

  // Verifica disponibilidade de estoque
  const isInStock = product ? (product.stock ?? 0) > 0 : false;
  const stockMessage = product
    ? isInStock
      ? `${product.stock} em estoque`
      : "Fora de estoque"
    : "";

  // Calcula quantidade máxima que pode ser adicionada
  const maxQuantity = product?.stock ?? 0;
  const canAddToCart = isInStock && quantity <= maxQuantity;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho", { description: "É necessário escolher um tamanho para adicionar ao carrinho." });
      return;
    }
    if (!isInStock) {
      toast.error("Produto fora de estoque", { description: "Este produto não está disponível no momento." });
      return;
    }
    if (quantity > maxQuantity) {
      toast.error("Quantidade indisponível", { description: `Apenas ${maxQuantity} unidade(s) disponível(is).` });
      return;
    }
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      size: selectedSize,
    });
    toast.success(`${product.name} adicionado!`, {
      description: `Tamanho ${selectedSize} × ${quantity} unidade(s) - R$ ${(product.price / 100 * quantity).toFixed(2)}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("Link copiado!", { description: "Compartilhe com seus amigos." });
      }).catch(() => {
        toast.error("Não foi possível copiar o link.");
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const clamped = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(clamped);
    setQuantityInput(String(clamped));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-[rgba(239,239,239,0.5)]">Carregando produto...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-red-400">Produto não encontrado.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Preço já vem em centavos da API, dividimos por 100 para exibir em reais
  const priceInReais = product.price / 100;
  const originalPriceInReais = product.originalPrice ? product.originalPrice / 100 : null;

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
          {/* Gallery - Múltiplas Imagens */}
          <div>
            <ProductGallery images={productImages} productName={product.name} />
          </div>

          {/* Info */}
          <div>
            {/* Tag */}
            {product.tag && (
              <div className="font-mono-label text-[0.6rem] bg-[rgba(11,11,11,0.8)] text-[#EFEFEF] px-2 py-1 backdrop-blur-sm inline-block mb-4">
                {product.tag}
              </div>
            )}

            <h1 className="font-display text-4xl text-[#EFEFEF] leading-none mb-2">{product.name}</h1>

            <div className="font-mono-label text-[rgba(239,239,239,0.3)] text-[0.6rem] mb-6">{product.category}</div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-6">
              <span className="font-heading font-bold text-[#EFEFEF] text-2xl">
                R$ {priceInReais.toFixed(2)}
              </span>
              {originalPriceInReais && (
                <span className="font-heading text-sm text-[rgba(239,239,239,0.35)] line-through">
                  R$ {originalPriceInReais.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock status - Verificação Real */}
            <div className="mt-4 mb-6">
              {isInStock ? (
                <span className={`font-heading text-xs font-semibold tracking-widest uppercase text-[rgba(100,200,100,0.8)]`}>
                  ✓ {stockMessage}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="font-heading text-xs font-semibold tracking-widest uppercase text-red-400">
                    {stockMessage}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="font-heading text-base font-light text-[rgba(239,239,239,0.6)] leading-relaxed mt-4 mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <SizeSelector sizes={product.sizes ?? ["P", "M", "G", "GG"]} onSizeSelect={setSelectedSize} selectedSize={selectedSize} />

            {/* Quantity */}
            <div className="mt-6 mb-6">
              <label className="font-heading font-semibold text-[#EFEFEF] block mb-3">Quantidade</label>
              <div className="flex items-center gap-3 w-fit">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={!isInStock}
                  className="w-10 h-10 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  –
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  onBlur={(e) => {
                    const parsed = Math.max(1, parseInt(e.target.value) || 1);
                    handleQuantityChange(parsed);
                  }}
                  disabled={!isInStock}
                  className="w-12 h-10 text-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] font-heading focus:outline-none focus:border-[rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!isInStock || quantity >= maxQuantity}
                  className="w-10 h-10 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {isInStock && maxQuantity > 0 && (
                <p className="font-heading text-xs text-[rgba(239,239,239,0.4)] mt-2">
                  Máximo: {maxQuantity} unidade(s)
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="btn-cta flex-1 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isInStock ? "Adicionar ao Carrinho" : "Fora de Estoque"}</span>
              </button>
              <button
                onClick={() => { setLiked(!liked); toast(liked ? "Removido dos favoritos" : "Adicionado aos favoritos"); }}
                aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                className="w-12 h-12 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
              >
                <Heart size={18} className={liked ? "fill-white text-white" : ""} />
              </button>
              <button
                onClick={handleShare}
                aria-label="Compartilhar produto"
                className="w-12 h-12 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Benefits */}
            <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)] mt-6">
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
      </div>

      <Footer />
    </div>
  );
}
