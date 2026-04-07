"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

export function CheckoutPage() {
  const { cartItemsDetailed, cartTotal, createOrder, data } = useSiteStore();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    branch: data.settings.branches[0]?.name ?? "",
    address: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const whatsappUrl = useMemo(() => {
    if (!orderId) return "#";
    return buildWhatsAppLink(
      data.settings.whatsappNumbers[0] ?? "7726-4949",
      `Hola, acabo de crear el pedido ${orderId} por ${formatCurrency(confirmedTotal)}. Quiero confirmar la compra.`,
    );
  }, [confirmedTotal, data.settings.whatsappNumbers, orderId]);

  if (orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <div className="rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-900">¡Pedido creado con éxito!</h1>
          <p className="mt-3 text-slate-600">
            Tu número de referencia es <strong>{orderId}</strong>. Hemos recibido tu solicitud y te contactaremos para confirmarla.
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-secondary">
            Total confirmado: {formatCurrency(confirmedTotal)}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white"
            >
              Confirmar por WhatsApp
            </a>
            <Link href="/catalogo" className="inline-flex justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItemsDetailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
        <h1 className="text-3xl font-black text-slate-900">No hay productos para procesar</h1>
        <p className="mt-3 text-slate-600">Agrega artículos al carrito antes de completar el checkout.</p>
        <Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-white">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customerName || !form.phone || !form.branch || !form.address) {
      setError("Completa nombre, teléfono, sucursal y dirección/indicaciones.");
      return;
    }

    setError("");
    const totalAtCheckout = cartTotal;
    const result = createOrder(form);
    if (result.success) {
      setConfirmedTotal(totalAtCheckout);
      setOrderId(result.orderId);
      return;
    }

    setError(result.error || "No fue posible confirmar el pedido por disponibilidad.");
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-6">
      <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Checkout</p>
        <h1 className="text-4xl font-black text-slate-900">Finaliza tu compra</h1>
        <p className="mt-2 text-slate-600">Flujo claro, rápido y listo para presentación comercial.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Nombre completo
              <input
                value={form.customerName}
                onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Teléfono
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Sucursal preferida
            <select
              value={form.branch}
              onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
            >
              {data.settings.branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Dirección o indicaciones de entrega
            <textarea
              rows={3}
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Notas adicionales
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button type="submit" className="inline-flex rounded-full bg-brand-accent px-5 py-3 text-sm font-bold text-brand-secondary">
            Confirmar pedido
          </button>
        </form>
      </section>

      <aside className="h-fit rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-900">Resumen de compra</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {cartItemsDetailed.map((item) => (
            <div key={item.cartKey} className="flex justify-between gap-3">
              <span>{item.quantity} × {item.product.name} · Talla {item.selectedSize} · Paquete x{item.selectedPackUnits}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
