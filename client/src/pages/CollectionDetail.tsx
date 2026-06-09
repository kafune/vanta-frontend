import { useParams, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/hooks/useCart";

interface CollectionProduct {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category?: string;
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
}

export default function CollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({});

  // Fetch collection info
  const { data: collection, isLoading: collectionLoading } = trpc.collections.getById.useQuery(
    { id: collectionId || "" },
    { enabled: !!collectionId }
  );

  // Fetch products in collection
  const { data: collectionProducts = [], isLoading: productsLoading } = trpc.collections.getProductsByCollection.useQuery(
    { collectionId: collectionId || "" },
    { enabled: !!collectionId }
  );

  // Fetch all products to get details
  const { data: allProductsData = { products: [] } } = trpc.products.getPaginated.useQuery(
    { page: 1, limit: 100 },
    { enabled: !!collectionId }
  );

  const products = useMemo(() => {
    if (!collectionProducts.length) return [];
    
    const productsArray = Array.isArray(allProductsData) ? allProductsData : (allProductsData?.products || []);
    
    return collectionProducts
      .map((cp) => {
        const product = productsArray.find((p: any) => p.id === cp.productId);
        if (!product) return null;
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category || "Produto",
          colors: ["Preto", "Branco", "Cinza"],
          sizes: ["P", "M", "G", "GG"],
          inStock: true,
        };
      })
      .filter((p) => p !== null) as CollectionProduct[];
  }, [collectionProducts, allProductsData]);

  const handleAddToCart = (product: CollectionProduct) => {
    const color = selectedColor[product.id] || product.colors?.[0] || "Preto";
    const size = selectedSize[product.id] || product.sizes?.[0] || "M";

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
      color,
      size,
      customization: {
        shirtColor: color,
      },
    });

    // Show toast notification
    const event = new CustomEvent("toast", {
      detail: {
        title: "Adicionado ao carrinho",
        description: `${product.name} foi adicionado ao carrinho`,
        type: "success",
      },
    });
    window.dispatchEvent(event);
  };

  const isLoading = collectionLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Carregando coleção...</p>
        </div>
      </div>
    );
  }

  if (!collectionId || !collection) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Coleção não encontrada</h1>
          <Button onClick={() => navigate("/collections")}>
            Voltar para Coleções
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/collections")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar para Coleções
        </button>

        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">{collection.name}</h1>
          <p className="text-xl text-muted-foreground">{collection.description || "Coleção exclusiva"}</p>
          <p className="text-sm text-muted-foreground mt-4">
            {products.length} produtos disponíveis
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto disponível nesta coleção</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden h-64">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Fora de Estoque</span>
                    </div>
                  )}
                  <button className="absolute top-4 right-4 bg-background/80 hover:bg-background p-2 rounded-full transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{product.category}</p>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold">R$ {(product.price / 100).toFixed(2)}</p>
                  </div>

                  {/* Colors */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block">Cor</label>
                    <div className="flex gap-2 flex-wrap">
                      {(product.colors || []).map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor({ ...selectedColor, [product.id]: color })}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            selectedColor[product.id] === color || (!selectedColor[product.id] && color === product.colors?.[0])
                              ? "bg-foreground text-background"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold mb-2 block">Tamanho</label>
                    <div className="flex gap-2 flex-wrap">
                      {(product.sizes || []).map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize({ ...selectedSize, [product.id]: size })}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            selectedSize[product.id] === size || (!selectedSize[product.id] && size === product.sizes?.[0])
                              ? "bg-foreground text-background"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
