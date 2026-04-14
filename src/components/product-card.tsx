"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useSiteStore } from "@/providers/site-store";
import { Product } from "@/types/site";
import { formatCurrency, getProductDisplayName, getProductSizeOptions, getProductSizeUnits, withBasePath } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useSiteStore();
  const sizeOptions = getProductSizeOptions(product);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] ?? product.size);
  const selectedPackUnits = getProductSizeUnits(product, selectedSize);
  const displayName = getProductDisplayName(product);
  const availabilityLabel = product.stock > 8 ? "Disponible" : product.stock > 0 ? "Últimas unidades" : "Agotado";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f8f5ff_0%,#fffde5_100%)] p-4">
          <Image
            src={withBasePath(product.image)}
            alt={displayName}
            width={240}
            height={180}
            className="h-full w-auto object-contain transition duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-xs font-semibold">
            {product.featured ? (
              <span className="rounded-full bg-brand-primary px-2.5 py-1 text-white">Destacado</span>
            ) : null}
            {product.isNew ? (
              <span className="rounded-full bg-brand-accent px-2.5 py-1 text-brand-secondary">Nuevo</span>
            ) : null}
            {product.onSale ? (
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">Oferta</span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{product.brand}</p>
          <Link href={`/producto/${product.slug}`}>
            <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-brand-primary">
              {displayName}
            </h3>
          </Link>
          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">
            {sizeOptions.length > 1 ? `Tallas ${sizeOptions.join(" · ")}` : `Talla ${selectedSize}`}
          </span>
          <span className={`rounded-full px-2.5 py-1 ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {availabilityLabel}
          </span>
        </div>

        {sizeOptions.length > 1 ? (
          <label className="block text-sm font-semibold text-slate-700">
            Selecciona talla
            <select
              value={selectedSize}
              onChange={(event) => setSelectedSize(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} · paquete de {getProductSizeUnits(product, size)} unidades
                </option>
              ))}
            </select>
            <span className="mt-2 block text-xs font-semibold text-slate-500">
              Esta talla trae {selectedPackUnits} unidades por paquete.
            </span>
          </label>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-extrabold text-brand-secondary">{formatCurrency(product.price)}</p>
            {product.originalPrice ? (
              <p className="text-sm text-slate-400 line-through">{formatCurrency(product.originalPrice)}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => addToCart(product.id, selectedSize)}
            disabled={product.stock <= 0}
            className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-4 py-2.5 text-sm font-bold text-brand-secondary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={16} />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
