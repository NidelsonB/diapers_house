"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { formatCurrency } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

function CatalogContent() {
  const { data } = useSiteStore();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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

    return [...base].sort((a, b) => b.price - a.price || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [data.products, resolvedCategory, search]);

  const lowestPrice = useMemo(() => {
    const prices = data.products.map((product) => product.price);
    return prices.length ? Math.min(...prices) : 0;
  }, [data.products]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, resolvedCategory]);

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
            Desde {formatCurrency(lowestPrice)} · precios en USD
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
        {totalPages > 1 ? (
          <p className="text-sm text-slate-500">Página {currentPage} de {totalPages}</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                page === currentPage
                  ? "bg-brand-primary text-white"
                  : "border border-slate-200 text-slate-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      ) : null}

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

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {/* header */}
      <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-80 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="h-10 w-44 animate-pulse rounded-2xl bg-slate-200" />
        </div>
        <div className="mt-6 h-11 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>
      </div>

      {/* count bar */}
      <div className="mt-6 h-4 w-36 animate-pulse rounded-full bg-slate-200" />

      {/* product grid */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="h-44 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-full animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent />
    </Suspense>
  );
}
