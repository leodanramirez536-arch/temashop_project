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

export const DEFAULT_ADMIN_PASSWORD = 'migue5213580';

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
    passwordHash: DEFAULT_ADMIN_PASSWORD,
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
    if (password === DEFAULT_ADMIN_PASSWORD) {
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
