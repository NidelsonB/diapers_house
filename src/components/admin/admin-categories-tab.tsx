"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import { slugify } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

const emptyCategoryForm = {
  id: "",
  slug: "",
  name: "",
  description: "",
  icon: "🍼",
};

export function AdminCategoriesTab() {
  const { data, deleteCategory, upsertCategory } = useSiteStore();
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!categoryForm.name || !categoryForm.description) {
      setNotice({ type: "error", text: "Completa nombre y descripción de la categoría." });
      return;
    }

    try {
      await upsertCategory({
        id: categoryForm.id,
        slug: categoryForm.slug || slugify(categoryForm.name),
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon || "🍼",
      });

      setCategoryForm(emptyCategoryForm);
      setNotice({ type: "success", text: "Categoría guardada correctamente." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No fue posible guardar la categoría.",
      });
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {notice ? (
        <div
          className={`lg:col-span-2 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
        >
          {notice.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-900">Gestionar categorías</h2>
        <div className="mt-4 space-y-3">
          <input
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nombre"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <input
            value={categoryForm.icon}
            onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))}
            placeholder="Icono o emoji"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <textarea
            value={categoryForm.description}
            onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
            rows={3}
            placeholder="Descripción"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"
            >
              <Save size={16} /> Guardar
            </button>
            <button
              type="button"
              onClick={() => setCategoryForm(emptyCategoryForm)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-900">Categorías registradas</h2>
        <div className="mt-4 space-y-3">
          {data.categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {category.icon} {category.name}
                </p>
                <p className="text-sm text-slate-600">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCategoryForm({
                      id: category.id,
                      slug: category.slug,
                      name: category.name,
                      description: category.description,
                      icon: category.icon,
                    })
                  }
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={data.categories.length === 1}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar la categoría ${category.name}?`)) {
                      void deleteCategory(category.id);
                      setNotice({ type: "success", text: "Categoría eliminada." });
                    }
                  }}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
