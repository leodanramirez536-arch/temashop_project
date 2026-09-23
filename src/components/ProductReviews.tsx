import React, { useEffect, useMemo, useState } from 'react';
import { Star, BadgeCheck, Trash2, MessageSquare } from 'lucide-react';
import { Product, User, Order } from '../types';
import { Review, fetchReviews, addReview, deleteReview } from '../lib/api';
import { useLang } from '../i18n';

interface ProductReviewsProps {
  product: Product;
  currentUser: User | null;
  orders: Order[];
  onOpenAuth: () => void;
  onStatsChange?: (productId: string, rating: number, count: number) => void;
}

// Nombre público corto: "Laura G."
const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || '';
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
};

export const Stars: React.FC<{ value: number; size?: string }> = ({ value, size = 'w-4 h-4' }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
      />
    ))}
  </span>
);

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product, currentUser, orders, onOpenAuth, onStatsChange }) => {
  const { tr, date } = useLang();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchReviews(product.id)
      .then((r) => alive && setReviews(r))
      .catch((e) => alive && setLoadError(e?.message || 'Error'));
    return () => {
      alive = false;
    };
  }, [product.id]);

  const stats = useMemo(() => {
    const list = reviews || [];
    const count = list.length;
    const avg = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
    const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((r) => r.rating === n).length }));
    return { count, avg, dist };
  }, [reviews]);

  const received = !!currentUser && orders.some((o) => o.status === 'entregado' && o.items.some((i) => i.id === product.id));
  const alreadyReviewed = !!currentUser && (reviews || []).some((r) => r.userId === currentUser.id);
  const canReview = received && !alreadyReviewed;

  const updateAfter = (next: Review[]) => {
    setReviews(next);
    const count = next.length;
    const avg = count ? Math.round((next.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
    onStatsChange?.(product.id, avg, count);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!currentUser) return;
    if (rating < 1) {
      setFormError(tr('Elige de 1 a 5 estrellas.', 'Please choose 1 to 5 stars.'));
      return;
    }
    setSending(true);
    try {
      const created = await addReview({
        productId: product.id,
        authorName: shortName(currentUser.name || currentUser.email.split('@')[0]),
        rating,
        comment,
      });
      updateAfter([created, ...(reviews || [])]);
      setRating(0);
      setComment('');
    } catch (err: any) {
      setFormError(err?.message || tr('No se pudo publicar la reseña.', 'Could not post your review.'));
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteReview(id);
      updateAfter((reviews || []).filter((r) => r.id !== id));
    } catch (err: any) {
      setFormError(err?.message || 'Error');
    }
  };

  return (
    <div className="border-t border-slate-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-blue-900" />
        <h3 className="text-sm font-bold text-slate-900">{tr('Opiniones de clientes', 'Customer reviews')}</h3>
      </div>

      {loadError ? (
        <p className="text-xs text-slate-500">{tr('No se pudieron cargar las opiniones.', 'Could not load reviews.')}</p>
      ) : reviews === null ? (
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Resumen */}
          <div className="space-y-3">
            {stats.count > 0 ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-blue-950 leading-none">{stats.avg.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 pb-1">/ 5</span>
                </div>
                <Stars value={stats.avg} />
                <p className="text-xs text-slate-500">
                  {tr(`${stats.count} ${stats.count === 1 ? 'opinión verificada' : 'opiniones verificadas'}`,
                      `${stats.count} verified ${stats.count === 1 ? 'review' : 'reviews'}`)}
                </p>
                <div className="space-y-1">
                  {stats.dist.map(({ n, c }) => (
                    <div key={n} className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="w-3">{n}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${stats.count ? (c / stats.count) * 100 : 0}%` }} />
                      </div>
                      <span className="w-4 text-right">{c}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                {tr('Este producto aún no tiene opiniones.', 'No reviews yet for this product.')}
              </p>
            )}
            <p className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-snug">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-px" />
              {tr('Solo publican opiniones clientes que recibieron este producto.', 'Only customers who received this product can post a review.')}
            </p>
          </div>

          {/* Formulario y lista */}
          <div className="space-y-4">
            {canReview ? (
              <form onSubmit={submit} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-slate-800">{tr('¿Qué te pareció?', 'How did you like it?')}</p>
                <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHover(i)}
                      aria-label={`${i}`}
                      className="p-0.5"
                    >
                      <Star className={`w-6 h-6 ${i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={tr('Cuéntale a otros clientes tu experiencia (opcional)', 'Tell other shoppers about your experience (optional)')}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                {formError && <p className="text-xs font-semibold text-red-700">{formError}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60"
                >
                  {sending ? tr('Publicando...', 'Posting...') : tr('Publicar opinión', 'Post review')}
                </button>
              </form>
            ) : !currentUser ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <span>{tr('¿Compraste este producto? Inicia sesión para opinar.', 'Bought this product? Sign in to leave a review.')}</span>
                <button type="button" onClick={onOpenAuth} className="font-bold text-blue-900 underline">
                  {tr('Iniciar sesión', 'Sign in')}
                </button>
              </div>
            ) : !alreadyReviewed ? (
              <p className="text-xs text-slate-500">
                {tr('Podrás opinar cuando recibas este producto.', "You'll be able to review this product once it's delivered.")}
              </p>
            ) : null}

            {reviews.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <li key={r.id} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Stars value={r.rating} size="w-3.5 h-3.5" />
                        <span className="text-xs font-bold text-slate-800">{r.authorName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{date(r.createdAt)}</span>
                    </div>
                    <p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-1">
                      <BadgeCheck className="w-3 h-3" /> {tr('Compra verificada', 'Verified purchase')}
                    </p>
                    {r.comment && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">{r.comment}</p>}
                    {currentUser && (currentUser.id === r.userId || currentUser.role === 'admin') && (
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" /> {tr('Eliminar', 'Delete')}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
