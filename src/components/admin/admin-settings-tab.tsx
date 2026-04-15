"use client";

import { useState } from "react";
import { Save, Settings2 } from "lucide-react";

import { useSiteStore } from "@/providers/site-store";

export function AdminSettingsTab() {
  const { data, updateSettings } = useSiteStore();
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [settingsForm, setSettingsForm] = useState(() => ({
    businessName: data.settings.businessName,
    email: data.settings.email,
    whatsappNumbers: data.settings.whatsappNumbers.join(", "),
    instagram: data.settings.socialLinks.instagram,
    facebook: data.settings.socialLinks.facebook,
    heroTitle: data.settings.heroBanner.title,
    heroSubtitle: data.settings.heroBanner.subtitle,
    heroHighlight: data.settings.heroBanner.highlight,
    heroCta: data.settings.heroBanner.ctaText,
    trustMessages: data.settings.trustMessages.join(", "),
    branchesText: data.settings.branches
      .map((branch) =>
        [branch.name, branch.address, branch.hours, branch.phones.join(", ")].join(" | "),
      )
      .join("\n"),
  }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedBranches = settingsForm.branchesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [name, address, hours, phones] = line.split("|").map((item) => item.trim());
        return {
          id: `branch-${index + 1}`,
          name: name || `Sucursal ${index + 1}`,
          address: address || "",
          hours: hours || "",
          phones: phones
            ? phones
                .split(",")
                .map((phone) => phone.trim())
                .filter(Boolean)
            : [],
        };
      });

    try {
      await updateSettings({
        businessName: settingsForm.businessName,
        email: settingsForm.email,
        whatsappNumbers: settingsForm.whatsappNumbers
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        socialLinks: {
          instagram: settingsForm.instagram,
          facebook: settingsForm.facebook,
        },
        trustMessages: settingsForm.trustMessages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        heroBanner: {
          title: settingsForm.heroTitle,
          subtitle: settingsForm.heroSubtitle,
          highlight: settingsForm.heroHighlight,
          ctaText: settingsForm.heroCta,
        },
        branches: parsedBranches,
      });

      setNotice({ type: "success", text: "Contenido general actualizado." });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No fue posible actualizar el contenido general.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {notice ? (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-2">
        <Settings2 size={18} className="text-brand-primary" />
        <h2 className="text-xl font-black text-slate-900">Información general y banner principal</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={settingsForm.businessName}
          onChange={(event) => setSettingsForm((current) => ({ ...current, businessName: event.target.value }))}
          placeholder="Nombre del negocio"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={settingsForm.email}
          onChange={(event) => setSettingsForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Correo"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={settingsForm.whatsappNumbers}
          onChange={(event) => setSettingsForm((current) => ({ ...current, whatsappNumbers: event.target.value }))}
          placeholder="WhatsApp separados por coma"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2"
        />
        <input
          value={settingsForm.instagram}
          onChange={(event) => setSettingsForm((current) => ({ ...current, instagram: event.target.value }))}
          placeholder="Instagram URL"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={settingsForm.facebook}
          onChange={(event) => setSettingsForm((current) => ({ ...current, facebook: event.target.value }))}
          placeholder="Facebook URL"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={settingsForm.heroTitle}
          onChange={(event) => setSettingsForm((current) => ({ ...current, heroTitle: event.target.value }))}
          placeholder="Título del hero"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2"
        />
        <textarea
          value={settingsForm.heroSubtitle}
          onChange={(event) => setSettingsForm((current) => ({ ...current, heroSubtitle: event.target.value }))}
          rows={3}
          placeholder="Subtítulo del hero"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2"
        />
        <input
          value={settingsForm.heroHighlight}
          onChange={(event) => setSettingsForm((current) => ({ ...current, heroHighlight: event.target.value }))}
          placeholder="Texto destacado"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={settingsForm.heroCta}
          onChange={(event) => setSettingsForm((current) => ({ ...current, heroCta: event.target.value }))}
          placeholder="CTA principal"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={settingsForm.trustMessages}
          onChange={(event) => setSettingsForm((current) => ({ ...current, trustMessages: event.target.value }))}
          placeholder="Mensajes de confianza separados por coma"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2"
        />
        <textarea
          value={settingsForm.branchesText}
          onChange={(event) => setSettingsForm((current) => ({ ...current, branchesText: event.target.value }))}
          rows={6}
          placeholder="Una sucursal por línea: Nombre | Dirección | Horario | Tel1, Tel2"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2"
        />
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"
      >
        <Save size={16} /> Guardar cambios
      </button>
    </form>
  );
}
