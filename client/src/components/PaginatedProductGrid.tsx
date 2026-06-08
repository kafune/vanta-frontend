/**
 * Paginated Product Grid Component
 * Reusable component for displaying products with pagination
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ShoppingBag, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";

interface PaginatedProductGridProps {
  category?: "todos" | "cotton" | "oversized" | "dryfit" | "hoodie";
  search?: string;
  sort?: "relevance" | "price-asc" | "price-desc" | "newest";
  limit?: number;
  onProductClick?: (productId: string) => void;
}

function ProductCard({ product }: { product: any }) {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: selectedSize,
    });
    toast.success("Adicionado ao carrinho!", { description: `${product.name} - Tamanho ${selectedSize}` });
    setSelectedSize(null);
  };

  // Preço vem em centavos do servidor, dividimos por 100 para exibir
  const priceInReais = (product.price / 100).toFixed(2);
  const originalPriceInReais = product.originalPrice ? (product.originalPrice / 100).toFixed(2) : null;

  return (
    <div
      className="product-card group"
      style={{ borderRadius: "4px", cursor: "pointer" }}
      onClick={() => setLocation(`/produto/${product.id}`)}
    >
      {/* Image with lazy loading */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="product-image w-full h-full object-cover object-center"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[rgba(11,11,11,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tag */}
        {product.tag && (
          <div className="absolute top-3 left-3">
            <span className="font-mono-label text-[0.6rem] bg-[rgba(11,11,11,0.8)] text-[#EFEFEF] px-2 py-1 backdrop-blur-sm">
              {product.tag}
            </span>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); toast(liked ? "Removido dos favoritos" : "Adicionado aos favoritos"); }}
          aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[rgba(11,11,11,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] transition-all"
        >
          <Heart
            size={14}
            className={liked ? "fill-white text-white" : "text-[rgba(239,239,239,0.6)]"}
          />
        </button>

        {/* Quick add on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            disabled={!selectedSize}
            className="flex-1 btn-cta py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={12} />
            <span>Carrinho</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLocation(`/produto/${product.id}`); }}
            className="flex-1 btn-outline py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <span>Detalhes</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="font-mono-label text-[rgba(239,239,239,0.3)] text-[0.6rem] mb-1.5">
          {product.category === "cotton" ? "Algodão Premium" :
           product.category === "oversized" ? "Oversized" :
           product.category === "dryfit" ? "Dry Fit" : "Premium"}
        </div>
        <h3 className="font-heading font-semibold text-[#EFEFEF] text-sm mb-3">{product.name}</h3>

        {/* Sizes */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {["P", "M", "G", "GG"].map((size) => (
            <button
              key={size}
              onClick={(e) => { e.stopPropagation(); setSelectedSize(selectedSize === size ? null : size); }}
              className={`w-7 h-7 text-[0.6rem] font-mono border transition-all duration-150 ${
                selectedSize === size
                  ? "border-white text-white bg-[rgba(255,255,255,0.1)]"
                  : "border-[rgba(255,255,255,0.12)] text-[rgba(239,239,239,0.4)] hover:border-[rgba(255,255,255,0.3)] hover:text-[rgba(239,239,239,0.7)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-[#EFEFEF]">R$ {priceInReais}</span>
          {originalPriceInReais && (
            <span className="font-heading text-sm text-[rgba(239,239,239,0.35)] line-through">
              R$ {originalPriceInReais}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaginatedProductGrid({
  category = "todos",
  search,
  sort = "relevance",
  limit = 12,
  onProductClick,
}: PaginatedProductGridProps) {
  const [page, setPage] = useState(1);

  // Fetch paginated products
  const { data, isLoading, error } = trpc.products.getPaginated.useQuery({
    page,
    limit,
    category,
    search,
    sort,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro ao carregar produtos</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Loader2 className="animate-spin mx-auto mb-4" />
        <p className="text-[rgba(239,239,239,0.5)]">Carregando produtos...</p>
      </div>
    );
  }

  const { products, pagination } = data;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(239,239,239,0.5)]">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick?.(product.id)}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between gap-4 mt-8 flex-wrap">
        <div className="text-sm text-[rgba(239,239,239,0.5)]">
          Página {pagination.page} de {pagination.totalPages} • {pagination.total} produtos
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={!pagination.hasPreviousPage || isLoading}
            className="p-2 border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={isLoading}
                  className={`w-8 h-8 text-xs border transition-all ${
                    page === pageNum
                      ? "border-white bg-[rgba(255,255,255,0.1)] text-white"
                      : "border-[rgba(255,255,255,0.12)] text-[rgba(239,239,239,0.5)] hover:border-[rgba(255,255,255,0.3)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={!pagination.hasNextPage || isLoading}
            className="p-2 border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-[rgba(11,11,11,0.5)] flex items-center justify-center rounded">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}
