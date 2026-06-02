/**
 * Admin — gerenciamento de produtos: lista, criar/editar (com upload de imagem
 * self-hosted) e excluir. Preços exibidos/editados em reais; salvos em centavos.
 */

import { useRef, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  tag: string | null;
  image: string | null;
  sizes: string[];
  colors: string[];
  featured: boolean;
  active: boolean;
  displayOrder: number;
};

type FormState = {
  id: string;
  name: string;
  category: string;
  description: string;
  priceReais: string;
  originalPriceReais: string;
  tag: string;
  image: string;
  sizes: string;
  colors: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
};

const emptyForm: FormState = {
  id: "",
  name: "",
  category: "cotton",
  description: "",
  priceReais: "",
  originalPriceReais: "",
  tag: "",
  image: "",
  sizes: "P, M, G, GG",
  colors: "Preto, Branco",
  featured: false,
  active: true,
  displayOrder: 0,
};

const toCents = (reais: string) => Math.round(parseFloat(reais.replace(",", ".")) * 100);
const toReais = (cents: number) => (cents / 100).toFixed(2);
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function ProductsManager() {
  const utils = trpc.useUtils();
  const list = trpc.admin.products.list.useQuery();
  const [editing, setEditing] = useState<{ mode: "new" | "edit"; form: FormState } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadImage = trpc.uploads.uploadImage.useMutation();
  const createMut = trpc.admin.products.create.useMutation();
  const updateMut = trpc.admin.products.update.useMutation();
  const deleteMut = trpc.admin.products.delete.useMutation();

  const refresh = () => utils.admin.products.list.invalidate();

  const startNew = () => setEditing({ mode: "new", form: { ...emptyForm } });
  const startEdit = (p: ProductRow) =>
    setEditing({
      mode: "edit",
      form: {
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description ?? "",
        priceReais: toReais(p.price),
        originalPriceReais: p.originalPrice != null ? toReais(p.originalPrice) : "",
        tag: p.tag ?? "",
        image: p.image ?? "",
        sizes: p.sizes.join(", "),
        colors: p.colors.join(", "),
        featured: p.featured,
        active: p.active,
        displayOrder: p.displayOrder,
      },
    });

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await uploadImage.mutateAsync({ dataUrl: reader.result as string, prefix: "product" });
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
    const id = editing.mode === "new" ? (f.id || slugify(f.name)) : f.id;
    if (!id) return toast.error("Informe um nome/ID");
    if (!f.name.trim()) return toast.error("Informe o nome");
    const price = toCents(f.priceReais);
    if (!Number.isFinite(price) || price < 0) return toast.error("Preço inválido");

    const payload = {
      id,
      name: f.name.trim(),
      category: f.category.trim() || "outros",
      description: f.description,
      price,
      originalPrice: f.originalPriceReais ? toCents(f.originalPriceReais) : null,
      tag: f.tag.trim() || null,
      image: f.image || null,
      sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: f.colors.split(",").map((s) => s.trim()).filter(Boolean),
      featured: f.featured,
      active: f.active,
      displayOrder: Number(f.displayOrder) || 0,
    };

    try {
      if (editing.mode === "new") await createMut.mutateAsync(payload);
      else await updateMut.mutateAsync(payload);
      toast.success("Produto salvo");
      setEditing(null);
      refresh();
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e.message });
    }
  };

  const handleDelete = async (p: ProductRow) => {
    if (!confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteMut.mutateAsync({ id: p.id });
      toast.success("Produto excluído");
      refresh();
    } catch (e: any) {
      toast.error("Erro ao excluir", { description: e.message });
    }
  };

  const inputClass =
    "w-full h-10 px-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] text-sm focus:outline-none focus:border-[rgba(255,255,255,0.4)] rounded";

  // ── Formulário ───────────────────────────────────────────────
  if (editing) {
    const f = editing.form;
    return (
      <div className="space-y-5">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] text-sm">
          <ArrowLeft size={16} /> Voltar à lista
        </button>
        <h3 className="text-xl font-bold text-[#EFEFEF]">
          {editing.mode === "new" ? "Novo produto" : `Editar: ${f.name}`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Nome</label>
            <Input value={f.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">
              ID/slug {editing.mode === "edit" && "(não editável)"}
            </label>
            <Input
              value={editing.mode === "new" ? f.id : f.id}
              onChange={(e) => setField("id", slugify(e.target.value))}
              placeholder={f.name ? slugify(f.name) : "ex: camiseta-preta"}
              disabled={editing.mode === "edit"}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Categoria</label>
            <Input value={f.category} onChange={(e) => setField("category", e.target.value)} list="cat-options" className={inputClass} />
            <datalist id="cat-options">
              <option value="cotton" /><option value="oversized" /><option value="dryfit" /><option value="hoodie" />
            </datalist>
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Tag (opcional)</label>
            <Input value={f.tag} onChange={(e) => setField("tag", e.target.value)} placeholder="Bestseller, Novo..." className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Preço (R$)</label>
            <Input value={f.priceReais} onChange={(e) => setField("priceReais", e.target.value)} placeholder="89.00" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Preço "de" (opcional)</label>
            <Input value={f.originalPriceReais} onChange={(e) => setField("originalPriceReais", e.target.value)} placeholder="129.00" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Tamanhos (separados por vírgula)</label>
            <Input value={f.sizes} onChange={(e) => setField("sizes", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Cores (separadas por vírgula)</label>
            <Input value={f.colors} onChange={(e) => setField("colors", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Ordem de exibição</label>
            <Input type="number" value={f.displayOrder} onChange={(e) => setField("displayOrder", Number(e.target.value))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-1">Descrição</label>
          <textarea
            value={f.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className={inputClass.replace("h-10", "min-h-[80px] py-2")}
          />
        </div>

        {/* Imagem */}
        <div>
          <label className="text-xs text-[rgba(239,239,239,0.6)] block mb-2">Imagem principal</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded overflow-hidden flex items-center justify-center">
              {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <span className="text-[rgba(239,239,239,0.3)] text-xs">sem imagem</span>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
              <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploadImage.isPending} className="bg-[rgba(255,255,255,0.08)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.15)]">
                {uploadImage.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                Enviar imagem
              </Button>
              <Input value={f.image} onChange={(e) => setField("image", e.target.value)} placeholder="ou cole uma URL" className={`${inputClass} mt-2`} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-[rgba(239,239,239,0.8)]">
            <input type="checkbox" checked={f.featured} onChange={(e) => setField("featured", e.target.checked)} /> Destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-[rgba(239,239,239,0.8)]">
            <input type="checkbox" checked={f.active} onChange={(e) => setField("active", e.target.checked)} /> Ativo (visível na loja)
          </label>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="bg-white text-black hover:bg-[rgba(255,255,255,0.9)]">
            {(createMut.isPending || updateMut.isPending) && <Loader2 size={16} className="animate-spin mr-2" />}
            Salvar
          </Button>
          <Button onClick={() => setEditing(null)} variant="ghost" className="text-[rgba(239,239,239,0.7)]">Cancelar</Button>
        </div>
      </div>
    );
  }

  // ── Lista ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#EFEFEF]">Produtos</h3>
        <Button onClick={startNew} className="bg-white text-black hover:bg-[rgba(255,255,255,0.9)]">
          <Plus size={16} className="mr-2" /> Novo produto
        </Button>
      </div>

      {list.isLoading ? (
        <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-[#EFEFEF]" /></div>
      ) : (list.data ?? []).length === 0 ? (
        <p className="text-[rgba(239,239,239,0.5)] py-8 text-center">Nenhum produto cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {(list.data as ProductRow[]).map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded">
              <div className="w-12 h-12 bg-[rgba(255,255,255,0.05)] rounded overflow-hidden flex-shrink-0">
                {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#EFEFEF] text-sm font-medium truncate">
                  {p.name} {!p.active && <span className="text-[rgba(239,239,239,0.4)]">(inativo)</span>}
                </div>
                <div className="text-[rgba(239,239,239,0.5)] text-xs">
                  {p.category} · R$ {toReais(p.price)} {p.tag && `· ${p.tag}`} {p.featured && "· ★"}
                </div>
              </div>
              <button onClick={() => startEdit(p)} className="p-2 text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF]" title="Editar"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(p)} className="p-2 text-[rgba(239,107,107,0.7)] hover:text-[#FF6B6B]" title="Excluir"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
