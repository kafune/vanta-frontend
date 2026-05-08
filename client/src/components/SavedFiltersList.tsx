/**
 * SavedFiltersList Component
 * Display and manage saved filter presets
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Star, Edit2, Check, X, Play } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filterData: Record<string, any>;
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
}

interface SavedFiltersListProps {
  onLoadFilter: (filter: SavedFilter) => void;
  onRefresh?: () => void;
}

export function SavedFiltersList({ onLoadFilter, onRefresh }: SavedFiltersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<string | null>(null);
  const [filterToDeleteName, setFilterToDeleteName] = useState("");

  // Queries and mutations
  const { data: savedFilters = [], isLoading, refetch } = trpc.savedFilters.list.useQuery();
  const loadFilter = trpc.savedFilters.load.useMutation({
    onSuccess: () => {
      toast.success("Filtro carregado com sucesso!");
      refetch();
      onRefresh?.();
    },
  });
  const deleteFilter = trpc.savedFilters.delete.useMutation({
    onSuccess: () => {
      toast.success("Filtro deletado com sucesso!");
      refetch();
    },
  });
  const updateFilter = trpc.savedFilters.update.useMutation({
    onSuccess: () => {
      toast.success("Filtro atualizado com sucesso!");
      setEditingId(null);
      refetch();
    },
  });
  const setDefault = trpc.savedFilters.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Filtro padrão definido!");
      refetch();
    },
  });

  const handleLoadFilter = (filter: SavedFilter) => {
    loadFilter.mutate({ filterId: filter.id });
    onLoadFilter(filter);
  };

  const handleDeleteFilter = (filterId: string, filterName: string) => {
    setFilterToDelete(filterId);
    setFilterToDeleteName(filterName);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (filterToDelete) {
      deleteFilter.mutate({ filterId: filterToDelete });
      setDeleteDialogOpen(false);
      setFilterToDelete(null);
      setFilterToDeleteName("");
    }
  };

  const handleEditStart = (filter: SavedFilter) => {
    setEditingId(filter.id);
    setEditName(filter.name);
    setEditDescription(filter.description || "");
  };

  const handleEditSave = (filterId: string) => {
    updateFilter.mutate({
      filterId,
      name: editName,
      description: editDescription,
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleSetDefault = (filterId: string) => {
    setDefault.mutate({ filterId });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-[rgba(239,239,239,0.5)]">Carregando filtros...</p>
      </div>
    );
  }

  if (savedFilters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[rgba(239,239,239,0.5)]">Nenhum filtro salvo ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(savedFilters as SavedFilter[]).map((filter) => (
        <Card
          key={filter.id}
          className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <CardContent className="pt-4">
            {editingId === filter.id ? (
              <div className="space-y-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome do filtro"
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditSave(filter.id)}
                    className="bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E]"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditCancel}
                    className="border-[rgba(255,255,255,0.1)]"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[#EFEFEF] truncate">{filter.name}</h3>
                    {filter.isDefault && (
                      <span className="text-xs bg-[#4ECDC4] text-[#0B0B0B] px-2 py-1 rounded whitespace-nowrap">
                        Padrão
                      </span>
                    )}
                  </div>
                  {filter.description && (
                    <p className="text-xs text-[rgba(239,239,239,0.5)] mb-2 line-clamp-2">{filter.description}</p>
                  )}
                  <p className="text-xs text-[rgba(239,239,239,0.4)]">
                    Utilizado {filter.usageCount} vezes
                  </p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleLoadFilter(filter)}
                    className="bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E] h-8 px-2"
                    title="Carregar este filtro"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Carregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetDefault(filter.id)}
                    className="text-[rgba(239,239,239,0.6)] hover:text-[#FFE66D]"
                    title="Definir como padrão"
                  >
                    <Star className={`w-4 h-4 ${filter.isDefault ? "fill-[#FFE66D]" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditStart(filter)}
                    className="text-[rgba(239,239,239,0.6)] hover:text-[#4ECDC4]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteFilter(filter.id, filter.name)}
                    className="text-[rgba(239,239,239,0.6)] hover:text-[#FF6B6B]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0B0B0B] border-[rgba(255,255,255,0.1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#EFEFEF]">Deletar Filtro</AlertDialogTitle>
            <AlertDialogDescription className="text-[rgba(239,239,239,0.6)]">
              Tem certeza que deseja deletar o filtro "{filterToDeleteName}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-[rgba(255,255,255,0.1)] text-[#EFEFEF]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#FF6B6B] text-white hover:bg-[#FF5252]"
            >
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
