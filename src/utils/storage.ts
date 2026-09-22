import { CartItem } from '../types';

// En el navegador solo se guardan cosas no sensibles: la bolsa, los favoritos
// y los números de pedido de compras hechas sin cuenta.
// Productos, pedidos y cuentas viven en Supabase.
const STORAGE_KEYS = {
  CART: 'temashop_cart_v2',
  WISHLIST: 'temashop_wishlist_v1',
  GUEST_ORDERS: 'temashop_guest_orders_v1',
};

// Datos de la versión anterior (cuentas con contraseñas, sesión, productos y pedidos locales).
// Se borran para que no quede nada guardado en el navegador.
const LEGACY_KEYS = [
  'temashop_products_v1',
  'temashop_current_user_v1',
  'temashop_registered_users_v1',
  'temashop_cart_v1',
  'temashop_orders_v1',
];

export function purgeLegacyData(): void {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* sin acceso a localStorage */
  }
}

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

// ----------------- BOLSA -----------------
export function getStoredCart(): CartItem[] {
  const cart = safeGetItem<CartItem[]>(STORAGE_KEYS.CART, []);
  return Array.isArray(cart) ? cart.filter((i) => i?.product?.id && i.quantity > 0) : [];
}

export function saveStoredCart(cart: CartItem[]): void {
  safeSetItem(STORAGE_KEYS.CART, cart);
}

// ----------------- FAVORITOS -----------------
export function getStoredWishlist(): string[] {
  const list = safeGetItem<string[]>(STORAGE_KEYS.WISHLIST, []);
  return Array.isArray(list) ? list : [];
}

export function saveStoredWishlist(wishlist: string[]): void {
  safeSetItem(STORAGE_KEYS.WISHLIST, wishlist);
}

export function toggleProductInWishlist(productId: string): string[] {
  const current = getStoredWishlist();
  const updated = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  saveStoredWishlist(updated);
  return updated;
}

// ----------------- PEDIDOS SIN CUENTA -----------------
export interface GuestOrderRef {
  orderNumber: string;
  email: string;
}

export function getGuestOrderRefs(): GuestOrderRef[] {
  const refs = safeGetItem<GuestOrderRef[]>(STORAGE_KEYS.GUEST_ORDERS, []);
  return Array.isArray(refs) ? refs : [];
}

export function addGuestOrderRef(ref: GuestOrderRef): void {
  const refs = getGuestOrderRefs().filter((r) => r.orderNumber !== ref.orderNumber);
  safeSetItem(STORAGE_KEYS.GUEST_ORDERS, [ref, ...refs].slice(0, 30));
}
