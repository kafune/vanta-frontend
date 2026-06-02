/**
 * Admin — gerenciamento de coleções: lista, criar/editar (com upload de imagem)
 * e excluir.
 */

import { useRef, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  featured: number;
  displayOrder: number;
};

type FormState = {
  id: string;
  name: string;
  description: string;
  image: string;
  featured: boolean;
  displayOrder: number;
};

const emptyForm: FormState = { id: "", name: "", description: "", image: "", featured: false, displayOrder: 0 };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function CollectionsManager() {
  const utils = trpc.useUtils();
  const list = trpc.collections.getAll.useQuery();
  const [editing, setEditing] = useState<{ mode: "new" | "edit"; form: FormState } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadImage = trpc.uploads.uploadImage.useMutation();
  const createMut = trpc.collections.create.useMutation();
  const updateMut = trpc.collections.update.useMutation();
  const deleteMut = trpc.collections.delete.useMutation();

  const refresh = () => utils.collections.getAll.invalidate();

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem válida");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await uploadImage.mutateAsync({ dataUrl: reader.result as string, prefix: "collection" });
        setField("image", res.url);
        toast.success("Imagem enviada");
      } catch (e: any) {
        toast.error("Falha no upload", { description: e.message });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editing) return;
    const f = editing.form;
    const id = editing.mode === "new" ? f.id || slugify(f.name) : f.id;
    if (!id) return toast.error("Informe um nome/ID");
    if (!f.name.trim()) return toast.error("Informe o nome");
    const payload = {
      id,
      name: f.name.trim(),
      description: f.description || undefined,
      image: f.image || undefined,
      featured: f.featured ? 1 : 0,
      displayOrder: Number(f.displayOrder) || 0,
    };
    try {
      if (editing.mode === "new") await createMut.mutateAsync(payload);
      else await updateMut.mutateAsync(payload);
      toast.success("Coleção salva");
      setEditing(null);
      refresh();
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e.message });
    }
  };

  const handleDelete = async (c: Collection) => {
    if (!confirm(`Excluir a coleção "${c.name}"?`)) return;
    try {
      await deleteMut.mutateAsync({ id: c.id });
      toast.success("Coleção excluída");
      refresh();
    } catch (e: any) {
      toast.error("Erro ao excluir", { description: e.message });
    }
  };

  const inputClass =
    "w-full h-10 px-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] text-sm focus:outline-none focus:border-[rgba(255,255,255,0.4)] rounded";

  if (editing) {
    const f = editing.form;
    return (
      <div className="space-y-5">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] text-sm">
          <ArrowLeft size={16} /> Voltar à lista
        </button>
        <h3 className="text-xl font-bold text-[#EFEFEF]">{editing.mode === "new" ? "Nova coleção" : `Editar: ${f.name}`}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Nome</label>
            <Input value={f.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">ID/slug {editing.mode === "edit" && "(fixo)"}</label>
            <Input value={f.id} onChange={(e) => setField("id", slugify(e.target.value))} placeholder={f.name ? slugify(f.name) : "ex: verao"} disabled={editing.mode === "edit"} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Ordem de exibição</label>
            <Input type="number" value={f.displayOrder} onChange={(e) => setField("displayOrder", Number(e.target.value))} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm text-[rgba(239,239,239,0.8)] mt-6">
            <input type="checkbox" checked={f.featured} onChange={(e) => setField("featured", e.target.checked)} /> Em destaque
          </label>
        </div>

        <div>
          <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Descrição</label>
          <textarea value={f.description} onChange={(e) => setField("description", e.target.value)} rows={2} className={inputClass.replace("h-10", "min-h-[70px] py-2")} />
        </div>

        <div>
          <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-2">Imagem</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded overflow-hidden flex items-center justify-center">
              {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <span className="text-[rgba(239,239,239,0.3)] text-xs">sem imagem</span>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
              <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploadImage.isPending} className="bg-[rgba(255,255,255,0.08)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.15)]">
                {uploadImage.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />} Enviar imagem
              </Button>
              <Input value={f.image} onChange={(e) => setField("image", e.target.value)} placeholder="ou cole uma URL" className={`${inputClass} mt-2`} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="bg-white text-black hover:bg-[rgba(255,255,255,0.9)]">
            {(createMut.isPending || updateMut.isPending) && <Loader2 size={16} className="animate-spin mr-2" />} Salvar
          </Button>
          <Button onClick={() => setEditing(null)} variant="ghost" className="text-[rgba(239,239,239,0.7)]">Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#EFEFEF]">Coleções</h3>
        <Button onClick={() => setEditing({ mode: "new", form: { ...emptyForm } })} className="bg-white text-black hover:bg-[rgba(255,255,255,0.9)]">
          <Plus size={16} className="mr-2" /> Nova coleção
        </Button>
      </div>

      {list.isLoading ? (
        <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-[#EFEFEF]" /></div>
      ) : (list.data ?? []).length === 0 ? (
        <p className="text-[rgba(239,239,239,0.5)] py-8 text-center">Nenhuma coleção cadastrada.</p>
      ) : (
        <div className="space-y-2">
          {(list.data as Collection[]).map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded">
              <div className="w-12 h-12 bg-[rgba(255,255,255,0.05)] rounded overflow-hidden flex-shrink-0">
                {c.image && <img src={c.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#EFEFEF] text-sm font-medium truncate">{c.name} {c.featured === 1 && "★"}</div>
                <div className="text-[rgba(239,239,239,0.5)] text-xs truncate">{c.description || c.id}</div>
              </div>
              <button onClick={() => setEditing({ mode: "edit", form: { id: c.id, name: c.name, description: c.description ?? "", image: c.image ?? "", featured: c.featured === 1, displayOrder: c.displayOrder } })} className="p-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF]" title="Editar"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(c)} className="p-2 text-[rgba(239,107,107,0.7)] hover:text-[#FF6B6B]" title="Excluir"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
