import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onRemove: (productId: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose, products, onAddToCart, onRemove }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between">
          <h2 className="font-black flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" /> Lista de deseos ({products.length})
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto divide-y divide-slate-100">
          {products.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Aún no has guardado productos.</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-3">
                <img src={p.imageUrl} alt={p.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold line-clamp-1">{p.title}</p>
                  <p className="text-sm font-black text-rose-600">${p.price.toFixed(2)}</p>
                </div>
                <button
                  disabled={p.stock <= 0}
                  onClick={() => onAddToCart(p)}
                  className="p-2 bg-blue-900 text-amber-400 rounded-xl disabled:opacity-40"
                  title="Agregar al carrito"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button onClick={() => onRemove(p.id)} className="p-2 text-slate-400 hover:text-rose-600" title="Quitar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
