"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";

import { useSiteStore } from "@/providers/site-store";

type BranchDraft = {
  id: string;
  name: string;
  address: string;
  hours: string;
  phones: string;
  locationUrl: string;
};

type Notice = { type: "success" | "error"; text: string };
type SubmitStatus = "idle" | "saving" | "success" | "error";

const BRANCHES_PER_PAGE = 4;
const createBranchId = () => `branch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const splitListInput = (value: string) =>
  value
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeLocationUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (/^(maps\.app\.goo\.gl|goo\.gl\/maps|waze\.com|www\.waze\.com|google\.com\/maps|www\.google\.com\/maps)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const isValidLocationUrl = (value: string) => {
  const normalized = normalizeLocationUrl(value);
  if (!normalized) return true;
  try {
    void new URL(normalized);
    return true;
  } catch {
    return false;
  }
};

const createBranchDraft = (branch?: {
  id: string;
  name: string;
  address: string;
  hours: string;
  phones: string[];
  locationUrl?: string;
}): BranchDraft => ({
  id: branch?.id ?? createBranchId(),
  name: branch?.name ?? "",
  address: branch?.address ?? "",
  hours: branch?.hours ?? "",
  phones: branch?.phones?.join(", ") ?? "",
  locationUrl: branch?.locationUrl ?? "",
});

export function AdminSettingsTab() {
  const { data, updateSettings } = useSiteStore();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<BranchDraft[]>(
    data.settings.branches.length > 0 ? data.settings.branches.map((branch) => createBranchDraft(branch)) : [createBranchDraft()],
  );
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
  }));

  const branchCount = useMemo(() => branches.length, [branches.length]);
  const isSaving = submitStatus === "saving";

  const [branchPage, setBranchPage] = useState(1);
  const branchTotalPages = Math.max(1, Math.ceil(branches.length / BRANCHES_PER_PAGE));
  const paginatedBranches = useMemo(
    () =>
      branches
        .map((branch, index) => ({ branch, index }))
        .slice((branchPage - 1) * BRANCHES_PER_PAGE, branchPage * BRANCHES_PER_PAGE),
    [branches, branchPage],
  );
  const goToBranchPage = (index: number) => setBranchPage(Math.floor(index / BRANCHES_PER_PAGE) + 1);

  useEffect(() => {
    if (branchPage > branchTotalPages) {
      setBranchPage(branchTotalPages);
    }
  }, [branchPage, branchTotalPages]);

  const showNotice = useCallback((nextNotice: Notice) => {
    setNotice(nextNotice);
    setSubmitStatus(nextNotice.type);
  }, []);

  useEffect(() => {
    if (!notice || notice.type !== "success") return;

    const timeout = window.setTimeout(() => {
      setNotice(null);
      setSubmitStatus("idle");
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const focusFirstInvalidField = () => {
    window.requestAnimationFrame(() => {
      const firstInvalidField = document.querySelector<HTMLElement>("[data-field-error='true']");
      firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalidField?.focus();
    });
  };

  const updateBranch = (index: number, field: keyof BranchDraft, value: string) => {
    setBranches((current) => current.map((branch, branchIndex) => (branchIndex === index ? { ...branch, [field]: value } : branch)));
    setFieldErrors((current) => {
      const errorKey = `branch-${index}-${field}`;
      if (!current[errorKey]) return current;
      const next = { ...current };
      delete next[errorKey];
      return next;
    });
  };

  const addBranch = () => {
    setBranches((current) => {
      const next = [...current, createBranchDraft()];
      goToBranchPage(next.length - 1);
      return next;
    });
  };

  const duplicateBranch = (index: number) => {
    setBranches((current) => {
      const source = current[index];
      if (!source) return current;

      const duplicate = createBranchDraft({
        id: createBranchId(),
        name: source.name,
        address: source.address,
        hours: source.hours,
        phones: splitListInput(source.phones),
        locationUrl: source.locationUrl.trim() || undefined,
      });

      goToBranchPage(index + 1);
      return [...current.slice(0, index + 1), duplicate, ...current.slice(index + 1)];
    });
  };

  const moveBranch = (index: number, direction: -1 | 1) => {
    setBranches((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      goToBranchPage(nextIndex);
      return next;
    });
  };

  const removeBranch = (index: number) => {
    setBranches((current) => {
      if (current.length <= 1) {
        return [createBranchDraft()];
      }

      return current.filter((_, branchIndex) => branchIndex !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setSubmitStatus("saving");
    setNotice(null);
    setFieldErrors({});

    const normalizedBranches = branches.map((branch) => ({
      id: branch.id || createBranchId(),
      name: branch.name.trim(),
      address: branch.address.trim(),
      hours: branch.hours.trim(),
      phones: splitListInput(branch.phones),
      locationUrl: normalizeLocationUrl(branch.locationUrl),
    }));

    const invalidBranchIndex = normalizedBranches.findIndex((branch) => !branch.name || !branch.address);
    if (invalidBranchIndex >= 0) {
      const invalidBranch = normalizedBranches[invalidBranchIndex];
      const nextErrors: Record<string, string> = {};
      if (!invalidBranch.name) {
        nextErrors[`branch-${invalidBranchIndex}-name`] = "Escribe el nombre de la sucursal.";
      }
      if (!invalidBranch.address) {
        nextErrors[`branch-${invalidBranchIndex}-address`] = "Escribe la dirección de la sucursal.";
      }
      setFieldErrors(nextErrors);
      goToBranchPage(invalidBranchIndex);
      showNotice({
        type: "error",
        text: `Revisa la sucursal ${invalidBranchIndex + 1}: necesita nombre y dirección.`,
      });
      focusFirstInvalidField();
      return;
    }

    const duplicatedNames = normalizedBranches
      .map((branch) => branch.name.toLowerCase())
      .filter(Boolean);
    if (new Set(duplicatedNames).size !== duplicatedNames.length) {
      showNotice({
        type: "error",
        text: "Hay nombres de sucursal duplicados. Revisa el listado antes de guardar.",
      });
      return;
    }

    const invalidLocationIndex = normalizedBranches.findIndex((branch) => {
      return !isValidLocationUrl(branch.locationUrl);
    });
    if (invalidLocationIndex >= 0) {
      setFieldErrors({ [`branch-${invalidLocationIndex}-locationUrl`]: "Pega un enlace completo de Google Maps o Waze." });
      goToBranchPage(invalidLocationIndex);
      showNotice({
        type: "error",
        text: `El enlace de ubicación de la sucursal ${invalidLocationIndex + 1} no es válido.`,
      });
      focusFirstInvalidField();
      return;
    }

    try {
      await updateSettings({
        businessName: settingsForm.businessName,
        email: settingsForm.email,
        whatsappNumbers: settingsForm.whatsappNumbers
          ? splitListInput(settingsForm.whatsappNumbers)
          : [],
        socialLinks: {
          instagram: settingsForm.instagram,
          facebook: settingsForm.facebook,
        },
        trustMessages: splitListInput(settingsForm.trustMessages),
        heroBanner: {
          title: settingsForm.heroTitle,
          subtitle: settingsForm.heroSubtitle,
          highlight: settingsForm.heroHighlight,
          ctaText: settingsForm.heroCta,
        },
        branches: normalizedBranches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          hours: branch.hours,
          phones: branch.phones,
          locationUrl: branch.locationUrl || undefined,
        })),
      });

      showNotice({ type: "success", text: "Cambios guardados correctamente." });
    } catch (error) {
      showNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No fue posible actualizar el contenido general.",
      });
    }
  };

  const renderSaveButton = (label = "Guardar cambios") => (
    <button
      type="submit"
      disabled={isSaving}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-75"
    >
      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {isSaving ? "Guardando..." : label}
    </button>
  );

  return (
    <>
      {notice ? (
        <div
          className="fixed right-4 top-4 z-50 w-[min(420px,calc(100vw-2rem))] animate-[settingsToastIn_180ms_ease-out] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
          role={notice.type === "error" ? "alert" : "status"}
          aria-live={notice.type === "error" ? "assertive" : "polite"}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              {notice.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900">
                {notice.type === "success" ? "Cambios guardados" : "Revisa la configuración"}
              </p>
              <p className="mt-0.5 text-sm text-slate-700">{notice.text}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setSubmitStatus("idle");
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cerrar mensaje"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {notice ? (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-brand-primary" />
          <h2 className="text-xl font-black text-slate-900">Información general y banner principal</h2>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {renderSaveButton("Guardar")}
          <div className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand-secondary">
            {branchCount} sucursales registradas
          </div>
        </div>
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
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Sucursales</h3>
            <p className="text-sm text-slate-600">
              El contador público se actualiza solo con la cantidad de sucursales guardadas.
            </p>
          </div>
          <button
            type="button"
            onClick={addBranch}
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <Plus size={16} />
            Agregar sucursal
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {paginatedBranches.map(({ branch, index }) => (
            <section key={branch.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold text-brand-primary">Sucursal {index + 1}</p>
                  <h4 className="text-lg font-black text-slate-900">{branch.name || "Nueva sucursal"}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateBranch(index)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                  >
                    <Copy size={14} />
                    Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBranch(index, -1)}
                    disabled={index === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={14} />
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBranch(index, 1)}
                    disabled={index === branches.length - 1}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown size={14} />
                    Bajar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBranch(index)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Quitar
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  value={branch.name}
                  onChange={(event) => updateBranch(index, "name", event.target.value)}
                  placeholder="Nombre de la sucursal"
                  aria-invalid={Boolean(fieldErrors[`branch-${index}-name`])}
                  data-field-error={fieldErrors[`branch-${index}-name`] ? "true" : undefined}
                  className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2 ${
                    fieldErrors[`branch-${index}-name`] ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
                  }`}
                />
                {fieldErrors[`branch-${index}-name`] ? (
                  <p className="-mt-1 text-xs font-semibold text-red-600 md:col-span-2">{fieldErrors[`branch-${index}-name`]}</p>
                ) : null}
                <textarea
                  value={branch.address}
                  onChange={(event) => updateBranch(index, "address", event.target.value)}
                  rows={2}
                  placeholder="Dirección"
                  aria-invalid={Boolean(fieldErrors[`branch-${index}-address`])}
                  data-field-error={fieldErrors[`branch-${index}-address`] ? "true" : undefined}
                  className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2 ${
                    fieldErrors[`branch-${index}-address`] ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
                  }`}
                />
                {fieldErrors[`branch-${index}-address`] ? (
                  <p className="-mt-1 text-xs font-semibold text-red-600 md:col-span-2">{fieldErrors[`branch-${index}-address`]}</p>
                ) : null}
                <input
                  value={branch.hours}
                  onChange={(event) => updateBranch(index, "hours", event.target.value)}
                  placeholder="Horario, por ejemplo Lunes a sábado 8:00 a.m. a 5:00 p.m."
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
                />
                <input
                  value={branch.phones}
                  onChange={(event) => updateBranch(index, "phones", event.target.value)}
                  placeholder="Teléfonos separados por coma, punto y coma o salto de línea"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
                />
                <input
                  value={branch.locationUrl}
                  onChange={(event) => updateBranch(index, "locationUrl", event.target.value)}
                  placeholder="Enlace directo de ubicación (opcional)"
                  aria-invalid={Boolean(fieldErrors[`branch-${index}-locationUrl`])}
                  data-field-error={fieldErrors[`branch-${index}-locationUrl`] ? "true" : undefined}
                  className={`rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2 ${
                    fieldErrors[`branch-${index}-locationUrl`] ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
                  }`}
                />
                {fieldErrors[`branch-${index}-locationUrl`] ? (
                  <p className="-mt-1 text-xs font-semibold text-red-600 md:col-span-2">{fieldErrors[`branch-${index}-locationUrl`]}</p>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        {branchTotalPages > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setBranchPage((page) => Math.max(1, page - 1))}
              disabled={branchPage === 1}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="px-2 text-sm font-semibold text-slate-600">
              Página {branchPage} de {branchTotalPages}
            </span>
            <button
              type="button"
              onClick={() => setBranchPage((page) => Math.min(branchTotalPages, page + 1))}
              disabled={branchPage === branchTotalPages}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-600">
          Los cambios se aplican al sitio público al guardar.
        </p>
        {renderSaveButton()}
      </div>
      </form>
    </>
  );
}
