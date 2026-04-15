"use client";

import { useState } from "react";
import Image from "next/image";
import { Save, Trash2 } from "lucide-react";

import { formatCurrency, slugify, withBasePath } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";
import { Product } from "@/types/site";

const emptyProductForm = {
  id: "",
  slug: "",
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  size: "",
  sizeOptions: "",
  sizeInventory: "",
  brand: "",
  pack: "",
  stock: "",
  categoryId: "",
  image: "/products/premium-care-rn.svg",
  featured: false,
  isNew: false,
  onSale: false,
};

export function AdminProductsTab() {
  const { data, deleteProduct, upsertProduct } = useSiteStore();
  const [productForm, setProductForm] = useState({
    ...emptyProductForm,
    categoryId: data.categories[0]?.id ?? "",
  });
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isEditing = Boolean(productForm.id);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.brand) {
      setNotice({ type: "error", text: "Completa nombre, precio, stock general y marca." });
      return;
    }

    const normalizedSizeOptions = productForm.sizeOptions
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    const parsedSizePackageInfo = productForm.sizeInventory
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [sizeLabel, unitsLabel] = entry.split(":").map((value) => value.trim());
        if (!sizeLabel) return null;
        return { size: sizeLabel, units: Math.max(0, Number(unitsLabel) || 0) };
      })
      .filter((entry): entry is { size: string; units: number } => Boolean(entry));

    const finalSizeOptions =
      parsedSizePackageInfo.length > 0
        ? parsedSizePackageInfo.map((entry) => entry.size)
        : normalizedSizeOptions.length > 0
          ? normalizedSizeOptions
          : [productForm.size || "Única"];

    const defaultSize = productForm.size || finalSizeOptions[0] || "Única";
    const computedStock = Math.max(0, Number(productForm.stock) || 0);
    const currentSortOrder =
      data.products.find((item) => item.id === productForm.id)?.sortOrder ??
      data.products.length + 1;

    try {
      await upsertProduct({
        id: productForm.id,
        slug: productForm.slug || slugify(productForm.name),
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        size: defaultSize,
        sizeOptions: finalSizeOptions,
        sizePackageInfo: parsedSizePackageInfo,
        sortOrder: currentSortOrder,
        brand: productForm.brand,
        pack: productForm.pack,
        stock: computedStock,
        categoryId: productForm.categoryId,
        image: productForm.image,
        featured: productForm.featured,
        isNew: productForm.isNew,
        onSale: productForm.onSale,
        tags: [productForm.brand, defaultSize, ...finalSizeOptions, productForm.pack].filter(Boolean),
      } as Product);

      setProductForm({ ...emptyProductForm, categoryId: data.categories[0]?.id ?? "" });
      setNotice({
        type: "success",
        text: isEditing ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No fue posible guardar el producto.",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotice({ type: "error", text: "La imagen supera 2 MB. Usa una más liviana para la demo." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setNotice({ type: "error", text: "No se pudo procesar la imagen seleccionada." });
        return;
      }
      setProductForm((current) => ({ ...current, image: reader.result as string }));
      setNotice({ type: "success", text: `Imagen cargada: ${file.name}` });
    };
    reader.onerror = () => {
      setNotice({ type: "error", text: "Ocurrió un error al leer el archivo." });
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      {notice ? (
        <div
          className={`lg:col-span-2 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
        >
          {notice.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Estás modificando un producto existente. Pulsa «Crear nuevo» para cancelar la edición."
                : "Completa el formulario para crear un producto nuevo."}
            </p>
          </div>
          {isEditing ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              Modo edición
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={productForm.name}
            onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nombre del producto"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <textarea
            value={productForm.description}
            onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
            rows={3}
            placeholder="Descripción"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={productForm.brand}
              onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))}
              placeholder="Marca"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
            <input
              value={productForm.size}
              onChange={(event) => setProductForm((current) => ({ ...current, size: event.target.value }))}
              placeholder="Talla predeterminada"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
          </div>
          <input
            value={productForm.sizeOptions}
            onChange={(event) => setProductForm((current) => ({ ...current, sizeOptions: event.target.value }))}
            placeholder="Tallas disponibles: RN, S, M, L"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <textarea
            value={productForm.sizeInventory}
            onChange={(event) => setProductForm((current) => ({ ...current, sizeInventory: event.target.value }))}
            rows={3}
            placeholder="Unidades por paquete según talla: M:50, L:46, XL:44"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.01"
              value={productForm.price}
              onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
              placeholder="Precio"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
            <input
              type="number"
              value={productForm.stock}
              onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
              placeholder="Stock en bodega"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={productForm.pack}
              onChange={(event) => setProductForm((current) => ({ ...current, pack: event.target.value }))}
              placeholder="Presentación"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
            <input
              type="number"
              step="0.01"
              value={productForm.originalPrice}
              onChange={(event) => setProductForm((current) => ({ ...current, originalPrice: event.target.value }))}
              placeholder="Precio anterior"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
          </div>
          <select
            value={productForm.categoryId}
            onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
          >
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="space-y-3 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-900">Imagen del producto</p>
              <p className="text-xs text-slate-500">
                Pega una ruta/URL o sube la imagen desde tu computadora.
              </p>
            </div>
            <input
              value={productForm.image}
              onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
              placeholder="Ruta o URL de imagen"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary"
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleImageUpload}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-primary file:px-3 file:py-2 file:font-bold file:text-white"
            />
            {productForm.image ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Vista previa
                </p>
                <Image
                  src={withBasePath(productForm.image)}
                  alt={productForm.name || "Vista previa del producto"}
                  width={320}
                  height={160}
                  unoptimized
                  className="h-32 w-full rounded-2xl object-contain"
                />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))}
              />
              Destacado
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
              <input
                type="checkbox"
                checked={productForm.isNew}
                onChange={(event) => setProductForm((current) => ({ ...current, isNew: event.target.checked }))}
              />
              Nuevo
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
              <input
                type="checkbox"
                checked={productForm.onSale}
                onChange={(event) => setProductForm((current) => ({ ...current, onSale: event.target.checked }))}
              />
              Oferta
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"
            >
              <Save size={16} />
              {isEditing ? "Actualizar" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setProductForm({ ...emptyProductForm, categoryId: data.categories[0]?.id ?? "" });
                if (isEditing) {
                  setNotice({
                    type: "success",
                    text: "Formulario reiniciado. El siguiente guardado creará un producto nuevo.",
                  });
                }
              }}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              {isEditing ? "Crear nuevo" : "Limpiar"}
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-900">Listado de productos</h2>
        <div className="mt-4 space-y-3">
          {data.products.map((product) => (
            <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Image
                    src={withBasePath(product.image)}
                    alt={product.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-contain p-1"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">
                      {product.brand} · Tallas{" "}
                      {product.sizeOptions?.length ? product.sizeOptions.join(", ") : product.size} ·{" "}
                      {product.pack} · Stock {product.stock}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.sizePackageInfo
                        ?.map((item) => `${item.size}: ${item.units} und/paq`)
                        .join(" · ") || "Sin info de unidades por talla."}
                    </p>
                    <p className="text-sm font-semibold text-brand-secondary">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        description: product.description,
                        price: String(product.price),
                        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
                        size: product.size,
                        sizeOptions: product.sizeOptions?.join(", ") || product.size,
                        sizeInventory:
                          product.sizePackageInfo?.map((item) => `${item.size}:${item.units}`).join(", ") || "",
                        brand: product.brand,
                        pack: product.pack,
                        stock: String(product.stock),
                        categoryId: product.categoryId,
                        image: product.image,
                        featured: Boolean(product.featured),
                        isNew: Boolean(product.isNew),
                        onSale: Boolean(product.onSale),
                      })
                    }
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar ${product.name}?`)) {
                        void deleteProduct(product.id);
                        setNotice({ type: "success", text: "Producto eliminado." });
                      }
                    }}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600"
                  >
                    <Trash2 size={14} className="inline-block" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
