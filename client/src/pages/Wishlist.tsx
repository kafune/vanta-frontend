import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

export default function Wishlist() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const getWishlist = trpc.wishlist.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  const removeFromWishlist = trpc.wishlist.removeFromWishlist.useMutation({
    onSuccess: () => {
      toast.success("Removido da wishlist");
      getWishlist.refetch();
    },
    onError: () => {
      toast.error("Erro ao remover da wishlist");
    },
  });

  const clearWishlist = trpc.wishlist.clearWishlist.useMutation({
    onSuccess: () => {
      toast.success("Wishlist limpa");
      getWishlist.refetch();
    },
    onError: () => {
      toast.error("Erro ao limpar wishlist");
    },
  });

  useEffect(() => {
    if (getWishlist.data) {
      setWishlistItems(getWishlist.data);
    }
  }, [getWishlist.data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <p className="text-[#EFEFEF]">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-display text-4xl text-[#EFEFEF]">Wishlist</h1>
        <p className="text-[rgba(239,239,239,0.6)] text-center max-w-md">
          Faça login para ver sua wishlist e salvar seus itens favoritos.
        </p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary py-3 px-6"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] py-12 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded transition-all"
          >
            <ArrowLeft size={20} className="text-[#EFEFEF]" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-3xl lg:text-4xl text-[#EFEFEF] flex items-center gap-3">
              <Heart size={32} className="text-red-500" />
              Minha Wishlist
            </h1>
            <p className="text-[rgba(239,239,239,0.5)] mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="text-[rgba(239,239,239,0.2)] mx-auto mb-4" />
            <p className="text-[rgba(239,239,239,0.6)] text-lg mb-6">
              Sua wishlist está vazia
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn-primary py-3 px-6"
            >
              Explorar Produtos
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden hover:border-[rgba(255,255,255,0.2)] transition-all"
                >
                  {/* Product Image */}
                  {item.productImage && (
                    <div className="aspect-square overflow-hidden bg-[rgba(255,255,255,0.02)]">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-heading text-[#EFEFEF] font-semibold mb-1 line-clamp-2">
                      {item.productName}
                    </h3>
                    {item.productCategory && (
                      <p className="text-xs text-[rgba(239,239,239,0.4)] mb-3">
                        {item.productCategory}
                      </p>
                    )}

                    {/* Price */}
                    <div className="text-lg font-semibold text-[#EFEFEF] mb-4">
                      R$ {item.productPrice.toFixed(2)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addItem({
                            id: item.productId,
                            name: item.productName,
                            // productPrice vem em reais do router; o carrinho usa centavos.
                            price: Math.round(item.productPrice * 100),
                            quantity: 1,
                            image: item.productImage || "",
                          });
                          toast.success("Adicionado ao carrinho");
                        }}
                        className="flex-1 btn-primary py-2 flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingBag size={16} />
                        Carrinho
                      </button>
                      <button
                        onClick={() => {
                          removeFromWishlist.mutate({
                            productId: item.productId,
                          });
                        }}
                        disabled={removeFromWishlist.isPending}
                        className="p-2 hover:bg-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.6)] hover:text-red-500 transition-all rounded disabled:opacity-50"
                        title="Remover da wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear All Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (confirm("Tem certeza que deseja limpar toda a wishlist?")) {
                    clearWishlist.mutate();
                  }
                }}
                disabled={clearWishlist.isPending}
                className="text-[rgba(239,239,239,0.6)] hover:text-red-500 transition-colors text-sm disabled:opacity-50"
              >
                Limpar Wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
