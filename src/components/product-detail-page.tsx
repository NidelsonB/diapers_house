"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { formatCurrency, getProductSizeOptions, getProductSizeStock, withBasePath } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

export function ProductDetailPage({ slug }: { slug: string }) {
  const { addToCart, data } = useSiteStore();
  const product = data.products.find((item) => item.slug === slug);
  const sizeOptions = product ? getProductSizeOptions(product) : [];
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] ?? product?.size ?? "");
  const selectedSizeStock = product ? getProductSizeStock(product, selectedSize) : 0;
  const availabilityLabel = !product ? "" : selectedSizeStock > 8 ? "Disponible" : selectedSizeStock > 0 ? "Últimas unidades" : "Agotado";

  useEffect(() => {
    if (product) {
      setSelectedSize(sizeOptions[0] ?? product.size);
    }
  }, [product?.id, product?.size, product?.sizeOptions?.join("|")]);

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
        <h1 className="text-3xl font-black text-slate-900">Producto no encontrado</h1>
        <p className="mt-3 text-slate-600">Es posible que ya no esté disponible o que haya sido actualizado recientemente.</p>
        <Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-white">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const relatedProducts = data.products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Link href="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
        <ArrowLeft size={16} />
        Volver al catálogo
      </Link>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex h-[360px] items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#f8f5ff_0%,#fffde5_100%)] p-4">
            <Image src={withBasePath(product.image)} alt={product.name} width={420} height={320} className="h-full w-auto object-contain" />
          </div>
        </div>

        <div className="space-y-5 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">{product.brand}</p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">{product.name}</h1>
            <p className="mt-3 text-slate-600">{product.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {sizeOptions.length > 1 ? `Talla seleccionada ${selectedSize}` : `Talla ${product.size}`}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">{product.pack}</span>
            <span className={`rounded-full px-3 py-1.5 ${selectedSizeStock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {availabilityLabel}
            </span>
            <span className="rounded-full bg-brand-soft px-3 py-1.5 text-brand-secondary">
              {selectedSizeStock} disponibles en talla {selectedSize}
            </span>
          </div>

          {sizeOptions.length > 1 ? (
            <label className="block text-sm font-semibold text-slate-700">
              Elige la talla de diaper
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} · {getProductSizeStock(product, size)} disponibles
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <p className="text-4xl font-black text-brand-secondary">{formatCurrency(product.price)}</p>
            {product.originalPrice ? (
              <p className="text-sm text-slate-400 line-through">Antes {formatCurrency(product.originalPrice)}</p>
            ) : null}
          </div>

          <div className="rounded-[24px] bg-brand-soft p-4 text-sm text-slate-700">
            <p className="font-bold text-brand-secondary">Lo que encontrarás en esta ficha:</p>
            <ul className="mt-2 space-y-1">
              <li>• Selección de talla antes de agregar al carrito.</li>
              <li>• Presentación y disponibilidad actualizada.</li>
              <li>• Compra directa o agregado al carrito con un clic.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => addToCart(product.id, selectedSize)}
            disabled={selectedSizeStock <= 0}
            className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-3 text-sm font-bold text-brand-secondary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={16} />
            Agregar al carrito
          </button>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Relacionados</p>
            <h2 className="text-3xl font-black text-slate-900">También podría interesarte</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
