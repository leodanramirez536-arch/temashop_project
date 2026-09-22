export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  isFlashDeal: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'Procesando' | 'Enviado' | 'Entregado';
  customerName: string;
  customerEmail: string;
  address: ShippingAddress;
  items: OrderItem[];
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
}
