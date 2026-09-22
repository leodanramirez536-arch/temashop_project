import React from 'react';
import { Heart, Star, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
}

export const discountOf = (p: Product) =>
  p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onOpenDetail,
}) => {
  const discount = discountOf(product);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col">
      <div className="relative aspect-square bg-slate-100 cursor-pointer" onClick={() => onOpenDetail(product)}>
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {product.isFlashDeal && (
            <span className="bg-blue-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap className="w-3 h-3" /> FLASH
            </span>
          )}
          {product.badge && (
            <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full">{product.badge}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:scale-110 transition-transform"
          title="Lista de deseos"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-amber-700 uppercase">{product.category}</span>
        <h3
          onClick={() => onOpenDetail(product)}
          className="text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-900 mt-0.5"
        >
          {product.title}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-700">{product.rating.toFixed(1)}</span>
          <span>({product.reviewsCount})</span>
          <span className="ml-auto">{product.salesCount.toLocaleString()} vendidos</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-black text-rose-600">${product.price.toFixed(2)}</span>
          {discount > 0 && <span className="text-xs text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>}
        </div>
        <span className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
          {outOfStock ? 'Agotado' : product.stock <= 5 ? `¡Solo quedan ${product.stock}!` : 'En stock'}
        </span>
        <button
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
          className="mt-auto pt-0 w-full mt-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-amber-400 disabled:text-slate-500 text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
};
