import React, { useEffect, useMemo, useState } from 'react';
import { Zap, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { Product, CartItem, User, Order } from './types';
import {
  getProducts,
  getOrders,
  saveOrder,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  getSession,
  saveSession,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WishlistModal } from './components/WishlistModal';
import { OrdersModal } from './components/OrdersModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';

const appName = 'TemaShop';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [wishlist, setWishlist] = useState<string[]>(() => getWishlist());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSession());

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [onlyFlash, setOnlyFlash] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => saveCart(cart), [cart]);
  useEffect(() => saveWishlist(wishlist), [wishlist]);
  useEffect(() => saveSession(currentUser), [currentUser]);

  // mantener el carrito sincronizado con el catálogo (precio/stock/eliminados)
  useEffect(() => {
    setCart((prev) =>
      prev
        .map((i) => {
          const p = products.find((x) => x.id === i.product.id);
          return p ? { product: p, quantity: Math.min(i.quantity, Math.max(p.stock, 0)) } : null;
        })
        .filter((i): i is CartItem => !!i && i.quantity > 0)
    );
  }, [products]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const visibleProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCat = category === 'Todas' || p.category === category;
    return matchesQ && matchesCat && (!onlyFlash || p.isFlashDeal);
  });

  const flashDeals = products.filter((p) => p.isFlashDeal && p.stock > 0).slice(0, 4);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`"${product.title}" agregado al carrito`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, quantity: Math.min(quantity, i.product.stock) } : i))
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  const handlePlaceOrder = (order: Order) => {
    setOrders(saveOrder(order));
    setProducts(getProducts());
    setCart([]);
  };

  const userOrders = currentUser
    ? currentUser.role === 'admin'
      ? orders
      : orders.filter((o) => o.customerEmail === currentUser.email)
    : [];

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar
        currentUser={currentUser}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setAdminOpen(false);
          showToast('Sesión cerrada');
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 p-6 sm:p-10 text-blue-950 relative overflow-hidden">
          <div className="max-w-xl space-y-3 relative">
            <span className="inline-flex items-center gap-1 bg-blue-950 text-amber-400 text-xs font-black px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5" /> OFERTAS FLASH DE HOY
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">Hasta 70% de descuento en {appName}</h1>
            <p className="text-sm sm:text-base font-semibold text-blue-950/80">
              Tecnología, hogar, moda y más. Envío gratis desde $35.
            </p>
            <button
              onClick={() => {
                setOnlyFlash(true);
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-blue-950 hover:bg-blue-900 text-amber-400 font-black px-6 py-3 rounded-full shadow-lg"
            >
              Ver ofertas
            </button>
          </div>
          <span className="absolute -right-6 -bottom-10 text-[10rem] sm:text-[14rem] opacity-20 select-none">🛍️</span>
        </section>

        {/* Beneficios */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { icon: <Truck className="w-5 h-5 text-blue-900" />, t: 'Envío gratis', d: 'En pedidos desde $35' },
            { icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, t: 'Compra segura', d: 'Protección en cada pedido' },
            { icon: <RotateCcw className="w-5 h-5 text-amber-600" />, t: 'Devoluciones', d: 'Hasta 30 días' },
          ].map((b) => (
            <div key={b.t} className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3">
              {b.icon}
              <div>
                <strong className="block text-slate-900">{b.t}</strong>
                <span className="text-slate-500">{b.d}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Flash deals */}
        {flashDeals.length > 0 && (
          <section className="bg-blue-950 rounded-3xl p-4 sm:p-5">
            <h2 className="text-amber-400 font-black text-lg flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" /> Ofertas relámpago
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {flashDeals.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.includes(p.id)}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onOpenDetail={setDetailProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Catálogo */}
        <section id="catalogo" className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  category === c ? 'bg-blue-900 text-amber-400 border-blue-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={onlyFlash} onChange={(e) => setOnlyFlash(e.target.checked)} />
              Solo ofertas flash
            </label>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              No encontramos productos con esos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {visibleProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlist.includes(p.id)}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onOpenDetail={setDetailProduct}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-blue-950 text-slate-300 text-xs text-center py-6 mt-8">
        © {new Date().getFullYear()} {appName}. Todos los derechos reservados.
      </footer>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] bg-blue-950 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={(id) => updateQuantity(id, 0)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      {checkoutOpen && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          items={cart}
          currentUser={currentUser}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
      <ProductDetailModal
        product={detailProduct}
        isWishlisted={!!detailProduct && wishlist.includes(detailProduct.id)}
        onClose={() => setDetailProduct(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />
      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={products.filter((p) => wishlist.includes(p.id))}
        onAddToCart={addToCart}
        onRemove={toggleWishlist}
      />
      <OrdersModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} orders={userOrders} />
      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            showToast(`Bienvenido, ${u.name}`);
          }}
        />
      )}
      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        currentUser={currentUser}
        products={products}
        orders={orders}
        onProductsUpdated={setProducts}
        onOpenAuthForAdmin={() => setAuthOpen(true)}
      />
    </div>
  );
}
