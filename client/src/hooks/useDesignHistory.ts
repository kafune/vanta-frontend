/**
 * OBSIDIAN useDesignHistory Hook
 * Manages design customizations with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";

export interface Design {
  id: string;
  name: string;
  description?: string;
  imageData: string; // Base64 encoded image
  shirtColor: string;
  imageX: number;
  imageY: number;
  imageScale: number;
  imageRotation: number;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "obsidian_design_history";
const MAX_DESIGNS = 20;
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB

export function useDesignHistory() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load designs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Design[];
        // Sort by updatedAt descending (newest first)
        setDesigns(parsed.sort((a, b) => b.updatedAt - a.updatedAt));
      }
      setIsLoading(false);
    } catch (err) {
      setError("Erro ao carregar histórico");
      setIsLoading(false);
    }
  }, []);

  // Save designs to localStorage
  const persistDesigns = useCallback((newDesigns: Design[]) => {
    try {
      // Limit to MAX_DESIGNS
      const limited = newDesigns.slice(0, MAX_DESIGNS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      setDesigns(limited);
      setError(null);
    } catch (err) {
      setError("Erro ao salvar design");
      console.error("Storage error:", err);
    }
  }, []);

  // Save new design
  const saveDesign = useCallback(
    (
      name: string,
      imageData: string,
      shirtColor: string,
      imageX: number,
      imageY: number,
      imageScale: number,
      imageRotation: number,
      description?: string
    ) => {
      // Validate image size
      if (imageData.length > MAX_IMAGE_SIZE) {
        setError("Imagem muito grande para salvar");
        return null;
      }

      const newDesign: Design = {
        id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name || `Design ${new Date().toLocaleDateString("pt-PT")}`,
        description,
        imageData,
        shirtColor,
        imageX,
        imageY,
        imageScale,
        imageRotation,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updated = [newDesign, ...designs];
      persistDesigns(updated);
      return newDesign;
    },
    [designs, persistDesigns]
  );

  // Update existing design
  const updateDesign = useCallback(
    (
      id: string,
      updates: Partial<Omit<Design, "id" | "createdAt">>
    ) => {
      const updated = designs.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
      );
      persistDesigns(updated);
      return updated.find((d) => d.id === id);
    },
    [designs, persistDesigns]
  );

  // Delete design
  const deleteDesign = useCallback(
    (id: string) => {
      const updated = designs.filter((d) => d.id !== id);
      persistDesigns(updated);
    },
    [designs, persistDesigns]
  );

  // Get design by ID
  const getDesign = useCallback(
    (id: string) => {
      return designs.find((d) => d.id === id);
    },
    [designs]
  );

  // Clear all designs
  const clearAll = useCallback(() => {
    if (confirm("Tem a certeza que deseja eliminar todos os designs?")) {
      persistDesigns([]);
    }
  }, [persistDesigns]);

  // Get storage usage
  const getStorageUsage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return 0;
      return new Blob([stored]).size;
    } catch {
      return 0;
    }
  }, []);

  // Export design as JSON
  const exportDesign = useCallback((id: string) => {
    const design = designs.find((d) => d.id === id);
    if (!design) return null;

    const json = JSON.stringify(design, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${design.name.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [designs]);

  // Import design from JSON
  const importDesign = useCallback(
    (file: File) => {
      return new Promise<Design | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string) as Design;
            
            // Validate design structure
            if (
              !imported.name ||
              !imported.imageData ||
              typeof imported.imageX !== "number"
            ) {
              setError("Ficheiro de design inválido");
              resolve(null);
              return;
            }

            // Create new design with new ID
            const newDesign: Design = {
              ...imported,
              id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            const updated = [newDesign, ...designs];
            persistDesigns(updated);
            resolve(newDesign);
          } catch (err) {
            setError("Erro ao importar design");
            resolve(null);
          }
        };
        reader.readAsText(file);
      });
    },
    [designs, persistDesigns]
  );

  return {
    designs,
    isLoading,
    error,
    saveDesign,
    updateDesign,
    deleteDesign,
    getDesign,
    clearAll,
    getStorageUsage,
    exportDesign,
    importDesign,
  };
}
