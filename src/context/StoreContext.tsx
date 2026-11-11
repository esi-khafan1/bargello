'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { INITIAL_CATALOG_SNAPSHOT } from '@/lib/seedSnapshot';
import { calculateCartWithBogo } from '@/lib/bogoEngine';
import { fetchCatalogSnapshot } from '@/lib/storeClient';
import type {
  BrandInspiration,
  CartCalculation,
  CartEntry,
  Category,
  Product,
  ProductReview,
  StoreSettings,
} from '@/lib/types';

export interface SavedCustomerProfile {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface RecentOrderRecord {
  orderCode: string;
  phone: string;
  payableTotalToman: number;
  bogoFreeUnits: number;
  createdAt: string;
}

interface StoreContextValue {
  categories: Category[];
  brands: BrandInspiration[];
  products: Product[];
  productsMap: Map<string, Product>;
  settings: StoreSettings;
  reviews: ProductReview[];
  refreshCatalog: () => Promise<void>;
  // Cart
  cartEntries: CartEntry[];
  cart: CartCalculation;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, qty?: number, openDrawer?: boolean) => void;
  addBogoPair: (firstProductId: string, secondProductId: string) => void;
  setItemQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  // Search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Customer profile & local order history
  savedProfile: SavedCustomerProfile;
  saveProfile: (profile: SavedCustomerProfile) => void;
  recentOrders: RecentOrderRecord[];
  recordPlacedOrder: (order: RecentOrderRecord) => void;
  // Toast notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const DEFAULT_PROFILE: SavedCustomerProfile = {
  fullName: '',
  phone: '',
  province: 'خوزستان',
  city: 'اهواز',
  address: '',
  postalCode: '',
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = 'bargello_cart_v1';
const PROFILE_STORAGE_KEY = 'bargello_customer_profile_v1';
const ORDERS_STORAGE_KEY = 'bargello_recent_orders_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snapshot, setSnapshot] = useState(INITIAL_CATALOG_SNAPSHOT);
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [savedProfile, setSavedProfile] =
    useState<SavedCustomerProfile>(DEFAULT_PROFILE);
  const [recentOrders, setRecentOrders] = useState<RecentOrderRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hydratedStorage, setHydratedStorage] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const refreshCatalog = useCallback(async () => {
    const fresh = await fetchCatalogSnapshot();
    setSnapshot(fresh);
  }, []);

  // Load persisted cart/profile & refresh live Supabase catalog
  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (rawCart) {
        const parsed = JSON.parse(rawCart);
        if (Array.isArray(parsed)) setCartEntries(parsed);
      }
      const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (rawProfile) {
        setSavedProfile({ ...DEFAULT_PROFILE, ...JSON.parse(rawProfile) });
      }
      const rawOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      if (rawOrders) {
        const parsedOrders = JSON.parse(rawOrders);
        if (Array.isArray(parsedOrders)) setRecentOrders(parsedOrders);
      }
    } catch {
      // Ignore storage parse issues
    }
    setHydratedStorage(true);
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    if (!hydratedStorage) return;
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartEntries)
      );
    } catch {
      // Ignore
    }
  }, [cartEntries, hydratedStorage]);

  const productsMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of snapshot.products) {
      map.set(p.id, p);
    }
    return map;
  }, [snapshot.products]);

  const cart = useMemo(
    () => calculateCartWithBogo(cartEntries, productsMap, snapshot.settings),
    [cartEntries, productsMap, snapshot.settings]
  );

  const addToCart = useCallback(
    (productId: string, qty = 1, openDrawer = true) => {
      setCartEntries((prev) => {
        const idx = prev.findIndex((e) => e.productId === productId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + qty,
          };
          return updated;
        }
        return [...prev, { productId, quantity: qty }];
      });
      if (openDrawer) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const addBogoPair = useCallback(
    (firstProductId: string, secondProductId: string) => {
      setCartEntries((prev) => {
        const map = new Map<string, number>();
        for (const item of prev) {
          map.set(item.productId, item.quantity);
        }
        map.set(firstProductId, (map.get(firstProductId) ?? 0) + 1);
        map.set(secondProductId, (map.get(secondProductId) ?? 0) + 1);
        return Array.from(map.entries()).map(([productId, quantity]) => ({
          productId,
          quantity,
        }));
      });
      setIsCartOpen(true);
      showToast('🎁 پک ۱+۱ با ۱۰۰٪ تخفیف عطر دوم به سبد خرید اضافه شد!');
    },
    [showToast]
  );

  const setItemQuantity = useCallback((productId: string, qty: number) => {
    setCartEntries((prev) => {
      if (qty <= 0) {
        return prev.filter((e) => e.productId !== productId);
      }
      return prev.map((e) =>
        e.productId === productId ? { ...e, quantity: qty } : e
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartEntries((prev) => prev.filter((e) => e.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartEntries([]);
  }, []);

  const saveProfile = useCallback((profile: SavedCustomerProfile) => {
    setSavedProfile(profile);
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  }, []);

  const recordPlacedOrder = useCallback((order: RecentOrderRecord) => {
    setRecentOrders((prev) => {
      const next = [
        order,
        ...prev.filter((o) => o.orderCode !== order.orderCode),
      ].slice(0, 15);
      try {
        window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const value: StoreContextValue = {
    categories: snapshot.categories,
    brands: snapshot.brands,
    products: snapshot.products,
    productsMap,
    settings: snapshot.settings,
    reviews: snapshot.reviews,
    refreshCatalog,
    cartEntries,
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    addBogoPair,
    setItemQuantity,
    removeItem,
    clearCart,
    isSearchOpen,
    setIsSearchOpen,
    savedProfile,
    saveProfile,
    recentOrders,
    recordPlacedOrder,
    toastMessage,
    showToast,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
