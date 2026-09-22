import { supabase, ADMIN_EMAIL } from './supabase';
import { Product, Order, User, StoreSettings, PaymentMethod, OrderStatus, PaymentStatus } from '../types';

// ---------------- Helpers ----------------
const friendlyError = (err: any): string => {
  const msg: string = err?.message || String(err || 'Error desconocido');
  if (/Invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
  if (/Email not confirmed/i.test(msg)) return 'Debes confirmar tu correo. Revisa tu bandeja de entrada (y la carpeta de spam).';
  if (/User already registered/i.test(msg)) return 'Este correo ya tiene una cuenta. Inicia sesión.';
  if (/Password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/rate limit/i.test(msg)) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  return msg;
};

export class ApiError extends Error {}
const fail = (err: any): never => {
  throw new ApiError(friendlyError(err));
};

// ---------------- Productos ----------------
const mapProduct = (r: any): Product => ({
  id: r.id,
  title: r.title,
  description: r.description || '',
  category: r.category,
  price: Number(r.price),
  originalPrice: Number(r.original_price),
  stock: Number(r.stock),
  imageUrl: r.image_url || '',
  rating: Number(r.rating || 0),
  reviewsCount: Number(r.reviews_count || 0),
  salesCount: Number(r.sales_count || 0),
  isFlashDeal: !!r.is_flash_deal,
  badge: r.badge || undefined,
  createdAt: new Date(r.created_at).getTime(),
});

const productToRow = (p: Partial<Product>) => {
  const row: Record<string, any> = {};
  if (p.title !== undefined) row.title = p.title.trim();
  if (p.description !== undefined) row.description = p.description.trim();
  if (p.category !== undefined) row.category = p.category;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = Math.max(p.originalPrice, p.price ?? 0);
  if (p.stock !== undefined) row.stock = Math.max(0, Math.floor(p.stock));
  if (p.imageUrl !== undefined) row.image_url = p.imageUrl.trim();
  if (p.isFlashDeal !== undefined) row.is_flash_deal = p.isFlashDeal;
  if (p.badge !== undefined) row.badge = p.badge?.trim() || null;
  return row;
};

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) fail(error);
  return (data || []).map(mapProduct);
}

export async function createProduct(p: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewsCount' | 'salesCount'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...productToRow(p), id: `p-${Date.now()}` })
    .select('*')
    .single();
  if (error) fail(error);
  return mapProduct(data);
}

export async function updateProduct(p: Product): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(productToRow(p))
    .eq('id', p.id)
    .select('*')
    .single();
  if (error) fail(error);
  return mapProduct(data);
}

// Se "archiva" en lugar de borrar, así los pedidos antiguos siguen mostrando sus datos
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id);
  if (error) fail(error);
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new ApiError('El archivo debe ser una imagen.');
  if (file.size > 5 * 1024 * 1024) throw new ApiError('La imagen no puede pesar más de 5 MB.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
  });
  if (error) fail(error);
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

// ---------------- Configuración ----------------
export const DEFAULT_SETTINGS: StoreSettings = { freeShippingThreshold: 25, shippingFee: 4.99, currency: 'USD' };

export async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return {
    freeShippingThreshold: Number(data.free_shipping_threshold),
    shippingFee: Number(data.shipping_fee),
    currency: data.currency || 'USD',
  };
}

export async function checkCoupon(code: string): Promise<number> {
  const { data, error } = await supabase.rpc('check_coupon', { p_code: code });
  if (error) fail(error);
  return Number(data || 0);
}

// ---------------- Cuentas ----------------
const toUser = (u: any): User => ({
  id: u.id,
  email: (u.email || '').toLowerCase(),
  name: u.user_metadata?.name || (u.email || '').split('@')[0] || 'Cliente',
  role: (u.email || '').toLowerCase() === ADMIN_EMAIL ? 'admin' : 'customer',
  createdAt: new Date(u.created_at).getTime(),
});

export async function getSessionUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ? toUser(data.session.user) : null;
}

export function onAuthChange(cb: (user: User | null, event: string) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    cb(session?.user ? toUser(session.user) : null, event);
  });
  return () => data.subscription.unsubscribe();
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) fail(error);
  return toUser(data.user);
}

// Devuelve el usuario si la sesión quedó abierta, o null si debe confirmar su correo
export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
  });
  if (error) fail(error);
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new ApiError('Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.');
  }
  return data.session?.user ? toUser(data.session.user) : null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin,
  });
  if (error) fail(error);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) fail(error);
}

// ---------------- Pedidos ----------------
const mapOrder = (r: any): Order => ({
  id: r.id,
  orderNumber: r.order_number,
  userId: r.user_id || null,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone || '',
  address: {
    street: r.address?.street || '',
    city: r.address?.city || '',
    state: r.address?.state || '',
    zipCode: r.address?.zipCode || '',
    notes: r.address?.notes || '',
  },
  items: (r.items || []).map((i: any) => ({
    id: i.productId,
    title: i.title,
    price: Number(i.price),
    quantity: Number(i.quantity),
    imageUrl: i.imageUrl || '',
  })),
  subtotal: Number(r.subtotal),
  discount: Number(r.discount || 0),
  couponCode: r.coupon_code || null,
  shipping: Number(r.shipping),
  total: Number(r.total),
  paymentMethod: r.payment_method,
  paymentStatus: r.payment_status || 'pendiente',
  status: r.status,
  createdAt: new Date(r.created_at).getTime(),
});

export interface PlaceOrderInput {
  name: string;
  email: string;
  phone: string;
  address: { street: string; city: string; state: string; zipCode: string; notes: string };
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  coupon?: string | null;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const { data, error } = await supabase.rpc('place_order', {
    p_customer_name: input.name,
    p_customer_email: input.email,
    p_customer_phone: input.phone,
    p_address: input.address,
    p_items: input.items,
    p_payment_method: input.paymentMethod,
    p_coupon: input.coupon || null,
  });
  if (error) fail(error);
  return mapOrder(data);
}

// Admin: ve todos. Cliente: solo los suyos (lo garantiza la base de datos)
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) fail(error);
  return (data || []).map(mapOrder);
}

export async function fetchGuestOrder(orderNumber: string, email: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_order_public', {
    p_order_number: orderNumber,
    p_email: email,
  });
  if (error) fail(error);
  const row = Array.isArray(data) ? data[0] : data;
  return row ? mapOrder(row) : null;
}

export async function updateOrder(
  id: string,
  changes: { status?: OrderStatus; paymentStatus?: PaymentStatus }
): Promise<Order> {
  const row: Record<string, any> = {};
  if (changes.status) row.status = changes.status;
  if (changes.paymentStatus) row.payment_status = changes.paymentStatus;
  const { data, error } = await supabase.from('orders').update(row).eq('id', id).select('*').single();
  if (error) fail(error);
  return mapOrder(data);
}

// ---------------- PayPal (verificado en el servidor, ver /api) ----------------
export async function paypalCreateOrder(orderId: string): Promise<string> {
  const res = await fetch('/api/paypal-create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.id) throw new ApiError(json.error || 'No se pudo iniciar el pago con PayPal.');
  return json.id;
}

export async function paypalCaptureOrder(orderId: string, paypalOrderId: string): Promise<void> {
  const res = await fetch('/api/paypal-capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, paypalOrderId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new ApiError(json.error || 'No se pudo confirmar el pago con PayPal.');
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pago pendiente',
  pagado: 'Pagado',
  reembolsado: 'Reembolsado',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paypal: 'PayPal / Tarjeta',
  cash_on_delivery: 'Contra entrega',
};
