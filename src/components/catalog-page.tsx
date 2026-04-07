"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { formatCurrency } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

function CatalogContent() {
  const { data } = useSiteStore();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("catalog-order");

  const initialCategorySlug = searchParams.get("categoria") ?? undefined;
  const resolvedCategory =
    selectedCategory ??
    data.categories.find((category) => category.slug === initialCategorySlug)?.id ??
    "all";

  const filteredProducts = useMemo(() => {
    const base = data.products.filter((product) => {
      const matchesCategory =
        resolvedCategory === "all" || product.categoryId === resolvedCategory;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        term.length === 0 ||
        [product.name, product.brand, product.description, product.size, product.sizeOptions?.join(" ") ?? "", product.pack]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case "price-asc":
        return [...base].sort((a, b) => a.price - b.price || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      case "price-desc":
        return [...base].sort((a, b) => b.price - a.price || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      case "offers":
        return [...base].sort((a, b) => Number(b.onSale) - Number(a.onSale) || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      case "featured":
        return [...base].sort((a, b) => Number(b.featured) - Number(a.featured) || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      default:
        return [...base].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    }
  }, [data.products, resolvedCategory, search, sortBy]);

  const topOffer = useMemo(() => {
    const prices = data.products.map((product) => product.price);
    return prices.length ? Math.min(...prices) : 0;
  }, [data.products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Catálogo</p>
            <h1 className="text-4xl font-black text-slate-900">Encuentra la mejor opción para cada etapa</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Filtra por categoría, busca por marca o compara precios. El catálogo fue pensado para navegar fácil y comprar rápido.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-secondary">
            Desde {formatCurrency(topOffer)} · precios en USD
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Buscar productos</span>
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por marca, talla o producto"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-primary"
            />
          </label>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          >
            <option value="catalog-order">Ordenar: catálogo</option>
            <option value="featured">Ordenar: destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="offers">Mejores ofertas</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              resolvedCategory === "all"
                ? "bg-brand-primary text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Todas
          </button>
          {data.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                resolvedCategory === category.id
                  ? "bg-brand-primary text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">{filteredProducts.length} productos encontrados</p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">No encontramos coincidencias</h2>
          <p className="mt-2 text-sm text-slate-600">
            Prueba otra palabra o selecciona una categoría diferente.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-600">Cargando catálogo...</p>
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
