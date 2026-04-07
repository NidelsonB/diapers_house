"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createSeedData, defaultAdmin } from "@/data/seed";
import {
  getProductSizeOptions,
  getProductSizeStock,
  getProductTotalStock,
  normalizeSizeInventory,
  slugify,
} from "@/lib/utils";
import {
  BusinessSettings,
  CartItem,
  Category,
  Order,
  OrderStatus,
  Product,
  SiteData,
} from "@/types/site";

const DATA_KEY = "lcdp-site-data-v5-size-stock";
const CART_KEY = "lcdp-cart-v5-size-stock";
const AUTH_KEY = "lcdp-admin-auth";

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
    availableStock: number;
  }>;
  addToCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  clearCart: () => void;
  createOrder: (payload: CheckoutPayload) => { success: boolean; orderId: string; error?: string };
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateSettings: (settings: BusinessSettings) => void;
  resetDemoData: () => void;
}

const normalizeProduct = (product: Product): Product => {
  const normalizedSizeOptions = getProductSizeOptions(product);
  const normalizedSizeInventory = normalizeSizeInventory({
    ...product,
    sizeOptions: normalizedSizeOptions,
  });

  return {
    ...product,
    size: normalizedSizeOptions[0] ?? product.size ?? "Única",
    sizeOptions: normalizedSizeOptions,
    sizeInventory: normalizedSizeInventory,
    stock: getProductTotalStock({
      ...product,
      sizeOptions: normalizedSizeOptions,
      sizeInventory: normalizedSizeInventory,
    }),
  };
};

const normalizeSiteData = (siteData: SiteData): SiteData => ({
  ...siteData,
  products: siteData.products.map((product) => normalizeProduct(product)),
});

const initialData = normalizeSiteData(createSeedData());
const SiteStoreContext = createContext<SiteStoreValue | null>(null);

