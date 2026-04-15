"use client";

import { formatCurrency, orderStatuses } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

export function AdminOrdersTab() {
  const { data, updateOrderStatus } = useSiteStore();

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-black text-slate-900">Listado de pedidos</h2>
      <div className="mt-4 space-y-3">
        {data.orders.map((order) => (
          <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  {order.id} · {order.customerName}
                </p>
                <p className="text-sm text-slate-600">
                  {order.phone} · {order.branch}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {order.items
                    .map(
                      (item) =>
                        `${item.quantity}x ${item.name}${item.selectedSize ? ` · Talla ${item.selectedSize}` : ""}`,
                    )
                    .join(", ")}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-secondary">
                  Total: {formatCurrency(order.total)}
                </p>
              </div>
              <div className="min-w-52 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                  Estado
                </label>
                <select
                  value={order.status}
                  onChange={(event) => {
                    void updateOrderStatus(order.id, event.target.value as typeof order.status);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
