import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export const SHIPPING_FREE_FROM = 35;
export const SHIPPING_COST = 4.99;

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const missing = Math.max(0, SHIPPING_FREE_FROM - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-xs" onClick={onClose} />
      <aside className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between">
          <h2 className="font-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" /> Tu carrito ({items.length})
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2 p-6 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
            Tu carrito está vacío. ¡Explora las ofertas flash!
          </div>
        ) : (
          <>
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 font-semibold">
              {missing > 0
                ? `Agrega $${missing.toFixed(2)} más para envío GRATIS`
                : '🎉 ¡Tienes envío GRATIS!'}
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-4 flex gap-3">
                  <img src={product.imageUrl} alt={product.title} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 line-clamp-2">{product.title}</p>
                    <p className="text-sm font-black text-rose-600">${product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="p-1 border border-slate-200 rounded-lg hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-1 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => onRemove(product.id)} className="ml-auto p-1 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <strong className="text-blue-950 text-lg">${subtotal.toFixed(2)}</strong>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-amber-400 hover:bg-amber-300 text-blue-950 font-black py-3 rounded-xl shadow-md"
              >
                Proceder al pago
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
