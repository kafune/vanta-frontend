import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FilterState {
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: "relevance" | "newest" | "price_asc" | "price_desc" | "popularity";
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onSearch: (query: string) => void;
}

export function ProductFilters({ onFiltersChange, onSearch }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 999999,
    sortBy: "relevance",
  });

  const [expandedSections, setExpandedSections] = useState({
    sizes: true,
    colors: true,
    price: true,
    sort: true,
  });

  const { data: availableFilters } = trpc.productsFilter.getAvailableFilters.useQuery();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSizeToggle = useCallback(
    (size: string) => {
      setFilters((prev) => {
        const newSizes = prev.sizes.includes(size)
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size];
        const updated = { ...prev, sizes: newSizes };
        onFiltersChange(updated);
        return updated;
      });
    },
    [onFiltersChange]
  );

  const handleColorToggle = useCallback(
    (color: string) => {
      setFilters((prev) => {
        const newColors = prev.colors.includes(color)
          ? prev.colors.filter((c) => c !== color)
          : [...prev.colors, color];
        const updated = { ...prev, colors: newColors };
        onFiltersChange(updated);
        return updated;
      });
    },
    [onFiltersChange]
  );

  const handlePriceChange = useCallback(
    (type: "min" | "max", value: number) => {
      setFilters((prev) => {
        const updated = {
          ...prev,
          [type === "min" ? "minPrice" : "maxPrice"]: value,
        };
        onFiltersChange(updated);
        return updated;
      });
    },
    [onFiltersChange]
  );

  const handleSortChange = useCallback(
    (sortBy: FilterState["sortBy"]) => {
      setFilters((prev) => {
        const updated = { ...prev, sortBy };
        onFiltersChange(updated);
        return updated;
      });
    },
    [onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    const cleared: FilterState = {
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 999999,
      sortBy: "relevance",
    };
    setFilters(cleared);
    onFiltersChange(cleared);
  }, [onFiltersChange]);

  const activeFilterCount =
    filters.sizes.length + filters.colors.length + (filters.sortBy !== "relevance" ? 1 : 0);

  return (
    <div className="w-full space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Size Filter */}
      <Card className="p-4">
        <button
          onClick={() => toggleSection("sizes")}
          className="flex items-center justify-between w-full"
        >
          <h4 className="font-medium">Tamanho</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.sizes ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.sizes && (
          <div className="mt-3 space-y-2">
            {availableFilters?.sizes.map((size) => (
              <label key={size} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">{size}</span>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Color Filter */}
      <Card className="p-4">
        <button
          onClick={() => toggleSection("colors")}
          className="flex items-center justify-between w-full"
        >
          <h4 className="font-medium">Cor</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.colors ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.colors && (
          <div className="mt-3 space-y-2">
            {availableFilters?.colors.map((color) => (
              <label key={color} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">{color}</span>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Price Filter */}
      <Card className="p-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full"
        >
          <h4 className="font-medium">Preço</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.price ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Mínimo: R$ {(filters.minPrice / 100).toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="99999"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange("min", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Máximo: R$ {(filters.maxPrice / 100).toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="999999"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange("max", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Sort Filter */}
      <Card className="p-4">
        <button
          onClick={() => toggleSection("sort")}
          className="flex items-center justify-between w-full"
        >
          <h4 className="font-medium">Ordenar por</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.sort ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.sort && (
          <div className="mt-3 space-y-2">
            {availableFilters?.sortOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={filters.sortBy === option.value}
                  onChange={() => handleSortChange(option.value as FilterState["sortBy"])}
                  className="w-4 h-4 rounded-full border-border"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
