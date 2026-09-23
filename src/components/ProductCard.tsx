import React, { useState } from 'react';
import { Star, ShoppingBag, Check, Zap, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { useLang, useProductText } from '../i18n';

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
  const { tr, cat, badge } = useLang();
  const pt = useProductText();
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
      className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-950/10 hover:border-slate-300 transition-all duration-300 ease-out flex flex-col cursor-pointer"
    >
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-red-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-xs">
            -{discountPercent}%
          </span>
        )}
        {product.isFlashDeal && (
          <span className="bg-amber-400 text-blue-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5 uppercase tracking-wide">
            <Zap className="w-3 h-3 fill-current" />
            {tr('Oferta', 'Deal')}
          </span>
        )}
        {product.badge && !(product.isFlashDeal && /^oferta/i.test(product.badge.trim())) && (
          <span className="bg-blue-950/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
            {badge(product.badge)}
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
          aria-label={isWishlisted ? tr('Quitar de favoritos', 'Remove from favorites') : tr('Guardar en favoritos', 'Save to favorites')}
          className={`p-2 rounded-full shadow-sm backdrop-blur-xs transition-all duration-300 border active:scale-90 ${
            isWishlisted
              ? 'bg-white text-rose-500 border-rose-200 shadow-rose-500/20 scale-105 opacity-100'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border-slate-100 hover:border-rose-200 hover:scale-110 opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={isWishlisted ? tr('Guardado en favoritos', 'Saved to favorites') : tr('Guardar en favoritos', 'Save to favorites')}
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
          title={tr('Vista rápida', 'Quick view')}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image container */}
      <div className="relative w-full pt-[90%] bg-slate-50 overflow-hidden">
        <img
          src={imageError ? fallbackImage : product.imageUrl}
          alt={pt.title(product)}
          onError={() => setImageError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
            {cat(product.category)}
          </span>

          {/* Product Title */}
          <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900 line-clamp-2 mt-1 leading-snug min-h-[2.5em] group-hover:text-blue-900 transition-colors duration-200">
            {pt.title(product)}
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
                <span className="text-[11px] text-slate-500">{product.salesCount} {tr(product.salesCount === 1 ? 'vendido' : 'vendidos', 'sold')}</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Stock Section */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-blue-950">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.originalPrice > product.price && (
            <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
              {tr('Ahorras', 'You save')} ${(product.originalPrice - product.price).toFixed(2)}
            </p>
          )}

          {/* Low Stock Warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              {tr(`Quedan solo ${product.stock}`, `Only ${product.stock} left`)}
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
                : 'bg-blue-950 hover:bg-blue-900 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span className="text-white">{tr('Añadido', 'Added')}</span>
              </>
            ) : product.stock <= 0 ? (
              <span>{tr('Agotado', 'Sold out')}</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:-translate-y-0.5" />
                <span><span className="sm:hidden">{tr('Añadir', 'Add')}</span><span className="hidden sm:inline">{tr('Añadir a la bolsa', 'Add to cart')}</span></span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
