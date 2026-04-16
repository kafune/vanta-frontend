/**
 * OBSIDIAN Collection Section — Carbon Fiber Design System
 * Featured products grid with filter tabs
 */

import { useState, useRef, useEffect } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_IMAGES = {
  cotton: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-cotton-6C3ChDmVfT5oxo4PDhFrbf.webp",
  oversized: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-oversized-fkaeTb24PqHL7RPsvGjmFY.webp",
  dryfit: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-dryfit-fpbTLZXZdYCMYERV2Myz4g.webp",
  hoodie: "https://d2xsxph8kpxj0f.cloudfront.net/310519663562545777/LJQd3ZRoW3TSgjTHQuTJmW/category-hoodie-Z6BCR25Eed5suvi3SXqxEz.webp",
};

type FilterType = "todos" | "cotton" | "oversized" | "dryfit" | "hoodie";

const products = [
  { id: 1, name: "Essential Tee 280g", category: "cotton", price: 89, originalPrice: null, tag: "Bestseller", image: CATEGORY_IMAGES.cotton, sizes: ["P", "M", "G", "GG"] },
  { id: 2, name: "Urban Oversized", category: "oversized", price: 109, originalPrice: null, tag: "Novo", image: CATEGORY_IMAGES.oversized, sizes: ["P", "M", "G", "GG", "XGG"] },
  { id: 3, name: "Performance Pro", category: "dryfit", price: 99, originalPrice: 129, tag: "Promoção", image: CATEGORY_IMAGES.dryfit, sizes: ["P", "M", "G", "GG"] },
  { id: 4, name: "Luxury Hoodie", category: "hoodie", price: 189, originalPrice: null, tag: "Premium", image: CATEGORY_IMAGES.hoodie, sizes: ["P", "M", "G", "GG"] },
  { id: 5, name: "Classic Cotton", category: "cotton", price: 79, originalPrice: null, tag: null, image: CATEGORY_IMAGES.cotton, sizes: ["P", "M", "G"] },
  { id: 6, name: "Street Oversized", category: "oversized", price: 119, originalPrice: null, tag: "Exclusivo", image: CATEGORY_IMAGES.oversized, sizes: ["M", "G", "GG"] },
];

const filters: { key: FilterType; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "cotton", label: "Algodão" },
  { key: "oversized", label: "Oversized" },
  { key: "dryfit", label: "Dry Fit" },
  { key: "hoodie", label: "Hoodies" },
];

function ProductCard({ product }: { product: typeof products[0] }) {
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="product-card group" style={{ borderRadius: "4px" }}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image w-full h-full object-cover object-center"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[rgba(11,11,11,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tag */}
        {product.tag && (
          <div className="absolute top-3 left-3">
            <span className="font-mono-label text-[0.6rem] bg-[rgba(11,11,11,0.8)] text-[#EFEFEF] px-2 py-1 backdrop-blur-sm">
              {product.tag}
            </span>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={() => { setLiked(!liked); toast(liked ? "Removido dos favoritos" : "Adicionado aos favoritos"); }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[rgba(11,11,11,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] transition-all"
        >
          <Heart
            size={14}
            className={liked ? "fill-white text-white" : "text-[rgba(239,239,239,0.6)]"}
          />
        </button>

        {/* Quick add on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => {
              if (!selectedSize) { toast.error("Selecione um tamanho"); return; }
              toast.success(`${product.name} adicionado!`, { description: `Tamanho ${selectedSize}` });
            }}
            className="w-full btn-cta py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={12} />
              Adicionar ao Carrinho
            </span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="font-mono-label text-[rgba(239,239,239,0.3)] text-[0.6rem] mb-1.5">
          {product.category === "cotton" ? "Algodão Premium" :
           product.category === "oversized" ? "Oversized" :
           product.category === "dryfit" ? "Dry Fit" : "Hoodie"}
        </div>
        <h3 className="font-heading font-semibold text-[#EFEFEF] text-sm mb-3">{product.name}</h3>

        {/* Sizes */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(selectedSize === size ? null : size)}
              className={`w-7 h-7 text-[0.6rem] font-mono border transition-all duration-150 ${
                selectedSize === size
                  ? "border-white text-white bg-[rgba(255,255,255,0.1)]"
                  : "border-[rgba(255,255,255,0.12)] text-[rgba(239,239,239,0.4)] hover:border-[rgba(255,255,255,0.3)] hover:text-[rgba(239,239,239,0.7)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-[#EFEFEF]">R$ {product.price}</span>
          {product.originalPrice && (
            <span className="font-heading text-sm text-[rgba(239,239,239,0.35)] line-through">
              R$ {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filtered = activeFilter === "todos" ? products : products.filter(p => p.category === activeFilter);

  return (
    <section id="collection" className="py-24 lg:py-32" style={{ background: "#0B0B0B" }} ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="font-mono-label text-[rgba(239,239,239,0.35)] mb-4">Coleção / 2025</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-[#EFEFEF]">
              PRODUTOS<br />EM DESTAQUE
            </h2>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`category-tag ${activeFilter === f.key ? "active" : ""}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="section-divider mb-10" />

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-12">
          <button
            onClick={() => toast("Mais produtos em breve", { description: "Catálogo completo a ser disponibilizado." })}
            className="btn-outline-cta"
          >
            <span>Ver Toda a Coleção</span>
          </button>
        </div>
      </div>
    </section>
  );
}
