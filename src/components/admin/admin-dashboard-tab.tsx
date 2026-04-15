"use client";

import { useMemo } from "react";

import { formatCurrency } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

export function AdminDashboardTab() {
  const { data } = useSiteStore();

  const metrics = useMemo(
    () => [
      { label: "Productos", value: String(data.products.length) },
      { label: "Categorías", value: String(data.categories.length) },
      { label: "Pedidos", value: String(data.orders.length) },
      {
        label: "Stock bajo",
        value: String(data.products.filter((product) => product.stock <= 12).length),
      },
    ],
    [data.categories.length, data.orders.length, data.products],
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-black text-brand-secondary">{metric.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-black text-slate-900">Pedidos recientes</h2>
          <div className="mt-4 space-y-3">
            {data.orders.slice(0, 5).map((order) => (
              <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{order.id} · {order.customerName}</p>
                    <p className="text-sm text-slate-600">{order.branch}</p>
                  </div>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-primary">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-brand-secondary">{formatCurrency(order.total)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-black text-slate-900">Stock por revisar</h2>
          <div className="mt-4 space-y-3">
            {data.products
              .filter((product) => product.stock <= 12)
              .slice(0, 5)
              .map((product) => (
                <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-600">{product.stock} unidades disponibles</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
