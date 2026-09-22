import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  Zap, 
  LogOut, 
  Package, 
  LayoutDashboard,
  X,
  Menu,
  ChevronRight,
  Layers,
  Laptop,
  Shirt,
  UtensilsCrossed,
  Sparkles,
  Activity,
  Glasses,
  Crown,
  Heart
} from 'lucide-react';
import { User, CartItem } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cart: CartItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  wishlistCount: number;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onLogout: () => void;
  onSelectCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cart,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenWishlist,
  wishlistCount,
  onOpenAuth,
  onOpenAdmin,
  onOpenOrders,
  onLogout,
  onSelectCategory,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const categories = [
    { name: 'Todas', icon: <Layers className="w-4 h-4" /> },
    { name: 'Ofertas Flash', icon: <Zap className="w-4 h-4 text-amber-500 fill-current" /> },
    { name: 'Tecnología', icon: <Laptop className="w-4 h-4" /> },
    { name: 'Hogar y Cocina', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { name: 'Moda y Calzado', icon: <Shirt className="w-4 h-4" /> },
    { name: 'Belleza y Cuidado', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Deportes y Aire Libre', icon: <Activity className="w-4 h-4" /> },
    { name: 'Accesorios', icon: <Glasses className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* Top promotional bar: Azul Profundo & Acentos Dorados */}
      <div className="bg-blue-950 text-white text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-blue-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-blue-950 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3 h-3 text-blue-950 fill-current" /> Selección Premium
            </span>
            <span className="hidden sm:inline text-blue-100">Envío gratis en pedidos desde US$25 · Paga con PayPal o contra entrega</span>
            <span className="sm:hidden text-[11px] text-blue-100">Envío gratis desde US$25</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline bg-blue-900/80 px-2.5 py-0.5 rounded border border-blue-800 text-blue-200">
              Cupón 10% OFF: <strong className="text-amber-400">TEMASHOP10</strong>
            </span>
            <span className="flex items-center gap-1 text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Pago seguro
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Mobile hamburger button */}
          <button
            id="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-blue-950 hover:text-amber-600 lg:hidden rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú de navegación móvil"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo: Azul Profundo con Dorado */}
          <div 
            id="brand-logo"
            onClick={() => onSelectCategory('Todas')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-950 via-blue-900 to-blue-800 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-blue-950/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-3xl font-black tracking-tight text-blue-950 font-sans">
                  Tema<span className="text-amber-500">Shop</span>
                </span>
                <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  ELITE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium hidden sm:block -mt-1">
                Tienda en línea
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-4">
            <div className="relative">
              <div className="flex items-center w-full border-2 border-blue-900 rounded-full overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-amber-400">
                <div className="pl-3 sm:pl-4 text-blue-900">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                </div>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Buscar en el catálogo departamental..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full py-1.5 sm:py-2.5 px-2.5 sm:px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    id="clear-search-button"
                    onClick={() => onSearchChange('')}
                    className="p-1 mr-1.5 text-gray-400 hover:text-gray-600 rounded-full"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="search-submit-button"
                  className="bg-blue-900 hover:bg-blue-800 text-amber-400 px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm transition-colors items-center gap-1 hidden md:flex border-l border-blue-800"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* DIRECT ADMIN ACCESS BUTTON */}
            {currentUser?.role === 'admin' ? (
              <button
                id="navbar-admin-button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 hover:from-blue-900 hover:to-blue-800 text-white border border-amber-500/40 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 animate-in fade-in"
                title="Abrir Panel de Administración"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Panel Admin</span>
                <span className="bg-amber-500 text-blue-950 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  ADMIN
                </span>
              </button>
            ) : null}

            {/* User Session / Account Button */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    id="user-menu-button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-semibold text-gray-800 leading-tight flex items-center gap-1">
                        <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                        {currentUser.role === 'admin' && (
                          <span className="bg-amber-500 text-blue-950 text-[9px] px-1 rounded font-black">ADMIN</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">Mi Cuenta</span>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-bold text-gray-900">{currentUser.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            currentUser.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {currentUser.role === 'admin' ? '🛡️ Administrador Oficial' : '🛍️ Cliente'}
                          </span>
                        </div>

                        {currentUser.role === 'admin' && (
                          <button
                            id="dropdown-admin-button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenAdmin();
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-blue-900 hover:bg-blue-50 flex items-center gap-2 font-bold"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-500" />
                            Panel de Administración & Inventario
                          </button>
                        )}

                        <button
                          id="dropdown-orders-button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenOrders();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                        >
                          <Package className="w-4 h-4 text-blue-900" />
                          Mis Pedidos y Envíos
                        </button>

                        <button
                          id="dropdown-wishlist-button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenWishlist();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-rose-50 flex items-center justify-between font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                            <span>Mi Lista de Deseos</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          id="dropdown-logout-button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  id="auth-open-button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-blue-950 hover:text-amber-600 hover:bg-blue-50 font-bold text-xs transition-colors border border-blue-900/30"
                >
                  <UserIcon className="w-4 h-4 text-blue-900" />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>

            {/* Wishlist Trigger Button */}
            <button
              id="wishlist-trigger-button"
              onClick={onOpenWishlist}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-blue-950 hover:text-rose-600 hover:bg-rose-50/80 transition-all border border-slate-200 hover:border-rose-200 active:scale-95 bg-white shadow-2xs"
              title="Mi Lista de Deseos (Favoritos)"
              aria-label="Abrir lista de deseos"
            >
              <div className="relative">
                <Heart className={`w-5 h-5 transition-transform ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500 scale-105' : 'text-slate-600'}`} />
                {wishlistCount > 0 && (
                  <span 
                    id="wishlist-badge-count"
                    className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold text-slate-700">
                Favoritos
              </span>
            </button>

            {/* Cart Trigger: Azul Profundo con Insignia Dorada */}
            <button
              id="cart-trigger-button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold shadow-md shadow-blue-950/20 active:scale-95 transition-all border border-blue-800"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                {totalCartItems > 0 && (
                  <span 
                    id="cart-badge-count"
                    className="absolute -top-2.5 -right-2.5 bg-amber-500 text-blue-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                  >
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-semibold">
                {totalCartItems > 0 ? `$${cartSubtotal.toFixed(2)}` : 'Bolsa'}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE FULL-HEIGHT DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-900 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-black text-lg tracking-tight">Tema<span className="text-amber-500">Shop</span></span>
              </div>
              <button
                id="close-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User status card in drawer */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-900 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  {currentUser.role === 'admin' ? (
                    <div className="bg-blue-950 text-white border border-amber-500/40 rounded-xl p-2 text-xs font-bold flex items-center justify-between">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" /> Administrador
                      </span>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-md"
                      >
                        Abrir Panel
                      </button>
                    </div>
                  ) : (
                    <span className="inline-block text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                      🛍️ Cuenta Cliente
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-2.5 rounded-xl shadow-xs"
                >
                  Iniciar Sesión / Registrarse
                </button>
              )}
            </div>

            {/* Navigation links in drawer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* If Admin, show big panel button */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-amber-400 font-black p-3 rounded-2xl flex items-center justify-between shadow-md border border-amber-500/30"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-amber-400" />
                    Panel de Administración
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              )}

              {/* Categories list */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Departamentos de Mercancía
                </span>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        onSelectCategory(cat.name);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-900 font-semibold text-gray-700 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {cat.icon}
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Accesos Directos
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOrders();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 font-semibold text-gray-700 flex items-center gap-2.5"
                >
                  <Package className="w-4 h-4 text-blue-900" />
                  <span>Mis Pedidos y Envíos</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-rose-50 font-semibold text-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
                    <span>Mi Lista de Deseos</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 font-semibold text-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-blue-900" />
                    <span>Mi Bolsa</span>
                  </div>
                  {totalCartItems > 0 && (
                    <span className="bg-amber-500 text-blue-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                      {totalCartItems} items
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* Logout button in drawer */}
            {currentUser && (
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
