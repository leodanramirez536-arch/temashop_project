// ======================================
// ALMACENAMIENTO - STORAGE UTIL (localStorage)
// ======================================
// Las credenciales del administrador se leen de variables de entorno
// (VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD). Configúralas en Vercel:
// Settings → Environment Variables. Si no existen, el acceso admin queda desactivado.

import { Product, User, Order, CartItem } from '../types';
import { initialProducts } from '../data/initialProducts';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

const USERS_KEY = 'temashop_users';
const PRODUCTS_KEY = 'temashop_products';
const ORDERS_KEY = 'temashop_orders';
const SESSION_KEY = 'temashop_session';
const CART_KEY = 'temashop_cart';
const WISHLIST_KEY = 'temashop_wishlist';

interface StoredUser extends User {
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

// ---------- helpers ----------
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`No se pudo guardar ${key}:`, error);
  }
}

function stripPassword(u: StoredUser): User {
  const { password: _pw, ...rest } = u;
  return rest;
}

// ---------- usuarios ----------
function getAllUsers(): StoredUser[] {
  return read<StoredUser[]>(USERS_KEY, []);
}

export function authenticateUser(email: string, password: string): AuthResult {
  const normEmail = email.trim().toLowerCase();

  if (ADMIN_EMAIL && ADMIN_PASSWORD && normEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      success: true,
      user: {
        id: 'admin-001',
        name: 'Administrador',
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    };
  }

  const user = getAllUsers().find((u) => u.email === normEmail && u.password === password);
  if (user) return { success: true, user: stripPassword(user) };

  return { success: false, error: 'Email o contraseña incorrectos.' };
}

export function registerUser(name: string, email: string, password: string): AuthResult {
  const normEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  if (!name.trim() || !normEmail) {
    return { success: false, error: 'Completa nombre y email.' };
  }
  if (normEmail === ADMIN_EMAIL || users.some((u) => u.email === normEmail)) {
    return { success: false, error: 'Este email ya está registrado.' };
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normEmail,
    password,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  write(USERS_KEY, users);
  return { success: true, user: stripPassword(newUser) };
}

export function getSession(): User | null {
  return read<User | null>(SESSION_KEY, null);
}

export function saveSession(user: User | null): void {
  if (user) write(SESSION_KEY, user);
  else localStorage.removeItem(SESSION_KEY);
}

// ---------- productos ----------
export function getProducts(): Product[] {
  const stored = read<Product[] | null>(PRODUCTS_KEY, null);
  if (!stored || !Array.isArray(stored)) {
    write(PRODUCTS_KEY, initialProducts);
    return [...initialProducts];
  }
  // reparar imágenes antiguas que ya no cargan
  const BROKEN_IMG = 'photo-1608248597359-0524458f4a13';
  if (stored.some((p) => p.imageUrl?.includes(BROKEN_IMG))) {
    const fixed = stored.map((p) =>
      p.imageUrl?.includes(BROKEN_IMG) ? { ...p, imageUrl: p.imageUrl.replace(BROKEN_IMG, 'photo-1620916566398-39f1143ab7be') } : p
    );
    write(PRODUCTS_KEY, fixed);
    return fixed;
  }
  return stored;
}

export function addProductToStorage(data: Omit<Product, 'id'>): Product {
  const product: Product = { ...data, id: `p-${Date.now()}` };
  write(PRODUCTS_KEY, [product, ...getProducts()]);
  return product;
}

export function updateProductInStorage(product: Product): Product[] {
  const updated = getProducts().map((p) => (p.id === product.id ? product : p));
  write(PRODUCTS_KEY, updated);
  return updated;
}

export function deleteProductFromStorage(productId: string): Product[] {
  const updated = getProducts().filter((p) => p.id !== productId);
  write(PRODUCTS_KEY, updated);
  return updated;
}

export function resetProductsToDefault(): Product[] {
  write(PRODUCTS_KEY, initialProducts);
  return [...initialProducts];
}

// ---------- órdenes ----------
export function getOrders(): Order[] {
  return read<Order[]>(ORDERS_KEY, []);
}

export function saveOrder(order: Order): Order[] {
  const updated = [order, ...getOrders()];
  write(ORDERS_KEY, updated);

  // descontar stock
  const products = getProducts().map((p) => {
    const item = order.items.find((i) => i.productId === p.id);
    return item ? { ...p, stock: Math.max(0, p.stock - item.quantity), salesCount: p.salesCount + item.quantity } : p;
  });
  write(PRODUCTS_KEY, products);
  return updated;
}

// ---------- carrito y deseos ----------
export function getCart(): CartItem[] {
  return read<CartItem[]>(CART_KEY, []);
}

export function saveCart(cart: CartItem[]): void {
  write(CART_KEY, cart);
}

export function getWishlist(): string[] {
  return read<string[]>(WISHLIST_KEY, []);
}

export function saveWishlist(ids: string[]): void {
  write(WISHLIST_KEY, ids);
}
