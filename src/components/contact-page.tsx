"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import { useSiteStore } from "@/providers/site-store";

export function ContactPage() {
  const { data } = useSiteStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Contacto</p>
        <h1 className="text-4xl font-black text-slate-900">Estamos para ayudarte</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Usa esta página para mostrar sucursales, medios de contacto y atención personalizada dentro de la misma plataforma.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] bg-slate-50 p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-brand-soft p-3 text-brand-primary"><Phone size={18} /></div>
            <h2 className="font-bold text-slate-900">WhatsApp</h2>
            <p className="mt-2 text-sm text-slate-600">{data.settings.whatsappNumbers.join(" · ")}</p>
          </article>
          <article className="rounded-[24px] bg-slate-50 p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-brand-soft p-3 text-brand-primary"><Mail size={18} /></div>
            <h2 className="font-bold text-slate-900">Correo</h2>
            <p className="mt-2 text-sm text-slate-600">{data.settings.email}</p>
          </article>
          <article className="rounded-[24px] bg-slate-50 p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-brand-soft p-3 text-brand-primary"><MapPin size={18} /></div>
            <h2 className="font-bold text-slate-900">Cobertura</h2>
            <p className="mt-2 text-sm text-slate-600">Elige la sucursal que mejor te quede para comprar o consultar.</p>
          </article>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Sucursales</p>
          <h2 className="text-3xl font-black text-slate-900">Puntos de atención</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.settings.branches.map((branch) => (
            <article key={branch.id} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-bold text-slate-900">{branch.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{branch.address}</p>
              <p className="mt-2 text-sm font-semibold text-brand-primary">{branch.hours}</p>
              <p className="mt-3 text-sm text-slate-600">Teléfonos: {branch.phones.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
