import { Prisma, PrismaClient } from "@prisma/client";

import { createSeedData, defaultAdmin, seedCategories, seedOrders, seedProducts, seedSettings } from "@/data/seed";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  Branch,
  BusinessSettings,
  Category,
  HeroBanner,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  SizePackageInfo,
  SocialLinks,
  SiteData,
} from "@/types/site";

const SETTINGS_ID = 1;
const FALLBACK_CATEGORY_ID = seedCategories[0]?.id ?? "cat-baby";
type DbClient = PrismaClient | Prisma.TransactionClient;
const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const isBuildTime = process.env.NEXT_BUILD === "true";
const isDatabaseConfigured = Boolean(process.env.DATABASE_URL) && !isBuildTime;
const normalizeEmailAddress = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const asStringArray = (value: Prisma.JsonValue | null | undefined) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const asSizePackageInfo = (value: Prisma.JsonValue | null | undefined): SizePackageInfo[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const size = typeof item.size === "string" ? item.size : "";
    const units = Number(item.units);
    return size ? [{ size, units: Number.isFinite(units) ? units : 0 }] : [];
  });
};

const asOrderItems = (value: Prisma.JsonValue | null | undefined): OrderItem[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];

    const productId = typeof item.productId === "string" ? item.productId : "";
    const name = typeof item.name === "string" ? item.name : "";
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const selectedSize = typeof item.selectedSize === "string" ? item.selectedSize : undefined;

    if (!productId || !name || !Number.isFinite(price) || !Number.isFinite(quantity)) {
      return [];
    }

    return [{ productId, name, price, quantity, selectedSize }];
  });
};

const asBranches = (value: Prisma.JsonValue | null | undefined): Branch[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];

    const id = typeof item.id === "string" ? item.id : "";
    const name = typeof item.name === "string" ? item.name : "";
    const address = typeof item.address === "string" ? item.address : "";
    const hours = typeof item.hours === "string" ? item.hours : "";
    const phones = Array.isArray(item.phones)
      ? item.phones.filter((phone): phone is string => typeof phone === "string")
      : [];

    if (!id || !name) return [];
    return [{ id, name, address, hours, phones }];
  });
};

const asHeroBanner = (value: Prisma.JsonValue | null | undefined): HeroBanner => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return seedSettings.heroBanner;
  }

  return {
    title: typeof value.title === "string" ? value.title : seedSettings.heroBanner.title,
    subtitle: typeof value.subtitle === "string" ? value.subtitle : seedSettings.heroBanner.subtitle,
    highlight: typeof value.highlight === "string" ? value.highlight : seedSettings.heroBanner.highlight,
    ctaText: typeof value.ctaText === "string" ? value.ctaText : seedSettings.heroBanner.ctaText,
  };
};

const asSocialLinks = (value: Prisma.JsonValue | null | undefined): SocialLinks => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return seedSettings.socialLinks;
  }

  return {
    instagram: typeof value.instagram === "string" ? value.instagram : seedSettings.socialLinks.instagram,
    facebook: typeof value.facebook === "string" ? value.facebook : seedSettings.socialLinks.facebook,
  };
};

const normalizePublicBranch = (branch: Branch, fallback: Branch): Branch => {
  const looksPlaceholder =
    /editable|presentaci|demostrativa|futuras ubicaciones/i.test(branch.address) ||
    !branch.address.trim();

  return {
    ...branch,
    address: looksPlaceholder ? fallback.address : branch.address,
    hours: branch.hours.trim() ? branch.hours : fallback.hours,
    phones: branch.phones.length > 0 ? branch.phones : fallback.phones,
  };
};

const normalizePublicSettings = (settings: BusinessSettings): BusinessSettings => {
  const fallbackBranches = seedSettings.branches;
  const branches = settings.branches.map((branch, index) =>
    normalizePublicBranch(branch, fallbackBranches[index] ?? fallbackBranches[0] ?? branch),
  );

  const normalizedTrustMessages = settings.trustMessages
    .map((message) => {
      if (/pdf/i.test(message)) return "Compra fácil";
      if (/catálogo actualizado/i.test(message)) return "Precios actualizados";
      return message;
    })
    .filter(Boolean);

  const heroTitle = /catálogo actualizado/i.test(settings.heroBanner.title)
    ? seedSettings.heroBanner.title
    : settings.heroBanner.title;
  const heroSubtitle = /pdf|pañalín express/i.test(settings.heroBanner.subtitle)
    ? seedSettings.heroBanner.subtitle
    : settings.heroBanner.subtitle;
  const heroHighlight = /catálogo compartido/i.test(settings.heroBanner.highlight)
    ? seedSettings.heroBanner.highlight
    : settings.heroBanner.highlight;
  const businessName = settings.businessName.replace(/Panal/g, "Pañal");

  return {
    ...settings,
    businessName,
    branches,
    trustMessages: normalizedTrustMessages,
    heroBanner: {
      ...settings.heroBanner,
      title: heroTitle,
      subtitle: heroSubtitle,
      highlight: heroHighlight,
    },
  };
};

