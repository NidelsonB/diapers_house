"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2, MapPin, Menu, MessageCircle, Phone, Share2, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";

import { buildWhatsAppLink } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

const navigation = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, data } = useSiteStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const whatsappUrl = useMemo(
    () =>
      buildWhatsAppLink(
        data.settings.whatsappNumbers[0] ?? "7726-4949",
        "Hola, quiero información sobre pañales y promociones disponibles.",
      ),
    [data.settings.whatsappNumbers],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/logo-badge.svg"
              alt="La Casa del Pañal"
              width={48}
              height={48}
              className="rounded-2xl"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">La Casa</p>
              <p className="text-lg font-extrabold text-brand-secondary">del Pañal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/carrito"
              className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
            >
              <ShoppingCart size={17} />
              <span className="hidden sm:inline">Carrito</span>
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-brand-accent px-2 py-0.5 text-xs font-bold text-brand-secondary">
                {cartCount}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex rounded-full border border-slate-200 p-2 md:hidden"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr_1fr] md:px-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/brand/logo-badge.svg" alt="Logo" width={42} height={42} />
              <div>
                <h3 className="text-xl font-extrabold text-brand-secondary">{data.settings.businessName}</h3>
                <p className="text-sm text-slate-600">Tienda online pensada para familias.</p>
              </div>
            </div>
            <p className="max-w-md text-sm text-slate-600">
              Una experiencia de compra clara, rápida y confiable para pañales, toallitas y productos esenciales del bebé.
            </p>
            <div className="flex gap-3">
              <a
                href={data.settings.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                aria-label="Instagram"
              >
                <Globe2 size={18} />
              </a>
              <a
                href={data.settings.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                aria-label="Facebook"
              >
                <Share2 size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-extrabold uppercase tracking-[0.25em] text-brand-primary">Contacto</h4>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Phone size={16} className="text-brand-primary" /> {data.settings.whatsappNumbers.join(" · ")}</p>
              <p>{data.settings.email}</p>
              <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-brand-primary" /> Varias sucursales disponibles</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-extrabold uppercase tracking-[0.25em] text-brand-primary">Sucursales</h4>
            <div className="space-y-3 text-sm text-slate-600">
              {data.settings.branches.slice(0, 3).map((branch) => (
                <div key={branch.id} className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-900">{branch.name}</p>
                  <p>{branch.address}</p>
                  <p>{branch.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500">
          © 2026 {data.settings.businessName}. Compra fácil, rápida y confiable para tu familia.
        </div>
      </footer>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chatear por WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex h-15 w-15 items-center justify-center rounded-full border-4 border-white bg-[#25D366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.38)] transition hover:scale-105"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
