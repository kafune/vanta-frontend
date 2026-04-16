import { useState, useEffect } from "react";

export interface FavoriteProduct {
  id: string;
  name: string;
  color: string;
  price: number;
  image: string;
  category: string;
  addedAt: string;
}

const FAVORITES_STORAGE_KEY = "vanta_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Erro ao salvar favoritos:", error);
      }
    }
  }, [favorites, isLoading]);

  const addFavorite = (product: FavoriteProduct) => {
    setFavorites((prev) => {
      // Verificar se já existe
      if (prev.some((fav) => fav.id === product.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          ...product,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.some((fav) => fav.id === productId);
  };

  const toggleFavorite = (product: FavoriteProduct) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
  };
}
