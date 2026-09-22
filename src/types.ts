export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  salesCount?: number;
  isFlashDeal?: boolean;
  badge?: string;
  createdAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: number;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
export type PaymentStatus = 'pendiente' | 'pagado' | 'reembolsado';
export type PaymentMethod = 'paypal' | 'cash_on_delivery' | 'zelle' | 'cashapp';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: number;
}

export interface StoreSettings {
  freeShippingThreshold: number;
  shippingFee: number;
  currency: string;
}

export type Category = 
  | 'Todas'
  | 'Ofertas Flash'
  | 'Tecnología'
  | 'Moda y Calzado'
  | 'Hogar y Cocina'
  | 'Belleza y Cuidado'
  | 'Deportes y Aire Libre'
  | 'Accesorios';