export function SiteStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(() => {
    if (typeof window === "undefined") return initialData;
    const storedData = window.localStorage.getItem(DATA_KEY);
    return storedData ? normalizeSiteData(JSON.parse(storedData)) : initialData;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const storedCart = window.localStorage.getItem(CART_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const isReady = true;
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUTH_KEY) === "true";
  });

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data, isReady]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, isReady]);

  const cartItemsDetailed = useMemo(
    () =>
      cart
        .map((item) => {
          const product = data.products.find((entry) => entry.id === item.productId);
          if (!product) return null;
          const selectedSize = item.selectedSize || getProductSizeOptions(product)[0] || product.size || "Única";
          const availableStock = getProductSizeStock(product, selectedSize);
          return {
            cartKey: `${item.productId}-${selectedSize}`,
            product,
            quantity: item.quantity,
            selectedSize,
            availableStock,
            subtotal: item.quantity * product.price,
          };
        })
        .filter(Boolean) as Array<{
          cartKey: string;
          product: Product;
          quantity: number;
          subtotal: number;
          selectedSize: string;
          availableStock: number;
        }>,
    [cart, data.products],
  );

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cartItemsDetailed.reduce((total, item) => total + item.subtotal, 0),
    [cartItemsDetailed],
  );

  const addToCart = useCallback((productId: string, selectedSize?: string) => {
    const product = data.products.find((entry) => entry.id === productId);
    if (!product) return;

    const normalizedSize = selectedSize || getProductSizeOptions(product)[0] || product.size || "Única";
    const availableStock = getProductSizeStock(product, normalizedSize);

    if (availableStock <= 0) {
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === productId && item.selectedSize === normalizedSize,
      );

      if (existing) {
        if (existing.quantity >= availableStock) {
          return current;
        }

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
    const normalizedSize = selectedSize || product?.size || "Única";
    const availableStock = product ? getProductSizeStock(product, normalizedSize) : 0;

    if (quantity <= 0 || availableStock <= 0) {
      setCart((current) =>
        current.filter(
          (item) => !(item.productId === productId && item.selectedSize === normalizedSize),
        ),
      );
      return;
    }

    const safeQuantity = Math.min(quantity, availableStock);

    setCart((current) =>
      current.map((item) =>
        item.productId === productId && item.selectedSize === normalizedSize
          ? { ...item, quantity: safeQuantity }
          : item,
      ),
    );
  }, [data.products]);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.selectedSize === selectedSize),
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const createOrder = useCallback(
    (payload: CheckoutPayload) => {
      const stockIssue = cartItemsDetailed.find(
        (item) => item.availableStock <= 0 || item.quantity > item.availableStock,
      );

      if (stockIssue) {
        return {
          success: false,
          orderId: "",
          error: `La talla ${stockIssue.selectedSize} de ${stockIssue.product.name} ya no tiene suficientes existencias.`,
        };
      }

      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const nextOrder: Order = {
        id: orderId,
        customerName: payload.customerName,
        phone: payload.phone,
        branch: payload.branch,
        address: payload.address,
        notes: payload.notes,
        total: cartTotal,
        status: "Nuevo",
        createdAt: new Date().toISOString(),
        items: cartItemsDetailed.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
      };

      setData((current) => ({
        ...current,
        orders: [nextOrder, ...current.orders],
        products: current.products.map((product) => {
          const itemsForProduct = cart.filter((item) => item.productId === product.id);
          if (itemsForProduct.length === 0) return product;

          const nextInventory = normalizeSizeInventory(product).map((entry) => {
            const requestedQuantity = itemsForProduct
              .filter((item) => (item.selectedSize || product.size) === entry.size)
              .reduce((total, item) => total + item.quantity, 0);

            return {
              ...entry,
              stock: Math.max(0, entry.stock - requestedQuantity),
            };
          });

          return normalizeProduct({
            ...product,
            sizeInventory: nextInventory,
          });
        }),
      }));

      setCart([]);
      return { success: true, orderId };
    },
    [cart, cartItemsDetailed, cartTotal],
  );

  const adminLogin = useCallback((email: string, password: string) => {
    const isValid =
      email.trim().toLowerCase() === defaultAdmin.email && password === defaultAdmin.password;

    setIsAdminAuthenticated(isValid);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_KEY, String(isValid));
    }

    return isValid;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_KEY, "false");
    }
  }, []);

  const upsertProduct = useCallback((product: Product) => {
    setData((current) => {
      const exists = current.products.some((item) => item.id === product.id);
      const normalizedOptions = (product.sizeOptions ?? [product.size])
        .map((option) => option.trim())
        .filter(Boolean);

      const normalized = normalizeProduct({
        ...product,
        slug: product.slug || slugify(product.name),
        size: normalizedOptions[0] ?? product.size,
        sizeOptions: normalizedOptions,
      });

      return {
        ...current,
        products: exists
          ? current.products.map((item) =>
              item.id === product.id ? normalized : item,
            )
          : [{ ...normalized, id: `prod-${Date.now()}` }, ...current.products],
      };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== id),
    }));
    setCart((current) => current.filter((item) => item.productId !== id));
  }, []);

  const upsertCategory = useCallback((category: Category) => {
    setData((current) => {
      const exists = current.categories.some((item) => item.id === category.id);
      const normalized = {
        ...category,
        slug: category.slug || slugify(category.name),
      };

      return {
        ...current,
        categories: exists
          ? current.categories.map((item) =>
              item.id === category.id ? normalized : item,
            )
          : [{ ...normalized, id: `cat-${Date.now()}` }, ...current.categories],
      };
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== id),
      products: current.products.map((product) =>
        product.categoryId === id
          ? { ...product, categoryId: current.categories[0]?.id ?? product.categoryId }
          : product,
      ),
    }));
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setData((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === id ? { ...order, status } : order,
      ),
    }));
  }, []);

  const updateSettings = useCallback((settings: BusinessSettings) => {
    setData((current) => ({
      ...current,
      settings,
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    const seed = normalizeSiteData(createSeedData());
    setData(seed);
    setCart([]);
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(seed));
      window.localStorage.setItem(CART_KEY, JSON.stringify([]));
      window.localStorage.setItem(AUTH_KEY, "false");
    }
  }, []);

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
      createOrder,
      adminLogin,
      adminLogout,
      upsertProduct,
      deleteProduct,
      upsertCategory,
      deleteCategory,
      updateOrderStatus,
      updateSettings,
      resetDemoData,
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
      createOrder,
      data,
      deleteCategory,
      deleteProduct,
      isAdminAuthenticated,
      isReady,
      removeFromCart,
      resetDemoData,
      updateCartQuantity,
      updateOrderStatus,
      updateSettings,
      upsertCategory,
      upsertProduct,
    ],
  );

  return (
    <SiteStoreContext.Provider value={value}>{children}</SiteStoreContext.Provider>
  );
}

export function useSiteStore() {
  const context = useContext(SiteStoreContext);
  if (!context) {
    throw new Error("useSiteStore must be used within SiteStoreProvider");
  }
  return context;
}
