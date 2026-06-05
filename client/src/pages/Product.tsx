/**
<<<<<<< Updated upstream
 * VANTA Product Page — Carbon Fiber Design System
 * Página de produto com galeria, seletor de tamanho e relacionados.
 * Dados vêm do banco via trpc.products.getById / getRelated.
=======
 * VANTA Product Page – Carbon Fiber Design System
 * Detailed product page with gallery, size selector, and specifications
>>>>>>> Stashed changes
 */

import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Heart, Share2, Truck, RotateCcw, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import SizeSelector from "@/components/SizeSelector";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/hooks/useCart";
<<<<<<< Updated upstream

const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2)}`;
=======
>>>>>>> Stashed changes

export default function Product() {
  const [, params] = useRoute("/produto/:id");
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const productId = params?.id as string;
<<<<<<< Updated upstream

  const { data: product, isLoading, isError } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !!productId, retry: false }
  );
  const { data: related = [] } = trpc.products.getRelated.useQuery(
    { productId, limit: 4 },
    { enabled: !!productId }
  );

  useEffect(() => {
    if (isError) setLocation("/404");
  }, [isError, setLocation]);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0B" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#EFEFEF]" />
      </div>
    );
  }
=======

  // Busca o produto via API (igual ao que o CollectionSection já faz)
  const { data: product, isLoading, error } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );
>>>>>>> Stashed changes

  const galleryImages = product.images.length > 0 ? product.images : product.image ? [product.image] : [];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho", { description: "É necessário escolher um tamanho para adicionar ao carrinho." });
      return;
    }
<<<<<<< Updated upstream
    addItem({
      id: product.id,
      name: product.name,
      price: product.price / 100, // carrinho em reais; produto vem em centavos
      quantity,
      image: product.image ?? "",
      size: selectedSize,
    });
    toast.success(`${product.name} adicionado!`, {
      description: `Tamanho ${selectedSize} × ${quantity} - ${formatPrice(product.price * quantity)}`,
=======
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
>>>>>>> Stashed changes
    });
  };

  const handleShare = () => {
    if (navigator.share) {
<<<<<<< Updated upstream
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
=======
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
>>>>>>> Stashed changes
    } else {
      toast.success("Link copiado!", { description: "Compartilhe com seus amigos." });
    }
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
          {/* Gallery */}
          <div>
<<<<<<< Updated upstream
            <ProductGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-2">{product.category}</div>
              <h1 className="font-display text-4xl lg:text-5xl text-[#EFEFEF] mb-4">{product.name}</h1>

              {/* Rating — só exibe quando há avaliações reais */}
              {product.reviews > 0 && (
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
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl text-[#EFEFEF]">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="font-heading text-lg text-[rgba(239,239,239,0.35)] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-4">
                <span className="font-heading text-xs font-semibold tracking-widest uppercase text-[rgba(100,200,100,0.8)]">
                  ✓ Em Estoque
=======
            <ProductGallery images={[product.image]} productName={product.name} />
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
>>>>>>> Stashed changes
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="mt-4">
              <span className={`font-heading text-xs font-semibold tracking-widest uppercase text-[rgba(100,200,100,0.8)]`}>
                ✓ Em Estoque
              </span>
            </div>

            {/* Description */}
<<<<<<< Updated upstream
            {product.description && (
              <p className="font-heading text-base font-light text-[rgba(239,239,239,0.6)] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <SizeSelector sizes={product.sizes} onSizeSelect={setSelectedSize} selectedSize={selectedSize} />
            )}
=======
            <p className="font-heading text-base font-light text-[rgba(239,239,239,0.6)] leading-relaxed mt-4 mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <SizeSelector sizes={product.sizes ?? ["P", "M", "G", "GG"]} onSizeSelect={setSelectedSize} selectedSize={selectedSize} />
>>>>>>> Stashed changes

            {/* Quantity */}
            <div className="mt-6 mb-6">
              <label className="font-heading font-semibold text-[#EFEFEF] block mb-3">Quantidade</label>
              <div className="flex items-center gap-3 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all"
                >
                  –
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

<<<<<<< Updated upstream
            {/* Benefits (políticas da loja) */}
            <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
=======
            {/* Benefits */}
            <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)] mt-6">
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

        {/* Produtos relacionados */}
        {related.length > 0 && (
          <div className="max-w-[1400px] mx-auto mt-20 pt-12 border-t border-[rgba(255,255,255,0.06)]">
            <h2 className="font-display text-3xl text-[#EFEFEF] mb-8">VOCÊ TAMBÉM PODE GOSTAR</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setLocation(`/produto/${r.id}`); window.scrollTo({ top: 0 }); }}
                  className="text-left group"
                >
                  <div className="relative overflow-hidden bg-[rgba(255,255,255,0.04)] aspect-square mb-3">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <p className="font-heading text-sm text-[rgba(239,239,239,0.8)]">{r.name}</p>
                  <p className="font-heading text-sm text-[rgba(239,239,239,0.5)]">{formatPrice(r.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}
=======
>>>>>>> Stashed changes
      </div>

      <Footer />
    </div>
  );
}
