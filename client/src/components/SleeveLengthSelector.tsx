import { Button } from "@/components/ui/button";
import { Shirt, Waves } from "lucide-react";
import { SleeveLength } from "@/utils/clothingModels";

interface SleeveLengthSelectorProps {
  selectedLength: SleeveLength;
  onSelect: (length: SleeveLength) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export default function SleeveLengthSelector({
  selectedLength,
  onSelect,
  disabled = false,
  showLabel = true,
}: SleeveLengthSelectorProps) {
  return (
    <div className="space-y-3">
      {showLabel && (
        <label className="block text-sm font-medium text-foreground">
          Comprimento da Manga
        </label>
      )}
      <div className="flex gap-3">
        <Button
          onClick={() => onSelect("short")}
          variant={selectedLength === "short" ? "default" : "outline"}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <Shirt className="w-4 h-4" />
          Curta
        </Button>
        <Button
          onClick={() => onSelect("long")}
          variant={selectedLength === "long" ? "default" : "outline"}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <Waves className="w-4 h-4" />
          Longa
        </Button>
      </div>
    </div>
  );
}
