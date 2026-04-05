"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

export function CartPage() {
  const { cartItemsDetailed, cartTotal, removeFromCart, updateCartQuantity } = useSiteStore();

  if (cartItemsDetailed.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-primary">
          <ShoppingCart size={28} />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-900">Tu carrito está vacío</h1>
        <p className="mt-3 text-slate-600">Agrega productos desde el catálogo para continuar con la compra.</p>
        <Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-white">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-6">
      <section className="space-y-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Carrito</p>
          <h1 className="text-4xl font-black text-slate-900">Revisa tu pedido</h1>
        </div>

        {cartItemsDetailed.map((item) => (
          <article key={item.product.id} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary">{item.product.brand}</p>
                <h2 className="text-xl font-bold text-slate-900">{item.product.name}</h2>
                <p className="text-sm text-slate-600">{item.product.pack} · Talla {item.product.size}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="rounded-full p-1 text-slate-700"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="rounded-full p-1 text-slate-700"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p className="min-w-24 text-right text-lg font-extrabold text-brand-secondary">
                  {formatCurrency(item.subtotal)}
                </p>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.product.id)}
                  className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-red-300 hover:text-red-600"
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-900">Resumen</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Entrega</span>
            <span>A coordinar</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-2xl font-black text-brand-secondary">{formatCurrency(cartTotal)}</span>
        </div>
        <Link href="/checkout" className="mt-5 inline-flex w-full justify-center rounded-full bg-brand-accent px-5 py-3 text-sm font-bold text-brand-secondary">
          Continuar compra
        </Link>
        <Link href="/catalogo" className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">
          Seguir comprando
        </Link>
      </aside>
    </div>
  );
}
