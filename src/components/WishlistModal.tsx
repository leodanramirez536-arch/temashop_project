import React from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Eye, 
  Sparkles, 
  ArrowRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAddAllToCart: (products: Product[]) => void;
  onClearWishlist: () => void;
  onOpenQuickView: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onToggleWishlist,
  onAddToCart,
  onAddAllToCart,
  onClearWishlist,
  onOpenQuickView,
}) => {
  if (!isOpen) return null;

  // Filter products matching wishlistIds in real-time
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const inStockWishlistProducts = wishlistProducts.filter((p) => p.stock > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="wishlist-modal-container"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white p-4 sm:p-6 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-rose-400 shadow-inner">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Mi Lista de Deseos
                </h2>
                <span className="bg-amber-500 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  FAVORITOS
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {wishlistProducts.length === 1 
                  ? '1 artículo guardado en tu cuenta local' 
                  : `${wishlistProducts.length} artículos guardados en tu cuenta local`}
              </p>
            </div>
          </div>

          <button
            id="close-wishlist-modal-button"
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Cerrar lista de deseos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {wishlistProducts.length === 0 ? (
            /* Empty State */
            <div className="py-12 sm:py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                <Heart className="w-10 h-10 text-rose-400 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Tu lista de favoritos está vacía
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Haz clic en el ícono de corazón de cualquier producto para guardarlo aquí y comprarlo cuando lo desees.
                </p>
              </div>
              <button
                id="wishlist-empty-explore-button"
                onClick={onClose}
                className="bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-950/20 inline-flex items-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Explorar Catálogo TemaShop</span>
              </button>
            </div>
          ) : (
            <>
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Persistido en tu dispositivo con <strong className="text-slate-800">localStorage</strong>
                </span>

                <div className="flex items-center gap-2">
                  {inStockWishlistProducts.length > 0 && (
                    <button
                      id="wishlist-add-all-button"
                      onClick={() => onAddAllToCart(inStockWishlistProducts)}
                      className="bg-blue-900 hover:bg-blue-800 text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Mover todo a la Bolsa ({inStockWishlistProducts.length})</span>
                    </button>
                  )}

                  <button
                    id="wishlist-clear-all-button"
                    onClick={onClearWishlist}
                    className="text-slate-400 hover:text-red-600 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 hover:bg-red-50"
                    title="Vaciar lista de deseos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {wishlistProducts.map((product) => {
                  const discountPercent = Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );

                  return (
                    <div
                      key={product.id}
                      id={`wishlist-item-${product.id}`}
                      className="group flex flex-col sm:flex-row items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all duration-200"
                    >
                      {/* Image Thumbnail */}
                      <div 
                        onClick={() => {
                          onClose();
                          onOpenQuickView(product);
                        }}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover object-center"
                        />
                        {discountPercent > 0 && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-blue-950 font-black text-[9px] px-1.5 py-0.2 rounded shadow-xs">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          {product.category}
                        </span>
                        <h4 
                          onClick={() => {
                            onClose();
                            onOpenQuickView(product);
                          }}
                          className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-blue-900 cursor-pointer transition-colors"
                          title={product.title}
                        >
                          {product.title}
                        </h4>

                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                          <span className="text-sm sm:text-base font-black text-blue-950">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-slate-300">|</span>
                          {product.stock > 0 ? (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Disponible ({product.stock})
                            </span>
                          ) : (
                            <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Agotado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <button
                          id={`wishlist-quick-view-${product.id}`}
                          onClick={() => {
                            onClose();
                            onOpenQuickView(product);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-900 hover:bg-white rounded-xl border border-slate-200 transition-colors"
                          title="Vista Detallada"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          id={`wishlist-remove-${product.id}`}
                          onClick={() => onToggleWishlist(product)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                          title="Eliminar de la lista de deseos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          id={`wishlist-add-to-cart-${product.id}`}
                          onClick={() => onAddToCart(product)}
                          disabled={product.stock <= 0}
                          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                            product.stock <= 0
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-900 hover:bg-blue-800 text-amber-400 shadow-xs'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Total estimado: <strong className="text-blue-950 font-black text-sm">${wishlistProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
