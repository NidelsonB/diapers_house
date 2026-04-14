import { OrderStatus, Product, SizePackageInfo } from "@/types/site";

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

export const getProductDisplayName = (product: Product) => {
  const normalizedName = product.name
    .replace(/\s+x\d+\b/gi, "")
    .replace(/\s+(RN|S|M|L|XL|XXL|XXXL)\b(?=\s*(?:x\d+)?$)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalizedName || product.brand;
};

const extractPackUnits = (pack: string) => {
  const match = pack.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export const getProductSizeOptions = (product: Product) => {
  const options = [
    ...(product.sizePackageInfo?.map((item) => item.size) ?? []),
    ...(product.sizeInventory?.map((item) => item.size) ?? []),
    ...(product.sizeOptions ?? []),
  ]
    .map((option) => option.trim())
    .filter(Boolean);

  if (options.length > 0) {
    return Array.from(new Set(options));
  }

  return product.size ? [product.size] : [];
};

export const normalizeSizePackageInfo = (product: Product): SizePackageInfo[] => {
  const sizeOptions = getProductSizeOptions(product);
  const fallbackUnits = extractPackUnits(product.pack);
  const provided = [
    ...(product.sizePackageInfo ?? []),
    ...((product.sizeInventory ?? []).map((item) => ({ size: item.size, units: item.stock }))),
  ]
    .map((item) => ({
      size: item.size.trim(),
      units: Math.max(0, Number(item.units) || 0),
    }))
    .filter((item) => item.size);

  if (provided.length > 0) {
    const unitsMap = new Map(provided.map((item) => [item.size, item.units]));
    const sizes = sizeOptions.length > 0 ? sizeOptions : provided.map((item) => item.size);

    return sizes.map((size) => ({
      size,
      units: unitsMap.get(size) ?? fallbackUnits,
    }));
  }

  const sizes = sizeOptions.length > 0 ? sizeOptions : [product.size || "Única"];
  return sizes.map((size) => ({ size, units: fallbackUnits }));
};

export const getProductSizeUnits = (product: Product, size?: string) => {
  const normalizedSize = size?.trim() || product.size;
  const packageInfo = normalizeSizePackageInfo(product);
  const match = packageInfo.find((item) => item.size === normalizedSize);

  return match?.units ?? packageInfo[0]?.units ?? extractPackUnits(product.pack);
};

export const formatProductPackLabel = (product: Product, size?: string) => {
  const units = getProductSizeUnits(product, size);
  return units > 0 ? `${units} unidades por paquete` : product.pack;
};

export const orderStatuses: OrderStatus[] = [
  "Nuevo",
  "Confirmado",
  "En preparación",
  "En camino",
  "Entregado",
];
