"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeDollarSign, ChevronRight, HeartHandshake, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { withBasePath } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

const benefitItems = [
  {
    title: "Entrega rápida",
    description: "Preparamos pedidos con agilidad para que nunca te falte lo esencial.",
    icon: Truck,
  },
  {
    title: "Productos originales",
    description: "Trabajamos con marcas reconocidas y calidad confiable para tu bebé.",
    icon: ShieldCheck,
  },
  {
    title: "Precios competitivos",
    description: "Ofertas y presentaciones ideales para compras frecuentes.",
    icon: BadgeDollarSign,
  },
  {
    title: "Atención personalizada",
    description: "Te orientamos según talla, etapa del bebé y presupuesto.",
    icon: HeartHandshake,
  },
];

const faqs = [
  {
    question: "¿Puedo pedir por WhatsApp además de la web?",
    answer: "Sí. El sitio está listo para compra directa y también para cerrar pedidos por WhatsApp.",
  },
  {
    question: "¿Cómo sé qué talla elegir?",
    answer: "Cada producto muestra talla, marca y presentación. Además, puedes contactarnos para asesoría rápida.",
  },
  {
    question: "¿Qué pasa si necesito ayuda para elegir?",
    answer: "Puedes escribirnos por WhatsApp y te orientamos según la talla, etapa y necesidad de tu bebé.",
  },
];

export function HomePage() {
  const { data } = useSiteStore();
  const featuredProducts = data.products.filter((product) => product.featured).slice(0, 4);
  const offerProducts = data.products.filter((product) => product.onSale).slice(0, 3);

  return (
    <div className="pb-16">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-14">
        <div className="space-y-6">
          <div className="inline-flex rounded-full bg-brand-soft px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">
            Compra fácil y segura
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              {data.settings.heroBanner.title}
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">{data.settings.heroBanner.subtitle}</p>
            <p className="inline-flex rounded-full bg-brand-accent px-4 py-2 text-sm font-bold text-brand-secondary">
              {data.settings.heroBanner.highlight}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              {data.settings.heroBanner.ctaText}
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
            >
              Ver sucursales
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {data.settings.trustMessages.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#442e75_0%,#29326d_55%,#fdf90f_120%)] p-4 shadow-xl">
          <div className="rounded-[24px] bg-white/95 p-5">
            <Image
              src={withBasePath("/brand/panalin.jpeg")}
              alt="Mascota oficial Pañalín de La Casa del Pañal"
              width={768}
              height={1365}
              className="mx-auto h-auto w-full max-w-sm"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {benefitItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex rounded-2xl bg-brand-soft p-3 text-brand-primary">
                  <Icon size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Categorías</p>
            <h2 className="text-3xl font-black text-slate-900">Explora por necesidad</h2>
          </div>
          <Link href="/catalogo" className="text-sm font-bold text-brand-primary">
            Ver todo →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {data.categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?categoria=${category.slug}`}
              className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-3xl">{category.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Destacados</p>
            <h2 className="text-3xl font-black text-slate-900">Productos favoritos</h2>
          </div>
          <Link href="/catalogo" className="text-sm font-bold text-brand-primary">
            Ir al catálogo →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="rounded-[32px] bg-brand-secondary p-6 text-white md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-accent">Ofertas</p>
              <h2 className="text-3xl font-black">Compra inteligente para el hogar</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-200">
              Packs jumbo, promociones semanales y productos nuevos para ayudarte a ahorrar en cada compra.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-2 md:px-6">
        <article className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Sobre nosotros</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">Una tienda confiable para familias reales</h2>
          <p className="mt-4 text-slate-600">
            La Casa del Pañal está pensada para brindar una experiencia cercana, rápida y clara. El diseño combina calidez, orden visual y llamados a la acción bien visibles para facilitar la compra.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            <li>• Plataforma responsive para móvil, tablet y escritorio.</li>
            <li>• Catálogo con filtros, búsqueda y fichas completas de producto.</li>
            <li>• Compra rápida, clara y pensada para familias ocupadas.</li>
          </ul>
        </article>

        <article className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Preguntas frecuentes</p>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-bold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
