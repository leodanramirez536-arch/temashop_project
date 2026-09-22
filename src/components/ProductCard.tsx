import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Zap, Eye, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenQuickView,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(product);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onOpenQuickView(product)}
      className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl hover:shadow-blue-950/10 hover:border-blue-900/30 transition-all duration-300 ease-out flex flex-col cursor-pointer transform hover:-translate-y-1.5 hover:scale-[1.02] will-change-transform"
    >
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105 group-hover:translate-x-0.5">
        {discountPercent > 0 && (
          <span className="bg-amber-500 text-blue-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 transition-all duration-200">
            -{discountPercent}%
          </span>
        )}
        {product.isFlashDeal && (
          <span className="bg-blue-950 text-amber-400 border border-amber-500/40 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 uppercase tracking-wide transition-all duration-200">
            <Zap className="w-3 h-3 fill-current text-amber-400" />
            VIP
          </span>
        )}
        {product.badge && !product.isFlashDeal && (
          <span className="bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {product.badge}
          </span>
        )}
      </div>

      {/* Top Right Action Buttons: Wishlist & Quick View */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 items-end">
        {/* Heart Wishlist Toggle Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Quitar de lista de deseos" : "Añadir a lista de deseos"}
          className={`p-2 rounded-full shadow-sm backdrop-blur-xs transition-all duration-300 border active:scale-90 ${
            isWishlisted
              ? 'bg-white text-rose-500 border-rose-200 shadow-rose-500/20 scale-105 opacity-100'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border-slate-100 hover:border-rose-200 hover:scale-110 opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={isWishlisted ? "Guardado en Favoritos" : "Guardar en Favoritos"}
        >
          <Heart 
            className={`w-4 h-4 transition-transform duration-300 ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'hover:scale-110'
            }`} 
          />
        </button>

        {/* Quick view hover action icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuickView(product);
          }}
          className="p-2 bg-white/95 hover:bg-white text-slate-700 hover:text-blue-900 rounded-full shadow-sm backdrop-blur-xs transition-all duration-200 hover:scale-110 active:scale-95 border border-slate-100 hover:border-blue-200 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
          title="Vista Rápida"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image container */}
      <div className="relative w-full pt-[90%] bg-slate-50 overflow-hidden">
        <img
          src={imageError ? fallbackImage : product.imageUrl}
          alt={product.title}
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-[1.03]"
          loading="lazy"
        />
        {/* Subtle hover gradient sheen */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-bold text-amber-600 tracking-wide uppercase transition-colors duration-200 group-hover:text-amber-700">
            {product.category}
          </span>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 mt-1 leading-snug group-hover:text-blue-900 transition-colors duration-200">
            {product.title}
          </h3>

          {/* Calificaciones y ventas reales (solo si existen) */}
          {(product.reviewsCount > 0 || (product.salesCount || 0) > 0) && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              {product.reviewsCount > 0 && (
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 font-bold text-slate-900 text-xs">{product.rating.toFixed(1)}</span>
                </div>
              )}
              {(product.salesCount || 0) > 0 && (
                <span className="text-[11px] text-slate-500">{product.salesCount} vendidos</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Stock Section */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-blue-950 group-hover:text-blue-900 transition-colors duration-200">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Low Stock Warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
              ¡Solo quedan {product.stock}!
            </p>
          )}

          {/* Add to Cart CTA */}
          <button
            id={`add-to-cart-button-${product.id}`}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`group/btn w-full mt-3 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 ${
              isAdded
                ? 'bg-emerald-700 text-white shadow-emerald-500/20'
                : product.stock <= 0
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800 text-amber-400 shadow-blue-950/20 hover:shadow-md hover:scale-[1.02] border border-amber-500/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span className="text-white">¡Añadido a la Bolsa!</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Agotado</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:-translate-y-0.5" />
                <span>Añadir a la Bolsa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
