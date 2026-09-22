import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Check, 
  Plus, 
  Minus,
  Heart
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="product-detail-modal"
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header Buttons (Wishlist & Close) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onToggleWishlist && (
            <button
              id="detail-modal-wishlist-button"
              type="button"
              onClick={() => onToggleWishlist(product)}
              className={`p-2 rounded-full transition-all duration-200 border shadow-xs ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 border-rose-200 shadow-rose-500/20'
                  : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white border-slate-200'
              }`}
              title={isWishlisted ? "Quitar de Favoritos" : "Guardar en Favoritos"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            id="close-detail-modal-button"
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
            aria-label="Cerrar modal de producto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Column */}
          <div className="relative bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-200">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-amber-500 text-blue-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                -{discountPercent}% BENEFICIO
              </span>
            )}
            <img
              src={imageError ? fallbackImage : product.imageUrl}
              alt={product.title}
              onError={() => setImageError(true)}
              className="max-h-80 w-full object-contain rounded-xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Flash Deal */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {product.category}
                </span>
                {product.isFlashDeal && (
                  <span className="bg-blue-950 text-amber-400 border border-amber-500/40 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                    <Zap className="w-3 h-3 fill-current text-amber-400" />
                    Venta Preferencial
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h2>

              {/* Rating & Social proof */}
              <div className="flex items-center gap-2 mt-2 text-sm">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  {product.salesCount ? `${product.salesCount.toLocaleString()} pedidos` : `${product.reviewsCount} opiniones`}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-emerald-700">Stock: {product.stock} unidades</span>
              </div>

              {/* Price display */}
              <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-blue-950">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md ml-auto">
                  Ahorras ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    id="decrease-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    id="increase-qty-btn"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="modal-add-to-cart-button"
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-950/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>¡Añadido a la Bolsa!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Añadir a la Bolsa</span>
                    </>
                  )}
                </button>

                <button
                  id="modal-buy-now-button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-blue-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current text-blue-950" />
                  <span>Comprar Ahora</span>
                </button>
              </div>

              {/* Micro Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Envío Prioritario</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>90 Días Retorno</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Transacción Segura</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