const mapCategoryRecord = (category: {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}): Category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  icon: category.icon,
});

const mapProductRecord = (product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  size: string;
  sizeOptions: Prisma.JsonValue | null;
  sizePackageInfo: Prisma.JsonValue | null;
  sortOrder: number;
  brand: string;
  pack: string;
  stock: number;
  categoryId: string;
  image: string;
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  tags: Prisma.JsonValue;
}): Product => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  description: product.description,
  price: product.price,
  originalPrice: product.originalPrice ?? undefined,
  size: product.size,
  sizeOptions: asStringArray(product.sizeOptions),
  sizePackageInfo: asSizePackageInfo(product.sizePackageInfo),
  sortOrder: product.sortOrder,
  brand: product.brand,
  pack: product.pack,
  stock: product.stock,
  categoryId: product.categoryId,
  image: product.image,
  featured: product.featured,
  isNew: product.isNew,
  onSale: product.onSale,
  tags: asStringArray(product.tags),
});

const mapOrderRecord = (order: {
  id: string;
  customerName: string;
  phone: string;
  branch: string;
  address: string;
  notes: string | null;
  total: number;
  status: string;
  createdAt: Date;
  items: Prisma.JsonValue;
}): Order => ({
  id: order.id,
  customerName: order.customerName,
  phone: order.phone,
  branch: order.branch,
  address: order.address,
  notes: order.notes ?? undefined,
  total: order.total,
  status: order.status as OrderStatus,
  createdAt: order.createdAt.toISOString(),
  items: asOrderItems(order.items),
});

const mapSettingsRecord = (settings: {
  businessName: string;
  email: string;
  whatsappNumbers: Prisma.JsonValue;
  socialLinks: Prisma.JsonValue;
  branches: Prisma.JsonValue;
  trustMessages: Prisma.JsonValue;
  heroBanner: Prisma.JsonValue;
}): BusinessSettings =>
  normalizePublicSettings({
    businessName: settings.businessName,
    email: normalizeEmailAddress(settings.email),
    whatsappNumbers: asStringArray(settings.whatsappNumbers),
    socialLinks: asSocialLinks(settings.socialLinks),
    branches: asBranches(settings.branches),
    trustMessages: asStringArray(settings.trustMessages),
    heroBanner: asHeroBanner(settings.heroBanner),
  });

export async function ensureDatabaseSeed(client: DbClient = prisma) {
  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD ?? defaultAdmin.password);

  await client.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? defaultAdmin.email },
    update: {
      name: process.env.ADMIN_NAME ?? "Administrador",
      passwordHash,
    },
    create: {
      email: process.env.ADMIN_EMAIL ?? defaultAdmin.email,
      name: process.env.ADMIN_NAME ?? "Administrador",
      passwordHash,
    },
  });

  await Promise.all(
    seedCategories.map((category) =>
      client.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      }),
    ),
  );

  await Promise.all(
    seedProducts.map((product) =>
      client.product.upsert({
        where: { id: product.id },
        update: {
          ...product,
          originalPrice: product.originalPrice ?? null,
          sizeOptions: toJson(product.sizeOptions ?? []),
          sizePackageInfo: toJson(product.sizePackageInfo ?? []),
          tags: toJson(product.tags),
        },
        create: {
          ...product,
          originalPrice: product.originalPrice ?? null,
          sizeOptions: toJson(product.sizeOptions ?? []),
          sizePackageInfo: toJson(product.sizePackageInfo ?? []),
          tags: toJson(product.tags),
        },
      }),
    ),
  );

  await client.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {
      businessName: seedSettings.businessName,
      email: seedSettings.email,
      whatsappNumbers: toJson(seedSettings.whatsappNumbers),
      socialLinks: toJson(seedSettings.socialLinks),
      branches: toJson(seedSettings.branches),
      trustMessages: toJson(seedSettings.trustMessages),
      heroBanner: toJson(seedSettings.heroBanner),
    },
    create: {
      id: SETTINGS_ID,
      businessName: seedSettings.businessName,
      email: seedSettings.email,
      whatsappNumbers: toJson(seedSettings.whatsappNumbers),
      socialLinks: toJson(seedSettings.socialLinks),
      branches: toJson(seedSettings.branches),
      trustMessages: toJson(seedSettings.trustMessages),
      heroBanner: toJson(seedSettings.heroBanner),
    },
  });

  await Promise.all(
    seedOrders.map((order) =>
      client.order.upsert({
        where: { id: order.id },
        update: {
          customerName: order.customerName,
          phone: order.phone,
          branch: order.branch,
          address: order.address,
          notes: order.notes ?? null,
          total: order.total,
          status: order.status,
          createdAt: new Date(order.createdAt),
          items: toJson(order.items),
        },
        create: {
          id: order.id,
          customerName: order.customerName,
          phone: order.phone,
          branch: order.branch,
          address: order.address,
          notes: order.notes ?? null,
          total: order.total,
          status: order.status,
          createdAt: new Date(order.createdAt),
          items: toJson(order.items),
        },
      }),
    ),
  );
}

