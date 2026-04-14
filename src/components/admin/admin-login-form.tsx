"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { useSiteStore } from "@/providers/site-store";

export function AdminLoginForm() {
  const router = useRouter();
  const { adminLogin } = useSiteStore();
  const [email, setEmail] = useState("admin@lacasadelpanal.com");
  const [password, setPassword] = useState("Admin123*");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const ok = await adminLogin(email, password);
    setIsSubmitting(false);

    if (!ok) {
      setError("Credenciales invalidas. Verifica el usuario administrador configurado en el servidor.");
      return;
    }

    setError("");
    router.push("/admin");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-primary">
          <LockKeyhole size={24} />
        </div>
        <h1 className="mt-4 text-center text-3xl font-black text-slate-900">Acceso administrador</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Panel protegido con autenticacion real del servidor.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            Correo
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Validando..." : "Ingresar al panel"}
          </button>
        </form>

        <div className="mt-5 rounded-2xl bg-brand-soft p-4 text-sm text-slate-700">
          <p className="font-bold text-brand-secondary">Administrador inicial</p>
          <p>Correo: admin@lacasadelpanal.com</p>
          <p>Clave: usa `ADMIN_PASSWORD` de tu entorno</p>
        </div>
      </div>
    </div>
  );
}
