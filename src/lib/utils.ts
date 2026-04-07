import { OrderStatus, Product, SizeInventoryItem } from "@/types/site";

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

export const getProductSizeOptions = (product: Product) => {
  const options = [
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

export const normalizeSizeInventory = (product: Product): SizeInventoryItem[] => {
  const sizeOptions = getProductSizeOptions(product);
  const totalStock = Math.max(0, Number(product.stock) || 0);

  if (product.sizeInventory?.length) {
    const inventoryMap = new Map(
      product.sizeInventory.map((item) => [item.size.trim(), Math.max(0, Number(item.stock) || 0)]),
    );

    return sizeOptions.map((size) => ({
      size,
      stock: inventoryMap.get(size) ?? 0,
    }));
  }

  if (sizeOptions.length <= 1) {
    return [{ size: sizeOptions[0] ?? product.size ?? "Única", stock: totalStock }];
  }

  const baseStock = Math.floor(totalStock / sizeOptions.length);
  const remainder = totalStock % sizeOptions.length;

  return sizeOptions.map((size, index) => ({
    size,
    stock: baseStock + (index < remainder ? 1 : 0),
  }));
};

export const getProductSizeStock = (product: Product, size?: string) => {
  const normalizedSize = size?.trim() || product.size;
  const inventory = normalizeSizeInventory(product);
  const match = inventory.find((item) => item.size === normalizedSize);

  if (match) {
    return match.stock;
  }

  return inventory[0]?.stock ?? Math.max(0, Number(product.stock) || 0);
};

export const getProductTotalStock = (product: Product) =>
  normalizeSizeInventory(product).reduce((total, item) => total + item.stock, 0);

export const orderStatuses: OrderStatus[] = [
  "Nuevo",
  "Confirmado",
  "En preparación",
  "En camino",
  "Entregado",
];
