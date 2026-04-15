import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Error 404</p>
      <h1 className="mt-3 text-5xl font-black text-slate-900">Página no encontrada</h1>
      <p className="mt-4 max-w-md mx-auto text-slate-600">
        La página que buscas no existe o fue movida. Revisa la URL o regresa al catálogo.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          Ver catálogo
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
