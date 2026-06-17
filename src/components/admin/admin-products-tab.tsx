"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Save, Search, Trash2, X } from "lucide-react";

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
  brand: "",
  pack: "",
  stock: "",
  categoryId: "",
  image: "/products/premium-care-rn.svg",
  featured: false,
  isNew: false,
  onSale: false,
};

type ProductForm = typeof emptyProductForm;
type SizeRow = { size: string; units: string };
type SizeValidationResult =
  | { error: string }
  | { rows: Array<{ size: string; units: number }> };

const initialSizeRows: SizeRow[] = [{ size: "Única", units: "" }];

const extractPackUnits = (pack: string) => {
  const match = pack.match(/\d+/);
  return match ? String(Number(match[0])) : "";
};

const getPresentationLabel = (product: Product) => {
  if (product.sizePackageInfo?.length) {
    return product.sizePackageInfo.map((item) => `${item.size}: ${item.units} und/paq`).join(" · ");
  }

  return product.pack || "Sin presentación configurada.";
};

export function AdminProductsTab() {
  const { data, deleteProduct, upsertProduct } = useSiteStore();
  const [productForm, setProductForm] = useState<ProductForm>({
    ...emptyProductForm,
    categoryId: data.categories[0]?.id ?? "",
  });
  const [search, setSearch] = useState("");
  const [sizeRows, setSizeRows] = useState<SizeRow[]>(initialSizeRows);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isEditing = Boolean(editingProductId);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return data.products;
    }

    return data.products.filter((product) => {
      const presentation = getPresentationLabel(product);
      const searchableText = [
        product.name,
        product.brand,
        product.description,
        product.size,
        product.pack,
        presentation,
        product.sizeOptions?.join(" "),
        product.sizePackageInfo?.map((item) => `${item.size} ${item.units}`).join(" "),
        product.tags?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [data.products, normalizedSearch]);

  const resetProductForm = useCallback(() => {
    setProductForm({
      ...emptyProductForm,
      categoryId: data.categories[0]?.id ?? "",
    });
    setSizeRows(initialSizeRows);
    setEditingProductId(null);
  }, [data.categories]);

  const openNewProductModal = () => {
    resetProductForm();
    setNotice(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    const fallbackUnits = extractPackUnits(product.pack);
    const rowsFromPackageInfo =
      product.sizePackageInfo?.map((item) => ({ size: item.size, units: String(item.units) })) ?? [];
    const rowsFromOptions =
      product.sizeOptions?.map((size) => ({ size, units: fallbackUnits })) ?? [];
    const nextSizeRows =
      rowsFromPackageInfo.length > 0
        ? rowsFromPackageInfo
        : rowsFromOptions.length > 0
          ? rowsFromOptions
          : [{ size: product.size || "Única", units: fallbackUnits }];

    setProductForm({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      brand: product.brand,
      pack: product.pack,
      stock: String(product.stock),
      categoryId: product.categoryId,
      image: product.image,
      featured: Boolean(product.featured),
      isNew: Boolean(product.isNew),
      onSale: Boolean(product.onSale),
    });
    setSizeRows(nextSizeRows);
    setEditingProductId(product.id);
    setNotice(null);
    setIsProductModalOpen(true);
  };

  const closeProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    resetProductForm();
  }, [resetProductForm]);

  useEffect(() => {
    if (!isProductModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProductModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeProductModal, isProductModalOpen]);

  const updateSizeRow = (index: number, field: keyof SizeRow, value: string) => {
    setSizeRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  };

  const addSizeRow = () => {
    setSizeRows((current) => [...current, { size: "", units: "" }]);
  };

  const removeSizeRow = (index: number) => {
    setSizeRows((current) => {
      const nextRows = current.filter((_, rowIndex) => rowIndex !== index);
      return nextRows.length > 0 ? nextRows : initialSizeRows;
    });
  };

  const validateSizeRows = (): SizeValidationResult => {
    const normalizedRows = sizeRows.map((row) => ({
      size: row.size.trim(),
      units: row.units.trim(),
    }));

    if (normalizedRows.some((row) => !row.size)) {
      return { error: "Todas las filas de presentación necesitan una talla." };
    }

    if (normalizedRows.some((row) => row.units === "" || Number(row.units) < 0 || !Number.isFinite(Number(row.units)))) {
      return { error: "Todas las tallas necesitan unidades por paquete válidas." };
    }

    const normalizedNames = normalizedRows.map((row) => row.size.toLowerCase());
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      return { error: "Hay tallas duplicadas. Deja una sola fila por talla." };
    }

    return {
      rows: normalizedRows.map((row) => ({
        size: row.size,
        units: Math.max(0, Math.trunc(Number(row.units))),
      })),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.brand || !productForm.categoryId) {
      setNotice({ type: "error", text: "Completa nombre, precio, stock general, marca y categoría." });
      return;
    }

    const validatedRows = validateSizeRows();
    if ("error" in validatedRows) {
      setNotice({ type: "error", text: validatedRows.error });
      return;
    }

    const computedStock = Math.max(0, Math.trunc(Number(productForm.stock) || 0));
    const finalSizeOptions = validatedRows.rows.map((row) => row.size);
    const defaultSize = finalSizeOptions[0] || "Única";
    const fallbackPack =
      productForm.pack.trim() ||
      (validatedRows.rows[0]?.units ? `${validatedRows.rows[0].units} unidades` : "Por talla");
    const currentSortOrder =
      data.products.find((item) => item.id === editingProductId)?.sortOrder ?? data.products.length + 1;

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
        sizePackageInfo: validatedRows.rows,
        sortOrder: currentSortOrder,
        brand: productForm.brand,
        pack: fallbackPack,
        stock: computedStock,
        categoryId: productForm.categoryId,
        image: productForm.image,
        featured: productForm.featured,
        isNew: productForm.isNew,
        onSale: productForm.onSale,
        tags: [productForm.brand, defaultSize, ...finalSizeOptions, fallbackPack].filter(Boolean),
      } as Product);

      setNotice({
        type: "success",
        text: isEditing ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      });
      closeProductModal();
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
    <section className="space-y-6">
      {notice ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Productos</h2>
            <p className="mt-1 text-sm text-slate-600">
              Crea y edita productos en un popup. Las unidades por paquete se definen por talla.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewProductModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Listado de productos</h2>
            <p className="text-sm text-slate-600">
              {filteredProducts.length} de {data.products.length} productos visibles.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="relative block">
            <span className="sr-only">Buscar producto en admin</span>
            <Search className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, marca, talla o presentación"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-brand-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            ) : null}
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
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
                        {product.brand} · Tallas {product.sizeOptions?.length ? product.sizeOptions.join(", ") : product.size} · Stock{" "}
                        {product.stock}
                      </p>
                      <p className="text-xs text-slate-500">{getPresentationLabel(product)}</p>
                      <p className="text-sm font-semibold text-brand-secondary">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditProductModal(product)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
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
                      className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} className="inline-block" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {search ? "No hay productos que coincidan con esa búsqueda." : "No hay productos registrados todavía."}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {search ? "Prueba con otro nombre, marca, talla o presentación." : "Crea el primer producto para empezar a llenar el catálogo."}
              </p>
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                >
                  Limpiar búsqueda
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {isProductModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProductModal();
          }}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 md:px-6">
              <div>
                <h2 id="product-modal-title" className="text-xl font-black text-slate-900">
                  {isEditing ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Configura datos, precios y unidades por paquete según talla.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                aria-label="Cerrar popup de producto"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(92vh-89px)] overflow-y-auto p-5 md:p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                  <fieldset className="rounded-2xl border border-slate-200 p-4">
                    <legend className="px-2 text-sm font-black text-slate-900">Datos principales</legend>
                    <div className="mt-3 space-y-3">
                      <input
                        value={productForm.name}
                        onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Nombre del producto"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          value={productForm.brand}
                          onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))}
                          placeholder="Marca"
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
                        />
                        <select
                          value={productForm.categoryId}
                          onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
                        >
                          {data.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={productForm.description}
                        onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                        rows={3}
                        placeholder="Descripción"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="rounded-2xl border border-slate-200 p-4">
                    <legend className="px-2 text-sm font-black text-slate-900">Precio e inventario</legend>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
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
                        step="0.01"
                        value={productForm.originalPrice}
                        onChange={(event) => setProductForm((current) => ({ ...current, originalPrice: event.target.value }))}
                        placeholder="Precio anterior"
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
                  </fieldset>

                  <fieldset className="rounded-2xl border border-slate-200 p-4">
                    <legend className="px-2 text-sm font-black text-slate-900">Tallas y presentación</legend>
                    <p className="mt-2 text-sm text-slate-600">
                      La presentación real se calcula por talla. El campo general queda como respaldo para productos antiguos o sin tallas.
                    </p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                          <tr>
                            <th className="py-2 pr-3">Talla</th>
                            <th className="py-2 pr-3">Unidades por paquete</th>
                            <th className="w-12 py-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sizeRows.map((row, index) => (
                            <tr key={`${index}-${row.size}`}>
                              <td className="py-2 pr-3">
                                <input
                                  value={row.size}
                                  onChange={(event) => updateSizeRow(index, "size", event.target.value)}
                                  placeholder="M, L, XL..."
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-primary"
                                />
                              </td>
                              <td className="py-2 pr-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={row.units}
                                  onChange={(event) => updateSizeRow(index, "units", event.target.value)}
                                  placeholder="50"
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-primary"
                                />
                              </td>
                              <td className="py-2">
                                <button
                                  type="button"
                                  onClick={() => removeSizeRow(index)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
                                  aria-label={`Quitar talla ${row.size || index + 1}`}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 md:flex-row">
                      <button
                        type="button"
                        onClick={addSizeRow}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                      >
                        <Plus size={16} />
                        Agregar talla
                      </button>
                      <input
                        value={productForm.pack}
                        onChange={(event) => setProductForm((current) => ({ ...current, pack: event.target.value }))}
                        placeholder="Presentación general de respaldo"
                        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
                      />
                    </div>
                  </fieldset>
                </div>

                <aside className="space-y-5">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-900">Imagen del producto</p>
                    <p className="mt-1 text-xs text-slate-500">Pega una ruta/URL o sube la imagen desde tu computadora.</p>
                    <input
                      value={productForm.image}
                      onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
                      placeholder="Ruta o URL de imagen"
                      className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary"
                    />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleImageUpload}
                      className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-primary file:px-3 file:py-2 file:font-bold file:text-white"
                    />
                    {productForm.image ? (
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vista previa</p>
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

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-black text-slate-900">Etiquetas del producto</p>
                    <div className="mt-3 space-y-2 text-sm">
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
                  </div>
                </aside>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <Save size={16} />
                  {isEditing ? "Actualizar producto" : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
