import { OrderStatus } from "@/types/site";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const buildWhatsAppLink = (phone: string, message: string) => {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/503${normalizedPhone}?text=${encodeURIComponent(message)}`;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBasePath = (path: string) => {
  if (!path) return path;
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};

export const orderStatuses: OrderStatus[] = [
  "Nuevo",
  "Confirmado",
  "En preparación",
  "En camino",
  "Entregado",
];
