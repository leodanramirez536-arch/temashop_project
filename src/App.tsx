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
import { Product, CartItem, User, Order } from './types';
import { 
  getStoredProducts, 
  getCurrentUser, 
  logoutUser, 
  getStoredCart, 
  saveStoredCart, 
  getStoredOrders,
  getStoredWishlist,
  saveStoredWishlist,
  toggleProductInWishlist,
  DEFAULT_ADMIN,
  DEFAULT_ADMIN_PASSWORD
} from './utils/storage';
import { 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Home, 
  LayoutDashboard, 
  Package, 
  SlidersHorizontal,
  Crown,
  Heart
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

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
  const [checkoutDiscountRate, setCheckoutDiscountRate] = useState<number>(0);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data from localStorage on mount
  useEffect(() => {
    const loadedProducts = getStoredProducts();
    const loadedUser = getCurrentUser();
    const loadedCart = getStoredCart();
    const loadedOrders = getStoredOrders();
    const loadedWishlist = getStoredWishlist();

    setProducts(loadedProducts);
    setCurrentUser(loadedUser);
    setCart(loadedCart);
    setOrders(loadedOrders);
    setWishlist(loadedWishlist);
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
    setCheckoutDiscountRate(0);
    setIsCheckoutOpen(true);
  };

  // Proceed to checkout from cart drawer
  const handleProceedToCheckout = (discountRate: number) => {
    setCheckoutDiscountRate(discountRate);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order placed callback
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    handleClearCart();
    showToast(`¡Orden ${newOrder.orderNumber} confirmada con éxito!`);
  };

  // Auth Operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Bienvenido: ${user.name}`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('Has cerrado sesión correctamente');
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
        onOpenAuth={() => setIsAuthOpen(true)}
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

        {/* Admin Credential Banner (Estética Departamental Premium) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-1 mb-2">
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border border-blue-800/90 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-500 text-blue-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 flex items-center gap-1 shadow-xs">
                <Crown className="w-3 h-3 text-blue-950" />
                ADMIN OFICIAL
              </span>
              <div className="text-left text-blue-100">
                {currentUser?.role === 'admin' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Has iniciado sesión como Administrador Oficial ({currentUser.email}).
                  </span>
                ) : (
                  <span>
                    Credenciales de Administrador: <code className="bg-blue-900 px-2 py-0.5 rounded-md border border-blue-700 font-bold text-amber-400">{DEFAULT_ADMIN.email}</code> | Contraseña: <code className="bg-blue-900 px-2 py-0.5 rounded-md border border-blue-700 font-bold text-amber-400">{DEFAULT_ADMIN_PASSWORD}</code>
                  </span>
                )}
              </div>
            </div>

            <button
              id="admin-banner-quick-button"
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setIsAdminOpen(true);
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-xs px-4 py-2 rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{currentUser?.role === 'admin' ? 'Abrir Panel de Administración' : 'Iniciar como Administrador'}</span>
            </button>
          </div>
        </div>

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
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                No se encontraron productos
              </h3>
              <p className="text-xs text-gray-500">
                No hay artículos que coincidan con "{searchQuery}" en la categoría "{selectedCategory}".
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

        {/* Department Store Guarantees Section */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">Precios Directos y Colecciones</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Conectamos con fabricantes selectos para ofrecer artículos exclusivos con descuentos de hasta el 70%.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">Garantía TemaShop Elite</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Garantía total de reembolso durante 90 días con devolución asistida y servicio de atención prioritaria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-blue-950 flex items-center justify-center flex-shrink-0 border border-slate-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">Mercancía por Categorías</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Administración integral de stock organizada en tiempo real con persistencia en almacenamiento local.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
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
            } else {
              setIsAuthOpen(true);
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
            {currentUser?.role === 'admin' ? 'Admin' : 'Admin'}
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
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        discountRate={checkoutDiscountRate}
        onOrderSuccess={handleOrderSuccess}
        onViewOrders={() => setIsOrdersOpen(true)}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        products={products}
        orders={orders}
        onProductsUpdated={handleProductsUpdated}
        onOpenAuthForAdmin={() => setIsAuthOpen(true)}
      />

      {/* Local Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Orders History Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        currentUser={currentUser}
      />

    </div>
  );
}
