"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  FolderTree,
  LayoutTemplate,
  LogOut,
  PackageSearch,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";

import { formatCurrency, orderStatuses, slugify, withBasePath } from "@/lib/utils";
import { useSiteStore } from "@/providers/site-store";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Productos", icon: PackageSearch },
  { id: "categories", label: "Categorías", icon: FolderTree },
  { id: "orders", label: "Pedidos", icon: ClipboardList },
  { id: "content", label: "Contenido", icon: LayoutTemplate },
];

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

const emptyCategoryForm = {
  id: "",
  slug: "",
  name: "",
  description: "",
  icon: "🍼",
};

export function AdminPanel() {
  const router = useRouter();
  const {
    data,
    deleteCategory,
    deleteProduct,
    isAdminAuthenticated,
    isReady,
    adminLogout,
    resetDemoData,
    updateOrderStatus,
    updateSettings,
    upsertCategory,
    upsertProduct,
  } = useSiteStore();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [productForm, setProductForm] = useState({
    ...emptyProductForm,
    categoryId: data.categories[0]?.id ?? "",
  });
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
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
      .map((branch) => [branch.name, branch.address, branch.hours, branch.phones.join(", ")].join(" | "))
      .join("\n"),
  }));

  useEffect(() => {
    if (isReady && !isAdminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, isReady, router]);

  const isEditingProduct = Boolean(productForm.id);


  const metrics = useMemo(
    () => [
      { label: "Productos", value: String(data.products.length) },
      { label: "Categorías", value: String(data.categories.length) },
      { label: "Pedidos", value: String(data.orders.length) },
      {
        label: "Stock bajo",
        value: String(data.products.filter((product) => product.stock <= 12).length),
      },
    ],
    [data.categories.length, data.orders.length, data.products],
  );

  if (!isReady || !isAdminAuthenticated) {
    return <div className="px-4 py-16 text-center text-slate-600">Cargando panel...</div>;
  }

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

        return {
          size: sizeLabel,
          units: Math.max(0, Number(unitsLabel) || 0),
        };
      })
      .filter((entry): entry is { size: string; units: number } => Boolean(entry));

    const finalSizeOptions = parsedSizePackageInfo.length > 0
      ? parsedSizePackageInfo.map((entry) => entry.size)
      : normalizedSizeOptions.length > 0
        ? normalizedSizeOptions
        : [productForm.size || "Única"];

    const defaultSize = productForm.size || finalSizeOptions[0] || "Única";
    const computedStock = Math.max(0, Number(productForm.stock) || 0);
    const currentSortOrder = data.products.find((item) => item.id === productForm.id)?.sortOrder ?? data.products.length + 1;

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
      });

      setProductForm({ ...emptyProductForm, categoryId: data.categories[0]?.id ?? "" });
      setNotice({
        type: "success",
        text: isEditingProduct ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No fue posible guardar el producto.",
      });
    }
  };

  const handleProductImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

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

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();



    if (!categoryForm.name || !categoryForm.description) {

      setNotice({ type: "error", text: "Completa nombre y descripci?n de la categor?a." });

      return;

    }



    try {

      await upsertCategory({

        id: categoryForm.id,

        slug: categoryForm.slug || slugify(categoryForm.name),

        name: categoryForm.name,

        description: categoryForm.description,

        icon: categoryForm.icon || "??",

      });



      setCategoryForm(emptyCategoryForm);

      setNotice({ type: "success", text: "Categor?a guardada correctamente." });

    } catch (error) {

      setNotice({

        type: "error",

        text: error instanceof Error ? error.message : "No fue posible guardar la categor?a.",

      });

    }

  };



  const handleSettingsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

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

          phones: phones ? phones.split(",").map((phone) => phone.trim()).filter(Boolean) : [],

        };

      });



    try {

      await updateSettings({

        businessName: settingsForm.businessName,

        email: settingsForm.email,

        whatsappNumbers: settingsForm.whatsappNumbers.split(",").map((item) => item.trim()).filter(Boolean),

        socialLinks: {

          instagram: settingsForm.instagram,

          facebook: settingsForm.facebook,

        },

        trustMessages: settingsForm.trustMessages.split(",").map((item) => item.trim()).filter(Boolean),

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

        text: error instanceof Error ? error.message : "No fue posible actualizar el contenido general.",

      });

    }

  };



  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Panel administrador</p>
          <h1 className="text-3xl font-black text-slate-900">Gestión integral del negocio</h1>
          <p className="mt-1 text-sm text-slate-600">Catálogo, pedidos, inventario y contenido principal en una sola vista.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void adminLogout();
              router.push("/admin/login");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            <LogOut size={16} />
            Salir
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Restaurar la demo completa?")) {
                void resetDemoData();
                router.push("/admin/login");
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            <RotateCcw size={16} />
            Reset demo
          </button>
        </div>
      </div>

      {notice ? (
        <div className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {notice.text}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${activeTab === tab.id ? "bg-brand-primary text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" ? (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-black text-brand-secondary">{metric.value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black text-slate-900">Pedidos recientes</h2>
              <div className="mt-4 space-y-3">
                {data.orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{order.id} · {order.customerName}</p>
                        <p className="text-sm text-slate-600">{order.branch}</p>
                      </div>
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-primary">{order.status}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-brand-secondary">{formatCurrency(order.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black text-slate-900">Stock por revisar</h2>
              <div className="mt-4 space-y-3">
                {data.products
                  .filter((product) => product.stock <= 12)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">{product.stock} unidades disponibles</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "products" ? (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleProductSubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">{isEditingProduct ? "Editar producto" : "Nuevo producto"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditingProduct
                    ? "Estas modificando un producto existente. Si quieres crear uno nuevo, primero reinicia el formulario."
                    : "Completa el formulario para crear un producto nuevo en la base de datos."}
                </p>
              </div>
              {isEditingProduct ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Modo edicion</span>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre del producto" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Descripción" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input value={productForm.brand} onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))} placeholder="Marca" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
                <input value={productForm.size} onChange={(event) => setProductForm((current) => ({ ...current, size: event.target.value }))} placeholder="Talla predeterminada" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              </div>
              <input value={productForm.sizeOptions} onChange={(event) => setProductForm((current) => ({ ...current, sizeOptions: event.target.value }))} placeholder="Tallas disponibles: RN, S, M, L" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <textarea value={productForm.sizeInventory} onChange={(event) => setProductForm((current) => ({ ...current, sizeInventory: event.target.value }))} rows={3} placeholder="Unidades por paquete según talla: M:50, L:46, XL:44, XXL:40" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="Precio" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
                <input type="number" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} placeholder="Stock general en bodega (solo admin)" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={productForm.pack} onChange={(event) => setProductForm((current) => ({ ...current, pack: event.target.value }))} placeholder="Presentación" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
                <input type="number" step="0.01" value={productForm.originalPrice} onChange={(event) => setProductForm((current) => ({ ...current, originalPrice: event.target.value }))} placeholder="Precio anterior" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              </div>
              <select value={productForm.categoryId} onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary">
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="space-y-3 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">Imagen del producto</p>
                  <p className="text-xs text-slate-500">Puedes pegar una ruta/URL o subir la imagen directamente desde tu computadora.</p>
                </div>
                <input value={productForm.image} onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))} placeholder="Ruta o URL de imagen" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary" />
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleProductImageUpload} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-primary file:px-3 file:py-2 file:font-bold file:text-white" />
                {productForm.image ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Vista previa</p>
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
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2"><input type="checkbox" checked={productForm.featured} onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))} /> Destacado</label>
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2"><input type="checkbox" checked={productForm.isNew} onChange={(event) => setProductForm((current) => ({ ...current, isNew: event.target.checked }))} /> Nuevo</label>
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2"><input type="checkbox" checked={productForm.onSale} onChange={(event) => setProductForm((current) => ({ ...current, onSale: event.target.checked }))} /> Oferta</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"><Save size={16} /> {isEditingProduct ? "Actualizar" : "Guardar"}</button>
                <button
                  type="button"
                  onClick={() => {
                    setProductForm({ ...emptyProductForm, categoryId: data.categories[0]?.id ?? "" });
                    if (isEditingProduct) {
                      setNotice({ type: "success", text: "Formulario reiniciado. Ahora el siguiente guardado creara un producto nuevo." });
                    }
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                >
                  {isEditingProduct ? "Crear nuevo" : "Limpiar"}
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
                        <p className="text-sm text-slate-600">{product.brand} · Tallas {(product.sizeOptions?.length ? product.sizeOptions.join(", ") : product.size)} · {product.pack} · Stock general {product.stock}</p>
                        <p className="text-xs text-slate-500">{product.sizePackageInfo?.map((item) => `${item.size}: ${item.units} und/paq`).join(" · ") || "Usa el campo de unidades por talla para personalizar la presentación."}</p>
                        <p className="text-sm font-semibold text-brand-secondary">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("products");
                            setProductForm({
                            id: product.id,
                            slug: product.slug,
                            name: product.name,
                            description: product.description,
                            price: String(product.price),
                            originalPrice: product.originalPrice ? String(product.originalPrice) : "",
                            size: product.size,
                            sizeOptions: product.sizeOptions?.join(", ") || product.size,
                            sizeInventory: product.sizePackageInfo?.map((item) => `${item.size}:${item.units}`).join(", ") || "",
                            brand: product.brand,
                            pack: product.pack,
                            stock: String(product.stock),
                            categoryId: product.categoryId,
                            image: product.image,
                              featured: Boolean(product.featured),
                              isNew: Boolean(product.isNew),
                              onSale: Boolean(product.onSale),
                            });
                            setNotice({
                              type: "success",
                              text: `Editando ${product.name}. Si no quieres sobreescribirlo, pulsa "Crear nuevo" antes de guardar.`,
                            });
                          }}
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
      ) : null}

      {activeTab === "categories" ? (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={handleCategorySubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-900">Gestionar categorías</h2>
            <div className="mt-4 space-y-3">
              <input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <input value={categoryForm.icon} onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))} placeholder="Icono o emoji" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <textarea value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Descripción" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
              <div className="flex gap-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"><Save size={16} /> Guardar</button>
                <button type="button" onClick={() => setCategoryForm(emptyCategoryForm)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Limpiar</button>
              </div>
            </div>
          </form>

          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-900">Categorías registradas</h2>
            <div className="mt-4 space-y-3">
              {data.categories.map((category) => (
                <div key={category.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{category.icon} {category.name}</p>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCategoryForm({ id: category.id, slug: category.slug, name: category.name, description: category.description, icon: category.icon })} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Editar</button>
                    <button type="button" disabled={data.categories.length === 1} onClick={() => {
                      if (window.confirm(`¿Eliminar la categoría ${category.name}?`)) {
                        void deleteCategory(category.id);
                        setNotice({ type: "success", text: "Categoría eliminada." });
                      }
                    }} className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-60">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "orders" ? (
        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-black text-slate-900">Listado de pedidos</h2>
          <div className="mt-4 space-y-3">
            {data.orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{order.id} · {order.customerName}</p>
                    <p className="text-sm text-slate-600">{order.phone} · {order.branch}</p>
                    <p className="mt-2 text-sm text-slate-600">{order.items.map((item) => `${item.quantity}x ${item.name}${item.selectedSize ? ` · Talla ${item.selectedSize}` : ""}`).join(", ")}</p>
                    <p className="mt-2 text-sm font-semibold text-brand-secondary">Total: {formatCurrency(order.total)}</p>
                  </div>
                  <div className="min-w-52 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Estado</label>
                    <select value={order.status} onChange={(event) => { void updateOrderStatus(order.id, event.target.value as typeof order.status); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary">
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "content" ? (
        <form onSubmit={handleSettingsSubmit} className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 size={18} className="text-brand-primary" />
            <h2 className="text-xl font-black text-slate-900">Información general y banner principal</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={settingsForm.businessName} onChange={(event) => setSettingsForm((current) => ({ ...current, businessName: event.target.value }))} placeholder="Nombre del negocio" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <input value={settingsForm.email} onChange={(event) => setSettingsForm((current) => ({ ...current, email: event.target.value }))} placeholder="Correo" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <input value={settingsForm.whatsappNumbers} onChange={(event) => setSettingsForm((current) => ({ ...current, whatsappNumbers: event.target.value }))} placeholder="WhatsApp separados por coma" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2" />
            <input value={settingsForm.instagram} onChange={(event) => setSettingsForm((current) => ({ ...current, instagram: event.target.value }))} placeholder="Instagram URL" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <input value={settingsForm.facebook} onChange={(event) => setSettingsForm((current) => ({ ...current, facebook: event.target.value }))} placeholder="Facebook URL" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <input value={settingsForm.heroTitle} onChange={(event) => setSettingsForm((current) => ({ ...current, heroTitle: event.target.value }))} placeholder="Título del hero" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2" />
            <textarea value={settingsForm.heroSubtitle} onChange={(event) => setSettingsForm((current) => ({ ...current, heroSubtitle: event.target.value }))} rows={3} placeholder="Subtítulo del hero" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2" />
            <input value={settingsForm.heroHighlight} onChange={(event) => setSettingsForm((current) => ({ ...current, heroHighlight: event.target.value }))} placeholder="Texto destacado" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <input value={settingsForm.heroCta} onChange={(event) => setSettingsForm((current) => ({ ...current, heroCta: event.target.value }))} placeholder="CTA principal" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary" />
            <input value={settingsForm.trustMessages} onChange={(event) => setSettingsForm((current) => ({ ...current, trustMessages: event.target.value }))} placeholder="Mensajes de confianza separados por coma" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2" />
            <textarea value={settingsForm.branchesText} onChange={(event) => setSettingsForm((current) => ({ ...current, branchesText: event.target.value }))} rows={6} placeholder="Una sucursal por línea: Nombre | Dirección | Horario | Tel1, Tel2" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-primary md:col-span-2" />
          </div>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"><Save size={16} /> Guardar cambios</button>
        </form>
      ) : null}
    </div>
  );
}

