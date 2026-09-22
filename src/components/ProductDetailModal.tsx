import React from 'react';
import { X, Star, ShoppingCart, Heart, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';
import { discountOf } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
}) => {
  if (!product) return null;
  const discount = discountOf(product);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3" onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 rounded-full shadow">
          <X className="w-5 h-5" />
        </button>
        <img src={product.imageUrl} alt={product.title} className="w-full h-72 md:h-full object-cover bg-slate-100" />
        <div className="p-5 space-y-3">
          <span className="text-[10px] font-bold text-amber-700 uppercase">{product.category}</span>
          <h2 className="text-xl font-black text-slate-900">{product.title}</h2>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <strong className="text-slate-800">{product.rating.toFixed(1)}</strong>
            <span>· {product.reviewsCount} reseñas · {product.salesCount.toLocaleString()} vendidos</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">${product.price.toFixed(2)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">-{discount}%</span>
              </>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          <div className="text-xs text-slate-600 space-y-1.5">
            <p className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-900" /> Envío gratis en pedidos desde $35</p>
            <p className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Compra protegida y devoluciones en 30 días</p>
          </div>
          <p className={`text-xs font-bold ${product.stock <= 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {product.stock <= 0 ? 'Agotado' : `${product.stock} unidades disponibles`}
          </p>
          <div className="flex gap-2 pt-2">
            <button
              disabled={product.stock <= 0}
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-amber-400 font-black py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Agregar al carrito
            </button>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50"
              title="Lista de deseos"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
