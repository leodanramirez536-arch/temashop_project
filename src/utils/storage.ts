import { Product, CartItem, User, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'temashop_products_v1',
  CURRENT_USER: 'temashop_current_user_v1',
  USERS: 'temashop_registered_users_v1',
  CART: 'temashop_cart_v1',
  ORDERS: 'temashop_orders_v1',
  WISHLIST: 'temashop_wishlist_v1',
};

// Fixed Default Admin User
export const DEFAULT_ADMIN: User = {
  id: 'admin-miguel-001',
  email: 'miguelgraphalterna@gmail.com',
  name: 'Miguel (Administrador TemaShop)',
  role: 'admin',
  createdAt: Date.now(),
};

// La contraseña del administrador NO se guarda en texto plano.
// Solo se guarda su huella SHA-256. Para cambiarla, define VITE_ADMIN_PASSWORD_HASH en Vercel.
const ADMIN_PASSWORD_HASH: string =
  (import.meta as any).env?.VITE_ADMIN_PASSWORD_HASH || '13a49fbba70dca52c85e17cc0a02151da2fe3e8a2b87867d5c4360b6d2585568';

// SHA-256 síncrono (UTF-8) -> hex
function sha256Hex(message: string): string {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  const bytes = Array.from(new TextEncoder().encode(message));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const W = new Array<number>(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < bytes.length; off += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = (bytes[off + t * 4] << 24) | (bytes[off + t * 4 + 1] << 16) | (bytes[off + t * 4 + 2] << 8) | bytes[off + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

interface StoredAccount {
  user: User;
  passwordHash: string;
}

// Helper to safely read from localStorage
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

// Helper to safely write to localStorage
function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// ----------------- PRODUCTS MANAGEMENT -----------------
export function getStoredProducts(): Product[] {
  const products = safeGetItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (!products || products.length === 0) {
    safeSetItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  return products;
}

export function saveStoredProducts(products: Product[]): void {
  safeSetItem(STORAGE_KEYS.PRODUCTS, products);
}

export function addProductToStorage(newProduct: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = getStoredProducts();
  const created: Product = {
    ...newProduct,
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  const updated = [created, ...products];
  saveStoredProducts(updated);
  return created;
}

export function updateProductInStorage(updatedProduct: Product): Product[] {
  const products = getStoredProducts();
  const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
  saveStoredProducts(updated);
  return updated;
}

export function deleteProductFromStorage(productId: string): Product[] {
  const products = getStoredProducts();
  const updated = products.filter((p) => p.id !== productId);
  saveStoredProducts(updated);
  return updated;
}

export function resetProductsToDefault(): Product[] {
  safeSetItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

// ----------------- AUTHENTICATION -----------------
export function getRegisteredAccounts(): StoredAccount[] {
  const accounts = safeGetItem<StoredAccount[]>(STORAGE_KEYS.USERS, []);
  // Ensure default admin always exists and is up to date
  const filtered = accounts.filter(
    (acc) => acc.user.email.toLowerCase() !== DEFAULT_ADMIN.email.toLowerCase()
  );
  const adminAccount: StoredAccount = {
    user: DEFAULT_ADMIN,
    passwordHash: ADMIN_PASSWORD_HASH,
  };
  const updated = [adminAccount, ...filtered];
  safeSetItem(STORAGE_KEYS.USERS, updated);
  return updated;
}

export function getCurrentUser(): User | null {
  const user = safeGetItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (user && user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()) {
    return DEFAULT_ADMIN;
  }
  return user;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    safeSetItem(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function authenticateUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();
  
  // Direct check for strict fixed administrator credentials
  if (trimmedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
    if (sha256Hex(password) === ADMIN_PASSWORD_HASH) {
      setCurrentUser(DEFAULT_ADMIN);
      return { success: true, user: DEFAULT_ADMIN };
    } else {
      return { success: false, error: 'Contraseña incorrecta para la cuenta de administrador.' };
    }
  }

  const accounts = getRegisteredAccounts();
  const account = accounts.find((acc) => acc.user.email.toLowerCase() === trimmedEmail);
  if (!account) {
    return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
  }

  if (account.passwordHash !== password) {
    return { success: false, error: 'Contraseña incorrecta. Por favor verifica tus datos.' };
  }

  setCurrentUser(account.user);
  return { success: true, user: account.user };
}

export function registerUser(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();

  if (accounts.some((acc) => acc.user.email.toLowerCase() === trimmedEmail)) {
    return { success: false, error: 'Este correo electrónico ya está registrado.' };
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    email: trimmedEmail,
    name: name.trim() || 'Cliente TemaShop',
    role: 'customer',
    createdAt: Date.now(),
  };

  const newAccount: StoredAccount = {
    user: newUser,
    passwordHash: password,
  };

  safeSetItem(STORAGE_KEYS.USERS, [...accounts, newAccount]);
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// ----------------- CART MANAGEMENT -----------------
export function getStoredCart(): CartItem[] {
  return safeGetItem<CartItem[]>(STORAGE_KEYS.CART, []);
}

export function saveStoredCart(cart: CartItem[]): void {
  safeSetItem(STORAGE_KEYS.CART, cart);
}

// ----------------- ORDERS MANAGEMENT -----------------
export function getStoredOrders(): Order[] {
  return safeGetItem<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export function saveOrderToStorage(order: Order): void {
  const orders = getStoredOrders();
  safeSetItem(STORAGE_KEYS.ORDERS, [order, ...orders]);
}

// ----------------- WISHLIST (LISTA DE DESEOS) -----------------
export function getStoredWishlist(): string[] {
  return safeGetItem<string[]>(STORAGE_KEYS.WISHLIST, []);
}

export function saveStoredWishlist(wishlist: string[]): void {
  safeSetItem(STORAGE_KEYS.WISHLIST, wishlist);
}

export function toggleProductInWishlist(productId: string): string[] {
  const current = getStoredWishlist();
  const exists = current.includes(productId);
  const updated = exists 
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  saveStoredWishlist(updated);
  return updated;
}
