import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { checkCoupon } from '../lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (couponCode: string | null) => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  settings,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = settings.freeShippingThreshold;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? Math.round(subtotal * appliedDiscount.percent) / 100 : 0;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : settings.shippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    try {
      const percent = await checkCoupon(code);
      if (percent > 0) {
        setAppliedDiscount({ code, percent });
        setCouponCode('');
      } else {
        setCouponError('Este cupón no es válido o ya expiró.');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'No se pudo validar el cupón.');
    } finally {
      setCheckingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-blue-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Tu Bolsa de Compras ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
            </div>
            <button
              id="close-cart-button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping banner */}
          <div className="bg-blue-50/80 px-5 py-3 border-b border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-900" />
                {amountNeededForFreeShipping === 0
                  ? '¡Excelente! Envío sin costo incluido'
                  : `Añade US$${amountNeededForFreeShipping.toFixed(2)} más para envío gratis`}
              </span>
              <span className="font-bold text-amber-600">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full bg-blue-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mb-4 border border-blue-200">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Tu bolsa está vacía</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Descubre las colecciones exclusivas de TemaShop y disfruta de beneficios en catálogo.
                </p>
                <button
                  id="cart-start-shopping-button"
                  onClick={onClose}
                  className="mt-5 bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 border border-amber-500/20"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className="flex gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                          {item.product.title}
                        </h4>
                        <button
                          id={`remove-cart-item-${item.product.id}`}
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                          title="Eliminar de la bolsa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-amber-600 font-medium mt-0.5">{item.product.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-blue-950">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          id={`qty-minus-${item.product.id}`}
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          id={`qty-plus-${item.product.id}`}
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <input
                    id="cart-coupon-input"
                    type="text"
                    placeholder="Código de cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 uppercase font-semibold"
                  />
                </div>
                <button
                  id="apply-coupon-button"
                  type="submit"
                  disabled={checkingCoupon}
                  className="bg-blue-950 hover:bg-blue-900 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-amber-500/30 disabled:opacity-60"
                >
                  {checkingCoupon ? '...' : 'Aplicar'}
                </button>
              </form>

              {/* Coupon message feedback */}
              {couponError && (
                <p className="text-[11px] text-amber-800 font-medium">{couponError}</p>
              )}
              {appliedDiscount && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    Cupón {appliedDiscount.code} (-{appliedDiscount.percent}%)
                  </span>
                  <button
                    onClick={() => setAppliedDiscount(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-[10px] underline font-normal"
                  >
                    Quitar
                  </button>
                </div>
              )}

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">US${subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Cupón {appliedDiscount.code} ({appliedDiscount.percent}%)</span>
                    <span>-US${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Envío estimado</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px] bg-emerald-100 px-1.5 py-0.2 rounded">
                      GRATIS
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-900">US${shippingFee.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total a pagar</span>
                  <span className="text-blue-950">US${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-checkout-button"
                onClick={() => onProceedToCheckout(appliedDiscount?.code || null)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Continuar con el pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Conexión segura · Nunca guardamos datos de tarjetas</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
