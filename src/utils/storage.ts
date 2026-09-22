// ======================================
// DATOS DE LA TIENDA
// Productos, pedidos y cuentas → Supabase (compartido por todos)
// Carrito y lista de deseos → navegador de cada cliente
// ======================================

import type { Session } from '@supabase/supabase-js';
import { supabase, ADMIN_EMAIL } from '../lib/supabase';
import { Product, User, Order, CartItem } from '../types';
import { initialProducts } from '../data/initialProducts';

const CART_KEY = 'temashop_cart';
const WISHLIST_KEY = 'temashop_wishlist';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
  needsConfirmation?: boolean;
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
  } catch {
    /* sin almacenamiento disponible */
  }
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo. Revisa tu bandeja de entrada (y spam).';
  if (m.includes('already registered')) return 'Este email ya está registrado. Inicia sesión.';
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
  if (m.includes('stock insuficiente')) return msg.replace(/^.*Stock/, 'Stock');
  return msg;
}

// ---------- mapeo filas <-> tipos ----------
interface ProductRow {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | string;
  original_price: number | string;
  stock: number;
  image_url: string;
  rating: number | string;
  reviews_count: number;
  sales_count: number;
  is_flash_deal: boolean;
  badge: string | null;
}

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  title: r.title,
  description: r.description,
  category: r.category,
  price: Number(r.price),
  originalPrice: Number(r.original_price),
  stock: r.stock,
  imageUrl: r.image_url,
  rating: Number(r.rating),
  reviewsCount: r.reviews_count,
  salesCount: r.sales_count,
  isFlashDeal: r.is_flash_deal,
  badge: r.badge || undefined,
});

const toRow = (p: Omit<Product, 'id'> & { id?: string }) => ({
  ...(p.id ? { id: p.id } : {}),
  title: p.title,
  description: p.description,
  category: p.category,
  price: p.price,
  original_price: p.originalPrice,
  stock: p.stock,
  image_url: p.imageUrl,
  rating: Math.min(5, Number(p.rating.toFixed(1))),
  reviews_count: p.reviewsCount,
  sales_count: p.salesCount,
  is_flash_deal: p.isFlashDeal,
  badge: p.badge || null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toOrder = (r: any): Order => ({
  id: r.id,
  orderNumber: r.order_number,
  createdAt: r.created_at,
  status: r.status,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  address: r.address,
  items: r.items,
  paymentMethod: r.payment_method,
  subtotal: Number(r.subtotal),
  shipping: Number(r.shipping),
  total: Number(r.total),
});

// ---------- cuentas ----------
export function userFromSession(session: Session | null): User | null {
  const u = session?.user;
  if (!u?.email) return null;
  const email = u.email.toLowerCase();
  return {
    id: u.id,
    name: (u.user_metadata?.name as string) || (email === ADMIN_EMAIL ? 'Administrador' : email.split('@')[0]),
    email,
    role: email === ADMIN_EMAIL ? 'admin' : 'customer',
    createdAt: u.created_at,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { success: false, error: translateError(error.message) };
  return { success: true, user: userFromSession(data.session) };
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResult> {
  if (!name.trim() || !email.trim()) return { success: false, error: 'Completa nombre y email.' };
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
  });
  if (error) return { success: false, error: translateError(error.message) };
  if (!data.session) return { success: true, needsConfirmation: true };
  return { success: true, user: userFromSession(data.session) };
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

// ---------- productos ----------
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(translateError(error.message));
  return (data as ProductRow[]).map(toProduct);
}

export async function addProductToStorage(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(toRow(product)).select().single();
  if (error) throw new Error(translateError(error.message));
  return toProduct(data as ProductRow);
}

export async function updateProductInStorage(product: Product): Promise<Product[]> {
  const { id, ...rest } = product;
  const { error } = await supabase.from('products').update(toRow(rest)).eq('id', id);
  if (error) throw new Error(translateError(error.message));
  return getProducts();
}

export async function deleteProductFromStorage(productId: string): Promise<Product[]> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw new Error(translateError(error.message));
  return getProducts();
}

export async function resetProductsToDefault(): Promise<Product[]> {
  const del = await supabase.from('products').delete().neq('id', '');
  if (del.error) throw new Error(translateError(del.error.message));
  const ins = await supabase.from('products').insert(initialProducts.map((p) => toRow(p)));
  if (ins.error) throw new Error(translateError(ins.error.message));
  return getProducts();
}

// ---------- pedidos ----------
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(toOrder);
}

export interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  address: Order['address'];
  items: { productId: string; quantity: number }[];
  paymentMethod: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const { data, error } = await supabase.rpc('place_order', {
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_address: input.address,
    p_items: input.items,
    p_payment_method: input.paymentMethod,
  });
  if (error) throw new Error(translateError(error.message));
  return toOrder(data);
}

// ---------- carrito y deseos (en el navegador) ----------
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
