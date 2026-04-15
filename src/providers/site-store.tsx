"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  formatProductPackLabel,
  getProductSizeOptions,
  getProductSizeUnits,
  normalizeSizePackageInfo,
  slugify,
} from "@/lib/utils";
import {
  BusinessSettings,
  CartItem,
  Category,
  OrderStatus,
  Product,
  SiteData,
} from "@/types/site";

const CART_KEY = "lcdp-cart-v7-mysql";

interface CheckoutPayload {
  customerName: string;
  phone: string;
  branch: string;
  address: string;
  notes?: string;
}

interface SiteStoreValue {
  data: SiteData;
  cart: CartItem[];
  isReady: boolean;
  isAdminAuthenticated: boolean;
  cartCount: number;
  cartTotal: number;
  cartItemsDetailed: Array<{
    cartKey: string;
    product: Product;
    quantity: number;
    subtotal: number;
    selectedSize: string;
    selectedPackUnits: number;
    packLabel: string;
    maxQuantity: number;
  }>;
  addToCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  clearCart: () => void;
  createOrder: (payload: CheckoutPayload) => Promise<{ success: boolean; orderId: string; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  upsertProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  upsertCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateSettings: (settings: BusinessSettings) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const normalizeProduct = (product: Product): Product => {
  const normalizedSizeOptions = getProductSizeOptions(product);
  const normalizedPackageInfo = normalizeSizePackageInfo({
    ...product,
    sizeOptions: normalizedSizeOptions,
  });

  return {
    ...product,
    size: normalizedSizeOptions[0] ?? product.size ?? "Unica",
    sizeOptions: normalizedSizeOptions,
    sizePackageInfo: normalizedPackageInfo,
    stock: Math.max(0, Number(product.stock) || 0),
  };
};

const normalizeSiteData = (siteData: SiteData): SiteData => ({
  ...siteData,
  products: siteData.products.map((product) => normalizeProduct(product)),
});

const SiteStoreContext = createContext<SiteStoreValue | null>(null);

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
};

export function SiteStoreProvider({
  children,
  initialData,
  initialIsAdminAuthenticated,
}: {
  children: ReactNode;
  initialData: SiteData;
  initialIsAdminAuthenticated: boolean;
}) {
  const [data, setData] = useState<SiteData>(() => normalizeSiteData(initialData));
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartHydrated = useRef(false);
  const isReady = true;
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(initialIsAdminAuthenticated);

  // Write effect declared FIRST so it runs before the read effect on mount.
  // cartHydrated.current is still false on first run, so it skips the initial write.
  useEffect(() => {
    if (!cartHydrated.current) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Read effect runs SECOND on mount, restores cart from localStorage, then marks hydrated.
  useEffect(() => {
    const storedCart = window.localStorage.getItem(CART_KEY);
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart) as CartItem[]);
      } catch {
        // ignore malformed data
      }
    }
    cartHydrated.current = true;
  }, []);

  const refreshPublicData = useCallback(async () => {
    const response = await fetchJson<{ data: SiteData }>("/api/site", { method: "GET" });
    setData(normalizeSiteData(response.data));
  }, []);

  const refreshAdminData = useCallback(async () => {
    const response = await fetch("/api/admin/dashboard", { method: "GET" });

    if (response.status === 401) {
      setIsAdminAuthenticated(false);
      await refreshPublicData();
      return false;
    }

    const payload = (await response.json()) as { data: SiteData; error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "No fue posible cargar el panel.");
    }

    setData(normalizeSiteData(payload.data));
    setIsAdminAuthenticated(true);
    return true;
  }, [refreshPublicData]);

  useEffect(() => {
    if (!isReady) return;

    const syncSession = async () => {
      try {
        const response = await fetchJson<{ authenticated: boolean }>("/api/admin/session", { method: "GET" });
        setIsAdminAuthenticated(response.authenticated);

        if (response.authenticated) {
          await refreshAdminData();
          return;
        }

        await refreshPublicData();
      } catch {
        setIsAdminAuthenticated(false);
      }
    };

    void syncSession();
  }, [isReady, refreshAdminData, refreshPublicData]);

  const cartItemsDetailed = useMemo(
    () =>
      cart
        .map((item) => {
          const product = data.products.find((entry) => entry.id === item.productId);
          if (!product) return null;

          const selectedSize = item.selectedSize || getProductSizeOptions(product)[0] || product.size || "Unica";
          const selectedPackUnits = getProductSizeUnits(product, selectedSize);
          const otherQuantity = cart.reduce(
            (total, currentItem) =>
              currentItem.productId === item.productId && currentItem.selectedSize !== selectedSize
                ? total + currentItem.quantity
                : total,
            0,
          );
          const maxQuantity = Math.max(0, product.stock - otherQuantity);

          return {
            cartKey: `${item.productId}-${selectedSize}`,
            product,
            quantity: item.quantity,
            selectedSize,
            selectedPackUnits,
            packLabel: formatProductPackLabel(product, selectedSize),
            maxQuantity,
            subtotal: item.quantity * product.price,
          };
        })
        .filter(Boolean) as Array<{
          cartKey: string;
          product: Product;
          quantity: number;
          subtotal: number;
          selectedSize: string;
          selectedPackUnits: number;
          packLabel: string;
          maxQuantity: number;
        }>,
    [cart, data.products],
  );

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cartItemsDetailed.reduce((total, item) => total + item.subtotal, 0), [cartItemsDetailed]);

  const addToCart = useCallback((productId: string, selectedSize?: string) => {
    const product = data.products.find((entry) => entry.id === productId);
    if (!product || product.stock <= 0) return;

    const normalizedSize = selectedSize || getProductSizeOptions(product)[0] || product.size || "Unica";

    setCart((current) => {
      const currentQuantityForProduct = current
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + item.quantity, 0);

      if (currentQuantityForProduct >= product.stock) {
        return current;
      }

      const existing = current.find(
        (item) => item.productId === productId && item.selectedSize === normalizedSize,
      );

      if (existing) {
        return current.map((item) =>
          item.productId === productId && item.selectedSize === normalizedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { productId, quantity: 1, selectedSize: normalizedSize }];
    });
  }, [data.products]);

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    const product = data.products.find((entry) => entry.id === productId);
    const normalizedSize = selectedSize || product?.size || "Unica";

    if (quantity <= 0 || !product || product.stock <= 0) {
      setCart((current) =>
        current.filter((item) => !(item.productId === productId && item.selectedSize === normalizedSize)),
      );
      return;
    }

    setCart((current) => {
      const otherQuantity = current
        .filter((item) => item.productId === productId && item.selectedSize !== normalizedSize)
        .reduce((total, item) => total + item.quantity, 0);
      const safeQuantity = Math.min(quantity, Math.max(0, product.stock - otherQuantity));

      if (safeQuantity <= 0) {
        return current.filter((item) => !(item.productId === productId && item.selectedSize === normalizedSize));
      }

      const exists = current.some((item) => item.productId === productId && item.selectedSize === normalizedSize);

      if (!exists) {
        return [...current, { productId, quantity: safeQuantity, selectedSize: normalizedSize }];
      }

      return current.map((item) =>
        item.productId === productId && item.selectedSize === normalizedSize
          ? { ...item, quantity: safeQuantity }
          : item,
      );
    });
  }, [data.products]);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart((current) =>
      current.filter((item) => !(item.productId === productId && item.selectedSize === selectedSize)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const createOrderAction = useCallback(async (payload: CheckoutPayload) => {
    try {
      const response = await fetchJson<{ success: boolean; orderId: string; total: number }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          items: cartItemsDetailed.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
          })),
        }),
      });

      setCart([]);
      if (isAdminAuthenticated) {
        await refreshAdminData();
      } else {
        await refreshPublicData();
      }

      return { success: true, orderId: response.orderId };
    } catch (error) {
      return {
        success: false,
        orderId: "",
        error: error instanceof Error ? error.message : "No fue posible confirmar el pedido.",
      };
    }
  }, [cartItemsDetailed, isAdminAuthenticated, refreshAdminData, refreshPublicData]);

  const adminLogin = useCallback(async (email: string, password: string) => {
    try {
      await fetchJson<{ success: boolean }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      return await refreshAdminData();
    } catch {
      setIsAdminAuthenticated(false);
      return false;
    }
  }, [refreshAdminData]);

  const adminLogout = useCallback(async () => {
    await fetchJson<{ success: boolean }>("/api/admin/logout", { method: "POST" });
    setIsAdminAuthenticated(false);
    await refreshPublicData();
  }, [refreshPublicData]);

  const upsertProductAction = useCallback(async (product: Product) => {
    const normalizedOptions = (product.sizeOptions ?? [product.size]).map((option) => option.trim()).filter(Boolean);
    const normalized = {
      ...product,
      slug: product.slug || slugify(product.name),
      size: normalizedOptions[0] ?? product.size,
      sizeOptions: normalizedOptions,
      tags: product.tags.filter(Boolean),
    };

    const response = await fetchJson<{ data: SiteData }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(normalized),
    });
    setData(normalizeSiteData(response.data));
  }, []);

  const deleteProductAction = useCallback(async (id: string) => {
    const response = await fetchJson<{ data: SiteData }>(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    setData(normalizeSiteData(response.data));
    setCart((current) => current.filter((item) => item.productId !== id));
  }, []);

  const upsertCategoryAction = useCallback(async (category: Category) => {
    const response = await fetchJson<{ data: SiteData }>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        ...category,
        slug: category.slug || slugify(category.name),
      }),
    });
    setData(normalizeSiteData(response.data));
  }, []);

  const deleteCategoryAction = useCallback(async (id: string) => {
    const response = await fetchJson<{ data: SiteData }>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    setData(normalizeSiteData(response.data));
  }, []);

  const updateOrderStatusAction = useCallback(async (id: string, status: OrderStatus) => {
    const response = await fetchJson<{ data: SiteData }>(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setData(normalizeSiteData(response.data));
  }, []);

  const updateSettingsAction = useCallback(async (settings: BusinessSettings) => {
    const response = await fetchJson<{ data: SiteData }>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    setData(normalizeSiteData(response.data));
  }, []);

  const resetDemoDataAction = useCallback(async () => {
    await fetchJson<{ loggedOut: boolean }>("/api/admin/reset", { method: "POST" });
    setCart([]);
    setIsAdminAuthenticated(false);
    await refreshPublicData();
  }, [refreshPublicData]);

  const value = useMemo(
    () => ({
      data,
      cart,
      isReady,
      isAdminAuthenticated,
      cartCount,
      cartTotal,
      cartItemsDetailed,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      createOrder: createOrderAction,
      adminLogin,
      adminLogout,
      upsertProduct: upsertProductAction,
      deleteProduct: deleteProductAction,
      upsertCategory: upsertCategoryAction,
      deleteCategory: deleteCategoryAction,
      updateOrderStatus: updateOrderStatusAction,
      updateSettings: updateSettingsAction,
      resetDemoData: resetDemoDataAction,
    }),
    [
      addToCart,
      adminLogin,
      adminLogout,
      cart,
      cartCount,
      cartItemsDetailed,
      cartTotal,
      clearCart,
      createOrderAction,
      data,
      deleteCategoryAction,
      deleteProductAction,
      isAdminAuthenticated,
      isReady,
      removeFromCart,
      resetDemoDataAction,
      updateCartQuantity,
      updateOrderStatusAction,
      updateSettingsAction,
      upsertCategoryAction,
      upsertProductAction,
    ],
  );

  return <SiteStoreContext.Provider value={value}>{children}</SiteStoreContext.Provider>;
}

export function useSiteStore() {
  const context = useContext(SiteStoreContext);
  if (!context) {
    throw new Error("useSiteStore must be used within SiteStoreProvider");
  }
  return context;
}
