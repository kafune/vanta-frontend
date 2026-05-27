import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  featured: number;
  displayOrder: number;
}

export default function Collections() {
  const [, navigate] = useLocation();
  const { data: allCollections = [], isLoading } = trpc.collections.getAll.useQuery();
  const { data: featuredCollections = [] } = trpc.collections.getFeatured.useQuery();

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/collection/${collectionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Carregando coleções...</p>
        </div>
      </div>
    );
  }

  const otherCollections = allCollections.filter((c) => !c.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4">Coleções</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Explore nossas coleções exclusivas de moda
        </p>

        {/* Featured Collections */}
        {featuredCollections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredCollections.map((collection) => (
                <Card
                  key={collection.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <div className="relative overflow-hidden h-64 md:h-80">
                    <img
                      src={collection.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  </div>
                  <div className="p-6 relative z-10">
                    <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                    <p className="text-muted-foreground mb-4">{collection.description || "Coleção exclusiva"}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Coleção
                      </span>
                      <Button variant="default" size="sm">
                        Explorar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Collections */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Todas as Coleções</h2>
          {allCollections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma coleção disponível no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCollections.map((collection) => (
                <Card
                  key={collection.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={collection.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    {collection.featured === 1 && (
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        Destaque
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {collection.description || "Coleção exclusiva"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Coleção
                      </span>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
