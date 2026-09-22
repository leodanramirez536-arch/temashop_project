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

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
  status: 'completada' | 'procesando' | 'en_camino';
  createdAt: number;
  estimatedDeliveryDate: string;
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
