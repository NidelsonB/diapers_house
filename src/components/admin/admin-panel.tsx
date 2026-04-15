"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ClipboardList, FolderTree, LayoutTemplate, LogOut, PackageSearch, RotateCcw } from "lucide-react";

import { useSiteStore } from "@/providers/site-store";
import { AdminDashboardTab } from "@/components/admin/admin-dashboard-tab";
import { AdminProductsTab } from "@/components/admin/admin-products-tab";
import { AdminCategoriesTab } from "@/components/admin/admin-categories-tab";
import { AdminOrdersTab } from "@/components/admin/admin-orders-tab";
import { AdminSettingsTab } from "@/components/admin/admin-settings-tab";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Productos", icon: PackageSearch },
  { id: "categories", label: "Categorías", icon: FolderTree },
  { id: "orders", label: "Pedidos", icon: ClipboardList },
  { id: "content", label: "Contenido", icon: LayoutTemplate },
];


export function AdminPanel() {
  const router = useRouter();
  const { isAdminAuthenticated, isReady, adminLogout, resetDemoData } = useSiteStore();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (isReady && !isAdminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, isReady, router]);

  if (!isReady || !isAdminAuthenticated) {
    return <div className="px-4 py-16 text-center text-slate-600">Cargando panel...</div>;
  }

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

      {activeTab === "dashboard" ? <AdminDashboardTab /> : null}

      {activeTab === "products" ? <AdminProductsTab /> : null}
      {activeTab === "categories" ? <AdminCategoriesTab /> : null}

      {activeTab === "orders" ? <AdminOrdersTab /> : null}

      {activeTab === "content" ? <AdminSettingsTab /> : null}
    </div>
  );
}