export async function resetDatabase(client: PrismaClient = prisma) {
  await client.$transaction(async (tx) => {
    await tx.adminSession.deleteMany();
    await tx.order.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();
    await tx.siteSettings.deleteMany();
    await tx.adminUser.deleteMany();
    await ensureDatabaseSeed(tx);
  });
}

export async function getSettings() {
  if (!isDatabaseConfigured) {
    return seedSettings;
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });

  if (!settings) {
    await ensureDatabaseSeed();
    const seededSettings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return seededSettings ? mapSettingsRecord(seededSettings) : seedSettings;
  }

  return mapSettingsRecord(settings);
}

export async function getPublicSiteData(): Promise<SiteData> {
  if (!isDatabaseConfigured) {
    const seed = createSeedData();
    return { ...seed, orders: [] };
  }

  const [categories, products, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    getSettings(),
  ]);

  return {
    categories: categories.map(mapCategoryRecord),
    products: products.map(mapProductRecord),
    orders: [],
    settings,
  };
}

export async function getAdminSiteData(): Promise<SiteData> {
  if (!isDatabaseConfigured) {
    return createSeedData();
  }

  const [categories, products, orders, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);

  return {
    categories: categories.map(mapCategoryRecord),
    products: products.map(mapProductRecord),
    orders: orders.map(mapOrderRecord),
    settings,
  };
}

interface CreateOrderInput {
  customerName: string;
  phone: string;
  branch: string;
  address: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    selectedSize?: string;
  }>;
}

export async function createOrder(input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const productIds = Array.from(new Set(input.items.map((item) => item.productId)));
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const productsMap = new Map(products.map((product) => [product.id, product]));

    for (const item of input.items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      }

      if (item.quantity > product.stock) {
        throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
      }
    }

    const items = input.items.map((item) => {
      const product = productsMap.get(item.productId)!;
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

    await tx.order.create({
      data: {
        id: orderId,
        customerName: input.customerName,
        phone: input.phone,
        branch: input.branch,
        address: input.address,
        notes: input.notes?.trim() || null,
        total,
        status: "Nuevo",
        items: toJson(items),
      },
    });

    await Promise.all(
      input.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );

    return { orderId, total };
  });
}

export async function upsertProduct(product: Product) {
  const payload = {
    id: product.id || `prod-${Date.now()}`,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    size: product.size,
    sizeOptions: toJson(product.sizeOptions ?? []),
    sizePackageInfo: toJson(product.sizePackageInfo ?? []),
    sortOrder: product.sortOrder ?? 0,
    brand: product.brand,
    pack: product.pack,
    stock: product.stock,
    categoryId: product.categoryId,
    image: product.image,
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    onSale: Boolean(product.onSale),
    tags: toJson(product.tags),
  };

  await prisma.product.upsert({
    where: { id: payload.id },
    update: payload,
    create: payload,
  });

  return getAdminSiteData();
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  return getAdminSiteData();
}

export async function upsertCategory(category: Category) {
  const payload = {
    id: category.id || `cat-${Date.now()}`,
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
  };

  await prisma.category.upsert({
    where: { id: payload.id },
    update: payload,
    create: payload,
  });

  return getAdminSiteData();
}

export async function deleteCategory(id: string) {
  const remainingCategories = await prisma.category.findMany({
    where: { id: { not: id } },
    orderBy: { name: "asc" },
    take: 1,
  });

  const fallbackCategoryId = remainingCategories[0]?.id ?? FALLBACK_CATEGORY_ID;

  await prisma.$transaction(async (tx) => {
    await tx.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: fallbackCategoryId },
    });

    await tx.category.delete({ where: { id } });
  });

  return getAdminSiteData();
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await prisma.order.update({
    where: { id },
    data: { status },
  });

  return getAdminSiteData();
}

export async function updateSettings(settings: BusinessSettings) {
  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {
      businessName: settings.businessName,
      email: settings.email,
      whatsappNumbers: toJson(settings.whatsappNumbers),
      socialLinks: toJson(settings.socialLinks),
      branches: toJson(settings.branches),
      trustMessages: toJson(settings.trustMessages),
      heroBanner: toJson(settings.heroBanner),
    },
    create: {
      id: SETTINGS_ID,
      businessName: settings.businessName,
      email: settings.email,
      whatsappNumbers: toJson(settings.whatsappNumbers),
      socialLinks: toJson(settings.socialLinks),
      branches: toJson(settings.branches),
      trustMessages: toJson(settings.trustMessages),
      heroBanner: toJson(settings.heroBanner),
    },
  });

  return getAdminSiteData();
}
