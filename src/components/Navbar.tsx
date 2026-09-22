import React from 'react';
import { ShoppingCart, Heart, Search, User as UserIcon, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
        <a href="#" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xl">🛍️</span>
          <span className="text-lg sm:text-xl font-black tracking-tight">
            Tema<span className="text-amber-400">Shop</span>
          </span>
        </a>

        <div className="flex-1 relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos, marcas y categorías..."
            className="w-full pl-9 pr-3 py-2.5 rounded-full text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <nav className="flex items-center gap-1 sm:gap-2 ml-auto">
          {currentUser?.role === 'admin' && (
            <button onClick={onOpenAdmin} className="p-2 rounded-full hover:bg-white/10" title="Panel admin">
              <LayoutDashboard className="w-5 h-5 text-amber-400" />
            </button>
          )}
          {currentUser && (
            <button onClick={onOpenOrders} className="p-2 rounded-full hover:bg-white/10" title="Mis pedidos">
              <Package className="w-5 h-5" />
            </button>
          )}
          <button onClick={onOpenWishlist} className="relative p-2 rounded-full hover:bg-white/10" title="Lista de deseos">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          <button onClick={onOpenCart} className="relative p-2 rounded-full hover:bg-white/10" title="Carrito">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-blue-950 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {currentUser ? (
            <div className="flex items-center gap-1">
              <span className="hidden md:inline text-xs font-bold max-w-[120px] truncate">Hola, {currentUser.name}</span>
              <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/10" title="Cerrar sesión">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-black px-3 py-2 rounded-full"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </button>
          )}
        </nav>
      </div>

      <div className="sm:hidden px-3 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-9 pr-3 py-2 rounded-full text-sm text-slate-900 bg-white focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
