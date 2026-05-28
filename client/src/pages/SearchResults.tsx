import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { ProductFilters } from "@/components/ProductFilters";
import { Card } from "@/components/ui/card";

interface FilterState {
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: "relevance" | "newest" | "price_asc" | "price_desc" | "popularity";
}

export default function SearchResults() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 999999,
    sortBy: "relevance",
  });
  const [page, setPage] = useState(0);
  const limit = 12;

  // Get query from URL
  const query = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }, []);

  // Fetch search results using new filter router
  const { data: searchResults = { results: [], total: 0 }, isLoading } =
    trpc.productsFilter.search.useQuery(
      {
        query,
        sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
        colors: filters.colors.length > 0 ? filters.colors : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 999999 ? filters.maxPrice : undefined,
        sortBy: filters.sortBy,
        limit,
        offset: page * limit,
      },
      { enabled: query.length > 0 }
    );

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    params.set("q", newQuery);
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  const totalPages = Math.ceil(searchResults.total / limit);

  if (!query) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Nenhuma busca realizada</h1>
          <p className="text-muted-foreground">Use a barra de pesquisa para encontrar produtos</p>
          <Button onClick={() => navigate("/collections")} className="mt-4">
            Ver Coleções
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Resultados da Busca</h1>
            <p className="text-muted-foreground">
              {searchResults.total} produtos encontrados para "{query}"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-muted-foreground">Carregando resultados...</p>
                </div>
              </div>
            ) : searchResults.total === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  Nenhum produto encontrado
                </p>
                <Button onClick={() => navigate("/collections")}>
                  Ver Coleções
                </Button>
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {page * limit + 1} a {Math.min((page + 1) * limit, searchResults.total)} de{" "}
                    {searchResults.total} resultados
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {searchResults.results.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/collection/${product.collectionId}`)}
                    >
                      <div className="aspect-square bg-muted overflow-hidden">
                        {product.collectionImage ? (
                          <img
                            src={product.collectionImage}
                            alt={product.collectionName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            Sem imagem
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">
                          {product.collectionName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Produto #{product.productId}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={page === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(i)}
                          className="w-8 h-8"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      disabled={page === totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
