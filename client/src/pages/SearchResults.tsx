import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function SearchResults() {
  const [location] = useLocation();
  const { addItem } = useCart();
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc" | "newest">("relevance");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Get query from URL
  const query = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }, []);

  // Fetch search results
  const { data: searchResults, isLoading } = trpc.search.search.useQuery(
    {
      query,
      category: selectedCategory && selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
      limit: 20,
      offset: 0,
    },
    { enabled: !!query }
  );

  // Fetch categories
  const { data: categories = [] } = trpc.search.categories.useQuery();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: "https://via.placeholder.com/300x400?text=" + encodeURIComponent(product.name),
    });
    toast.success("Adicionado ao carrinho!", { description: product.name });
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Nenhuma busca realizada</h1>
          <p className="text-muted-foreground">Use a barra de pesquisa para encontrar produtos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resultados da busca</h1>
          <p className="text-muted-foreground">
            {searchResults?.total ?? 0} produtos encontrados para "{query}"
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 && (
                  <>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Ordenar por</label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="newest">Mais recente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : searchResults?.results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">Tente refinar sua busca ou explorar outras categorias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {searchResults?.results.map((product) => (
              <div key={product.id} className="group">
                {/* Product image placeholder */}
                <div className="relative overflow-hidden rounded-lg bg-gray-900 mb-4 aspect-square">
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Product info */}
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-muted-foreground text-xs mb-3 capitalize">{product.category}</p>
                <p className="text-lg font-bold">€{(product.price / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination info */}
        {searchResults && searchResults.total > 20 && (
          <div className="text-center text-sm text-muted-foreground mb-8">
            Mostrando {searchResults.results.length} de {searchResults.total} produtos
          </div>
        )}
      </div>
    </div>
  );
}
