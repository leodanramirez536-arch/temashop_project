import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FlashDealBanner } from './components/FlashDealBanner';
import { CategoryPills } from './components/CategoryPills';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { OrdersModal } from './components/OrdersModal';
import { WishlistModal } from './components/WishlistModal';
import { Footer } from './components/Footer';
import { LegalModal, LegalPage } from './components/LegalModal';
import { Product, CartItem, User, Order, StoreSettings } from './types';
import {
  getStoredCart,
  saveStoredCart,
  getStoredWishlist,
  saveStoredWishlist,
  toggleProductInWishlist,
  purgeLegacyData,
  getGuestOrderRefs,
  addGuestOrderRef,
} from './utils/storage';
import {
  fetchProducts,
  fetchSettings,
  fetchOrders,
  fetchGuestOrder,
  getSessionUser,
  onAuthChange,
  signOut,
  DEFAULT_SETTINGS,
} from './lib/api';
import { DELIVERY_ESTIMATE, RETURN_DAYS } from './config';
import { 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Home, 
  LayoutDashboard, 
  Package, 
  SlidersHorizontal,
  Heart,
  Truck
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'update-password'>('login');
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);

  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Modals & Drawers States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [checkoutCoupon, setCheckoutCoupon] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoadError('');
      const list = await fetchProducts();
      setProducts(list);
      // Actualiza precios y stock de lo que ya está en la bolsa
      setCart((prev) => {
        const synced = prev
          .map((item) => {
            const fresh = list.find((p) => p.id === item.product.id);
            if (!fresh || fresh.stock <= 0) return null;
            return { product: fresh, quantity: Math.min(item.quantity, fresh.stock) };
          })
          .filter(Boolean) as CartItem[];
        saveStoredCart(synced);
        return synced;
      });
    } catch (err: any) {
      setLoadError(err?.message || 'No se pudieron cargar los productos.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadOrders = async (user: User | null) => {
    try {
      if (user) {
        setOrders(await fetchOrders());
      } else {
        const refs = getGuestOrderRefs();
        const found = await Promise.all(
          refs.map((r) => fetchGuestOrder(r.orderNumber, r.email).catch(() => null))
        );
        setOrders(found.filter(Boolean) as Order[]);
      }
    } catch {
      setOrders([]);
    }
  };

  // Carga inicial
  useEffect(() => {
    purgeLegacyData();
    setCart(getStoredCart());
    setWishlist(getStoredWishlist());
    loadProducts();
    fetchSettings().then(setSettings);
    getSessionUser().then((u) => {
      setCurrentUser(u);
      loadOrders(u);
    });

    const unsubscribe = onAuthChange((user, event) => {
      setCurrentUser(user);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') loadOrders(user);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update-password');
        setIsAuthOpen(true);
      }
    });
    return unsubscribe;
  }, []);

  // Save cart whenever it changes
  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    saveStoredCart(newCart);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = [...cart];
      const newQty = Math.min(product.stock, updatedCart[existingIndex].quantity + quantity);
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newQty,
      };
    } else {
      updatedCart = [...cart, { product, quantity: Math.min(product.stock, quantity) }];
    }

    updateCartState(updatedCart);
    showToast(`✓ "${product.title.slice(0, 25)}..." añadido a tu bolsa`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(item.product.stock, quantity) };
      }
      return item;
    });
    updateCartState(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    updateCartState(updated);
    showToast('Artículo retirado de la bolsa');
  };

  const handleClearCart = () => {
    updateCartState([]);
  };

  // "Comprar Ahora" quick action
  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setSelectedProductForDetail(null);
    setCheckoutCoupon(null);
    setIsCheckoutOpen(true);
  };

  // Proceed to checkout from cart drawer
  const handleProceedToCheckout = (coupon: string | null) => {
    setCheckoutCoupon(coupon);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order placed callback
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    if (!currentUser) addGuestOrderRef({ orderNumber: newOrder.orderNumber, email: newOrder.customerEmail });
    handleClearCart();
    loadProducts();
    showToast(`Pedido ${newOrder.orderNumber} recibido`);
  };

  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Auth Operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Bienvenido: ${user.name}`);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setIsAdminOpen(false);
    showToast('Has cerrado sesión correctamente');
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Admin products update
  const handleProductsUpdated = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  // Wishlist Operations
  const handleToggleWishlist = (product: Product) => {
    const isCurrentlyWishlisted = wishlist.includes(product.id);
    const updated = toggleProductInWishlist(product.id);
    setWishlist(updated);
    if (isCurrentlyWishlisted) {
      showToast('Eliminado de tu lista de favoritos');
    } else {
      showToast(`❤️ Guardado en Favoritos: ${product.title}`);
    }
  };

  const handleClearWishlist = () => {
    saveStoredWishlist([]);
    setWishlist([]);
    showToast('Lista de favoritos vaciada');
  };

  const handleAddAllWishlistToCart = (productsToAdd: Product[]) => {
    productsToAdd.forEach((p) => {
      handleAddToCart(p, 1);
    });
    showToast(`¡${productsToAdd.length} artículos añadidos a la Bolsa!`);
  };

  // Filtered & Sorted Products List
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory === 'Ofertas Flash') {
      result = result.filter((p) => p.isFlashDeal);
    } else if (selectedCategory !== 'Todas') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => {
          const discA = (a.originalPrice - a.price) / a.originalPrice;
          const discB = (b.originalPrice - b.price) / b.originalPrice;
          return discB - discA;
        });
        break;
      case 'sales':
        result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Featured
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active section for Mobile Bottom Nav
  const activeMobileTab = useMemo(() => {
    if (isCartOpen) return 'cart';
    if (isOrdersOpen) return 'orders';
    if (isWishlistOpen) return 'wishlist';
    if (isAdminOpen) return 'admin';
    if (selectedCategory !== 'Todas') return 'filters';
    return 'home';
  }, [isCartOpen, isOrdersOpen, isWishlistOpen, isAdminOpen, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-amber-400 pb-16 sm:pb-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-blue-950 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar (Azul Profundo con detalles Dorados) */}
      <Navbar
        currentUser={currentUser}
        cart={cart}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        wishlistCount={wishlist.length}
        onOpenAuth={() => openAuth('login')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {/* Flash Deals Hero Banner */}
        <FlashDealBanner
          onExploreDeals={() => {
            setSelectedCategory('Ofertas Flash');
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog Categories Navigation */}
        <div id="catalog-section">
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProductsCount={filteredProducts.length}
          />
        </div>

        {/* Products Grid: Fully Responsive */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 h-72 animate-pulse" />
              ))}
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-red-200 max-w-lg mx-auto space-y-3">
              <p className="text-sm font-bold text-red-700">{loadError}</p>
              <button
                onClick={() => { setIsLoadingProducts(true); loadProducts(); }}
                className="bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-2.5 px-6 rounded-xl"
              >
                Reintentar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                No se encontraron productos
              </h3>
              <p className="text-xs text-gray-500">
                {products.length === 0
                  ? 'Pronto agregaremos productos. ¡Vuelve en unos días!'
                  : searchQuery.trim()
                    ? `No hay artículos que coincidan con "${searchQuery}" en "${selectedCategory}".`
                    : `No hay artículos en "${selectedCategory}" por ahora.`}
              </p>
              <button
                id="reset-filter-button"
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSearchQuery('');
                }}
                className="bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-sm"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onOpenQuickView={(p) => setSelectedProductForDetail(p)}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </section>

        {/* Cómo compramos: información real */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">Envío a domicilio</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Entrega estimada en {DELIVERY_ESTIMATE}. Envío gratis en pedidos desde US${settings.freeShippingThreshold.toFixed(2)}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">Pago seguro</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Paga con tarjeta (procesada por PayPal), Zelle, Cash App o en efectivo al recibir. Nunca guardamos los datos de tu tarjeta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-blue-950 flex items-center justify-center flex-shrink-0 border border-slate-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">Devoluciones</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Tienes {RETURN_DAYS} días desde que recibes tu pedido para solicitar una devolución.{' '}
                  <button onClick={() => setLegalPage('returns')} className="text-blue-900 font-semibold underline">
                    Ver política
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={setLegalPage}
        onOpenOrders={() => setIsOrdersOpen(true)}
        freeShippingThreshold={settings.freeShippingThreshold}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR (Smartphones: Azul Profundo & Acentos Dorados) */}
      <nav 
        id="mobile-bottom-nav" 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1.5 px-2 flex sm:hidden items-center justify-around shadow-lg"
      >
        <button
          id="mobile-nav-home"
          onClick={() => {
            setSelectedCategory('Todas');
            setIsCartOpen(false);
            setIsOrdersOpen(false);
            setIsWishlistOpen(false);
            setIsAdminOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 active:scale-95 transition-all ${
            activeMobileTab === 'home'
              ? 'text-blue-950 font-black'
              : 'text-gray-500 hover:text-blue-900 font-semibold'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${activeMobileTab === 'home' ? 'scale-110 text-blue-950 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">Inicio</span>
          <span 
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 ${
              activeMobileTab === 'home'
                ? 'bg-amber-500 scale-100 opacity-100 shadow-xs'
                : 'bg-transparent scale-0 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          id="mobile-nav-filters"
          onClick={() => {
            setIsCartOpen(false);
            setIsOrdersOpen(false);
            setIsWishlistOpen(false);
            setIsAdminOpen(false);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 active:scale-95 transition-all ${
            activeMobileTab === 'filters'
              ? 'text-blue-950 font-black'
              : 'text-gray-500 hover:text-blue-900 font-semibold'
          }`}
        >
          <SlidersHorizontal className={`w-5 h-5 transition-transform duration-200 ${activeMobileTab === 'filters' ? 'scale-110 text-blue-950 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">Filtros</span>
          <span 
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 ${
              activeMobileTab === 'filters'
                ? 'bg-amber-500 scale-100 opacity-100 shadow-xs'
                : 'bg-transparent scale-0 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Wishlist Button in Mobile Bottom Nav */}
        <button
          id="mobile-nav-wishlist"
          onClick={() => setIsWishlistOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 relative active:scale-95 transition-all ${
            activeMobileTab === 'wishlist'
              ? 'text-rose-600 font-black'
              : 'text-gray-500 hover:text-rose-600 font-semibold'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 transition-transform duration-200 ${
              wishlist.length > 0 || activeMobileTab === 'wishlist'
                ? 'text-rose-500 fill-rose-500' 
                : ''
            } ${activeMobileTab === 'wishlist' ? 'scale-110' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length > 99 ? '99+' : wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Deseos</span>
          <span 
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 ${
              activeMobileTab === 'wishlist'
                ? 'bg-rose-500 scale-100 opacity-100 shadow-xs'
                : 'bg-transparent scale-0 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Admin button in mobile bottom bar */}
        <button
          id="mobile-nav-admin"
          onClick={() => {
            if (currentUser?.role === 'admin') {
              setIsAdminOpen(true);
            } else if (currentUser) {
              setIsOrdersOpen(true);
            } else {
              openAuth('login');
            }
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 active:scale-95 transition-all ${
            activeMobileTab === 'admin'
              ? 'text-amber-500 font-black'
              : currentUser?.role === 'admin'
                ? 'text-amber-600 font-bold'
                : 'text-gray-500 hover:text-blue-900 font-semibold'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${activeMobileTab === 'admin' ? 'scale-110 text-amber-500 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">
            {currentUser?.role === 'admin' ? 'Admin' : currentUser ? 'Cuenta' : 'Entrar'}
          </span>
          <span 
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 ${
              activeMobileTab === 'admin'
                ? 'bg-amber-500 scale-100 opacity-100 shadow-xs'
                : 'bg-transparent scale-0 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          id="mobile-nav-orders"
          onClick={() => setIsOrdersOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 active:scale-95 transition-all ${
            activeMobileTab === 'orders'
              ? 'text-blue-950 font-black'
              : 'text-gray-500 hover:text-blue-900 font-semibold'
          }`}
        >
          <Package className={`w-5 h-5 transition-transform duration-200 ${activeMobileTab === 'orders' ? 'scale-110 text-blue-950 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">Pedidos</span>
          <span 
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 ${
              activeMobileTab === 'orders'
                ? 'bg-amber-500 scale-100 opacity-100 shadow-xs'
                : 'bg-transparent scale-0 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          id="mobile-nav-cart"
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 relative active:scale-95 transition-all ${
            activeMobileTab === 'cart'
              ? 'text-blue-950 font-black'
              : 'text-gray-500 hover:text-blue-900 font-semibold'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform duration-200 ${activeMobileTab === 'cart' ? 'scale-110 text-blue-950 stroke-[2.5]' : ''}`} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-blue-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount > 99 ? '99+' : totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Bolsa</span>
          <span 
            className={`w-1.5 h-1.5 rounded-full mt-1 transition-all duration-300 ${
              activeMobileTab === 'cart'
                ? 'bg-amber-500 scale-100 opacity-100 shadow-xs'
                : 'bg-transparent scale-0 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>
      </nav>

      {/* MODALS & DRAWERS */}

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        products={products}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onAddAllToCart={handleAddAllWishlistToCart}
        onClearWishlist={handleClearWishlist}
        onOpenQuickView={(p) => setSelectedProductForDetail(p)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
        isWishlisted={selectedProductForDetail ? wishlist.includes(selectedProductForDetail.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        settings={settings}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        couponCode={checkoutCoupon}
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
        onOrderUpdated={handleOrderUpdated}
        onViewOrders={() => setIsOrdersOpen(true)}
        onOpenLegal={setLegalPage}
        onOpenAuth={() => openAuth('login')}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        products={products}
        orders={orders}
        onProductsUpdated={handleProductsUpdated}
        onOrderUpdated={handleOrderUpdated}
        onRefresh={() => { loadProducts(); loadOrders(currentUser); }}
        onOpenAuthForAdmin={() => openAuth('login')}
      />

      {/* Local Auth Modal */}
      <AuthModal
        key={`${authMode}-${isAuthOpen}`}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onNotice={showToast}
        initialMode={authMode}
      />

      {/* Orders History Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        currentUser={currentUser}
        onOpenAuth={() => { setIsOrdersOpen(false); openAuth('login'); }}
        onGuestOrderFound={(o) => {
          addGuestOrderRef({ orderNumber: o.orderNumber, email: o.customerEmail });
          setOrders((prev) => [o, ...prev.filter((x) => x.id !== o.id)]);
        }}
      />

      <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />

    </div>
  );
}
