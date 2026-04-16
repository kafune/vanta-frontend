/**
 * OBSIDIAN Design History Component
 * Displays saved designs with load, edit, export, and delete options
 */

import { useState } from "react";
import { Trash2, Download, Upload, Edit2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Design, useDesignHistory } from "@/hooks/useDesignHistory";

interface DesignHistoryProps {
  onLoadDesign: (design: Design) => void;
}

export default function DesignHistory({ onLoadDesign }: DesignHistoryProps) {
  const { designs, deleteDesign, exportDesign, importDesign, clearAll, getStorageUsage } = useDesignHistory();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [importRef, setImportRef] = useState<HTMLInputElement | null>(null);

  const handleLoadDesign = (design: Design) => {
    onLoadDesign(design);
    toast.success("Design carregado!", { description: design.name });
  };

  const handleExport = (design: Design) => {
    exportDesign(design.id);
    toast.success("Design exportado!", { description: `${design.name}.json` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imported = await importDesign(file);
    if (imported) {
      toast.success("Design importado!", { description: imported.name });
    } else {
      toast.error("Erro ao importar design");
    }

    // Reset input
    if (importRef) importRef.value = "";
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Eliminar "${name}"?`)) {
      deleteDesign(id);
      toast.success("Design eliminado");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-PT");
    }
  };

  const storageUsage = getStorageUsage();
  const storageUsageMB = (storageUsage / 1024 / 1024).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all"
        style={{ borderRadius: "4px" }}
      >
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-[rgba(239,239,239,0.5)]" />
          <div className="text-left">
            <p className="font-heading font-semibold text-[#EFEFEF]">Meus Designs</p>
            <p className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.35)]">
              {designs.length} design{designs.length !== 1 ? "s" : ""} • {storageUsageMB} MB
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]" style={{ borderRadius: "4px" }}>
          {/* Import Button */}
          <div className="flex gap-2">
            <input
              ref={setImportRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => importRef?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-[rgba(255,255,255,0.15)] text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all font-heading text-sm"
              style={{ borderRadius: "3px" }}
            >
              <Upload size={14} />
              <span>Importar</span>
            </button>
            {designs.length > 0 && (
              <button
                onClick={() => clearAll()}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-[rgba(200,100,100,0.3)] text-[rgba(200,100,100,0.7)] hover:text-[rgba(200,100,100,1)] hover:border-[rgba(200,100,100,0.6)] transition-all font-heading text-sm"
                style={{ borderRadius: "3px" }}
              >
                <Trash2 size={14} />
                <span>Limpar Tudo</span>
              </button>
            )}
          </div>

          {/* Designs List */}
          {designs.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-heading text-sm text-[rgba(239,239,239,0.35)]">
                Nenhum design salvo ainda
              </p>
              <p className="font-mono-label text-[0.65rem] text-[rgba(239,239,239,0.2)] mt-1">
                Customize e clique em "Salvar Design" para guardar
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="group flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)] transition-all"
                  style={{ borderRadius: "3px" }}
                >
                  {/* Thumbnail */}
                  <img
                    src={design.imageData}
                    alt={design.name}
                    className="w-12 h-12 object-cover"
                    style={{ borderRadius: "2px" }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === design.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingId(null);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] px-2 py-1 text-[#EFEFEF] font-heading text-sm"
                        style={{ borderRadius: "2px" }}
                      />
                    ) : (
                      <>
                        <p className="font-heading font-semibold text-[rgba(239,239,239,0.8)] truncate text-sm">
                          {design.name}
                        </p>
                        <p className="font-mono-label text-[0.6rem] text-[rgba(239,239,239,0.3)]">
                          {formatDate(design.updatedAt)}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleLoadDesign(design)}
                      className="p-2 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                      title="Carregar"
                      style={{ borderRadius: "2px" }}
                    >
                      <Upload size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(design.id);
                        setEditName(design.name);
                      }}
                      className="p-2 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                      title="Editar nome"
                      style={{ borderRadius: "2px" }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleExport(design)}
                      className="p-2 text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                      title="Exportar"
                      style={{ borderRadius: "2px" }}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(design.id, design.name)}
                      className="p-2 text-[rgba(200,100,100,0.5)] hover:text-[rgba(200,100,100,1)] hover:bg-[rgba(200,100,100,0.1)] transition-all"
                      title="Eliminar"
                      style={{ borderRadius: "2px" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
