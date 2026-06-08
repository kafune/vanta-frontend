/**
 * Admin — configurações da loja (nome, contato, barra de aviso).
 * Lê via settings.getPublic e salva campo a campo via settings.set.
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FIELDS: { key: "storeName" | "contactEmail" | "contactWhatsapp" | "announcement"; label: string; hint?: string }[] = [
  { key: "storeName", label: "Nome da loja" },
  { key: "contactEmail", label: "Email de contato" },
  { key: "contactWhatsapp", label: "WhatsApp de contato" },
  { key: "announcement", label: "Barra de aviso (topo do site)", hint: "Deixe vazio para esconder a barra." },
];

export default function SettingsManager() {
  const utils = trpc.useUtils();
  const query = trpc.settings.getPublic.useQuery();
  const setMut = trpc.settings.set.useMutation();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query.data) setForm(query.data as Record<string, string>);
  }, [query.data]);

  const handleSave = async () => {
    try {
      await Promise.all(FIELDS.map((f) => setMut.mutateAsync({ key: f.key, value: form[f.key] ?? "" })));
      toast.success("Configurações salvas");
      utils.settings.getPublic.invalidate();
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e.message });
    }
  };

  const inputClass =
    "w-full h-10 px-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] text-sm focus:outline-none focus:border-[rgba(255,255,255,0.4)] rounded";

  if (query.isLoading) {
    return <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-[#EFEFEF]" /></div>;
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h3 className="text-xl font-bold text-[#EFEFEF]">Configurações da loja</h3>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">{f.label}</label>
          <Input value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} className={inputClass} />
          {f.hint && <p className="text-[0.65rem] text-[rgba(239,239,239,0.35)] mt-1">{f.hint}</p>}
        </div>
      ))}
      <Button onClick={handleSave} disabled={setMut.isPending} className="bg-white text-black hover:bg-[rgba(255,255,255,0.9)]">
        {setMut.isPending && <Loader2 size={16} className="animate-spin mr-2" />} Salvar
      </Button>
    </div>
  );
}
