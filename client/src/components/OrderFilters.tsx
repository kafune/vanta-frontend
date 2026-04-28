/**
 * OrderFilters Component
 * Advanced filtering for orders with status, date, and price filters
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export interface OrderFiltersState {
  statuses: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: "date" | "price" | "status";
  sortOrder?: "asc" | "desc";
}

interface OrderFiltersProps {
  onFiltersChange: (filters: OrderFiltersState) => void;
  statusCounts?: Record<string, number>;
  isExpanded?: boolean;
  resultsCount?: number;
}

const ORDER_STATUSES = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "confirmado", label: "Confirmado", color: "bg-blue-500/20 text-blue-400" },
  { value: "enviado", label: "Enviado", color: "bg-purple-500/20 text-purple-400" },
  { value: "entregue", label: "Entregue", color: "bg-green-500/20 text-green-400" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-500/20 text-red-400" },
];

export function OrderFilters({
  onFiltersChange,
  statusCounts = {},
  isExpanded: initialExpanded = true,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [filters, setFilters] = useState<OrderFiltersState>({
    statuses: [],
  });

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("orderFilters");
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(parsed);
        onFiltersChange(parsed);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  const logFilterUsage = trpc.analytics.logFilterUsage.useMutation();

  useEffect(() => {
    localStorage.setItem("orderFilters", JSON.stringify(filters));
    onFiltersChange(filters);

    // Log filter usage
    const filterType = filters.statuses.length > 0 ? "status" : filters.dateFrom || filters.dateTo ? "date" : filters.priceMin || filters.priceMax ? "price" : filters.sortBy ? "sort" : null;
    if (filterType) {
      logFilterUsage.mutate({
        filterType: filterType as any,
        filterValue: filters,
      });
    }
  }, [filters]);

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handleDateFromChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: value || undefined,
    }));
  };

  const handleDateToChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateTo: value || undefined,
    }));
  };

  const handlePriceMinChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      priceMin: value ? parseFloat(value) : undefined,
    }));
  };

  const handlePriceMaxChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      priceMax: value ? parseFloat(value) : undefined,
    }));
  };

  const handleSortByChange = (value: "date" | "price" | "status") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      statuses: [],
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.priceMin ||
    filters.priceMax;

  return (
    <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#EFEFEF] flex items-center gap-2">
            Filtros Avançados
            {hasActiveFilters && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                {filters.statuses.length +
                  (filters.dateFrom ? 1 : 0) +
                  (filters.dateTo ? 1 : 0) +
                  (filters.priceMin ? 1 : 0) +
                  (filters.priceMax ? 1 : 0)}{" "}
                ativo(s)
              </span>
            )}
          </CardTitle>
          <div className="text-[rgba(239,239,239,0.6)]">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pb-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-[rgba(239,239,239,0.7)] font-medium">
              Status do Pedido
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {ORDER_STATUSES.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.value}
                    checked={filters.statuses.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                    className="border-[rgba(255,255,255,0.2)]"
                  />
                  <label
                    htmlFor={status.value}
                    className="text-sm text-[rgba(239,239,239,0.7)] cursor-pointer flex items-center gap-2"
                  >
                    {status.label}
                    {statusCounts[status.value] !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                        {statusCounts[status.value]}
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-[rgba(239,239,239,0.7)] font-medium">
              Período
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                />
              </div>
              <div>
                <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                />
              </div>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <Label className="text-[rgba(239,239,239,0.7)] font-medium">
              Faixa de Preço (€)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">
                  Preço Mínimo
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.priceMin || ""}
                  onChange={(e) => handlePriceMinChange(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">
                  Preço Máximo
                </label>
                <Input
                  type="number"
                  placeholder="9999.99"
                  value={filters.priceMax || ""}
                  onChange={(e) => handlePriceMaxChange(e.target.value)}
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Sorting Options */}
          <div className="space-y-3">
            <Label className="text-[rgba(239,239,239,0.7)] font-medium">
              Ordenação
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy || "date"}
                  onChange={(e) => handleSortByChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded text-[#EFEFEF] text-sm"
                >
                  <option value="date">Data</option>
                  <option value="price">Preço</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">
                  Ordem
                </label>
                <select
                  value={filters.sortOrder || "desc"}
                  onChange={(e) => handleSortOrderChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded text-[#EFEFEF] text-sm"
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full border-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.7)] hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
