import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  productCategory?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function FavoriteButton({
  productId,
  productName,
  productImage,
  productPrice,
  productCategory,
  size = "md",
  showLabel = false,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  // Check if product is in wishlist
  const isInWishlist = trpc.wishlist.isInWishlist.useQuery(
    { productId },
    { enabled: isAuthenticated }
  );

  // Add to wishlist
  const addToWishlist = trpc.wishlist.addToWishlist.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setIsFavorited(true);
        toast.success("Adicionado à wishlist");
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Erro ao adicionar à wishlist");
    },
  });

  // Remove from wishlist
  const removeFromWishlist = trpc.wishlist.removeFromWishlist.useMutation({
    onSuccess: () => {
      setIsFavorited(false);
      toast.success("Removido da wishlist");
    },
    onError: () => {
      toast.error("Erro ao remover da wishlist");
    },
  });

  useEffect(() => {
    if (isInWishlist.data !== undefined) {
      setIsFavorited(isInWishlist.data);
    }
  }, [isInWishlist.data]);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Faça login para adicionar à wishlist");
      return;
    }

    if (isFavorited) {
      removeFromWishlist.mutate({ productId });
    } else {
      addToWishlist.mutate({
        productId,
        productName,
        productImage,
        productPrice,
        productCategory,
      });
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={handleClick}
      disabled={addToWishlist.isPending || removeFromWishlist.isPending}
      className={`${sizeClasses[size]} flex items-center justify-center gap-2 rounded-lg transition-all disabled:opacity-50 ${
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.2)] hover:text-[#EFEFEF]"
      }`}
      title={isFavorited ? "Remover da wishlist" : "Adicionar à wishlist"}
    >
      <Heart
        size={iconSize[size]}
        fill={isFavorited ? "currentColor" : "none"}
      />
      {showLabel && <span className="text-xs font-semibold">Favorito</span>}
    </button>
  );
}
