import React, { useEffect, useState } from 'react';
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
  Heart,
  Banknote,
  Share2,
  Link2
} from 'lucide-react';
import { Product } from '../types';
import { RETURN_DAYS } from '../config';
import { useLang, useProductText } from '../i18n';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  related?: Product[];
  reviewsSlot?: React.ReactNode;
  onOpenProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onToggleWishlist,
  related = [],
  reviewsSlot,
  onOpenProduct,
}) => {
  const { tr, cat, delivery } = useLang();
  const pt = useProductText();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const productUrl = `${window.location.origin}/?product=${encodeURIComponent(product.id)}`;
  const handleShare = async () => {
    const title = pt.title(product);
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} - TemaShop`, url: productUrl });
        return;
      }
    } catch {
      return; // el cliente canceló
    }
    try {
      await navigator.clipboard.writeText(productUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      /* portapapeles no disponible */
    }
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex p-4">
      <div 
        id="product-detail-modal"
        className="m-auto relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header Buttons (Wishlist & Close) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            id="detail-modal-share-button"
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 text-slate-500 hover:text-blue-900 hover:bg-white border border-slate-200 shadow-xs transition-colors"
            title={tr('Compartir', 'Share')}
            aria-label={tr('Compartir producto', 'Share product')}
          >
            {linkCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
          </button>
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
              title={isWishlisted ? tr('Quitar de favoritos', 'Remove from favorites') : tr('Guardar en favoritos', 'Save to favorites')}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            id="close-detail-modal-button"
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
            aria-label={tr('Cerrar', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Column */}
          <div className="relative bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-200">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-md">
                -{discountPercent}%
              </span>
            )}
            <img
              src={imageError ? fallbackImage : product.imageUrl}
              alt={pt.title(product)}
              onError={() => setImageError(true)}
              className="max-h-80 w-full object-contain rounded-xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Flash Deal */}
              <div className="flex flex-wrap items-center gap-2 mb-2 pr-24">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {cat(product.category)}
                </span>
                {product.isFlashDeal && (
                  <span className="bg-blue-950 text-amber-400 border border-amber-500/40 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                    <Zap className="w-3 h-3 fill-current text-amber-400" />
                    {tr('Oferta de la semana', 'This week\'s deal')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {pt.title(product)}
              </h2>

              <div className="flex items-center gap-2 mt-2 text-sm">
                {product.reviewsCount > 0 && (
                  <>
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                  </>
                )}
                {(product.salesCount || 0) > 0 && (
                  <>
                    <span className="text-xs text-slate-500">{product.salesCount} {tr(product.salesCount === 1 ? 'vendido' : 'vendidos', 'sold')}</span>
                    <span className="text-slate-300">•</span>
                  </>
                )}
                <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {product.stock <= 0 ? tr('Agotado', 'Sold out') : product.stock <= 5 ? tr(`Quedan solo ${product.stock}`, `Only ${product.stock} left`) : tr('En existencia', 'In stock')}
                </span>
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
                {product.originalPrice > product.price && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md ml-auto whitespace-nowrap">
                    {tr('Ahorras', 'You save')} ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                {pt.description(product)}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{tr('Cantidad:', 'Quantity:')}</span>
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
                      <span>{tr('Añadido a tu bolsa', 'Added to cart')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{tr('Añadir a la bolsa', 'Add to cart')}</span>
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
                  <span>{tr('Comprar ahora', 'Buy now')}</span>
                </button>
              </div>

              {/* Garantías de compra */}
              <ul className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-blue-900 flex-shrink-0 mt-px" />
                  <span><strong className="text-slate-900 font-semibold">{tr(`Entrega en ${delivery}`, `Delivery in ${delivery}`)}</strong> {tr('directo a tu domicilio.', 'right to your door.')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Banknote className="w-4 h-4 text-blue-900 flex-shrink-0 mt-px" />
                  <span><strong className="text-slate-900 font-semibold">{tr('Paga al recibir', 'Pay on delivery')}</strong> {tr('en efectivo, o con tarjeta, Zelle o Cash App.', 'in cash, or pay by card, Zelle or Cash App.')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-blue-900 flex-shrink-0 mt-px" />
                  <span><strong className="text-slate-900 font-semibold">{tr(`${RETURN_DAYS} días para devolverlo`, `${RETURN_DAYS}-day returns`)}</strong> {tr('si no es lo que esperabas.', 'if it\'s not what you expected.')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-900 flex-shrink-0 mt-px" />
                  <span><strong className="text-slate-900 font-semibold">{tr('Pago protegido:', 'Secure payment:')}</strong> {tr('nunca guardamos los datos de tu tarjeta.', 'we never store your card details.')}</span>
                </li>
              </ul>

            </div>

          </div>

        </div>

        {linkCopied && (
          <div className="absolute top-16 right-4 z-30 bg-blue-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> {tr('Enlace copiado', 'Link copied')}
          </div>
        )}

        {reviewsSlot}

        {related.length > 0 && onOpenProduct && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">{tr('También te puede gustar', 'You may also like')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpenProduct(r)}
                  className="text-left bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-xl overflow-hidden transition-all"
                >
                  <div className="aspect-square bg-slate-100">
                    <img src={r.imageUrl} alt={pt.title(r)} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 leading-snug min-h-[2.5em]">{pt.title(r)}</p>
                    <p className="text-sm font-extrabold text-blue-950 mt-1">${r.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
