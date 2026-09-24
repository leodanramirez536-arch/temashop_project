import React, { useState } from 'react';
import { Truck, RotateCcw, ShieldCheck, Tag, ArrowRight, Copy, Check, Banknote } from 'lucide-react';
import { RETURN_DAYS, formatMoneyShort, SHOW_COMPARE_PRICES } from '../config';
import { useLang } from '../i18n';

interface FlashDealBannerProps {
  onExploreDeals: () => void;
  onShopNow: () => void;
  freeShippingThreshold: number;
}

const COUPON = 'TEMASHOP10';

export const FlashDealBanner: React.FC<FlashDealBannerProps> = ({ onExploreDeals, onShopNow, freeShippingThreshold }) => {
  const { tr, delivery } = useLang();
  const [copied, setCopied] = useState(false);

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* el portapapeles puede no estar disponible */
    }
  };

  return (
    <section className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="relative overflow-hidden max-w-7xl mx-auto rounded-3xl bg-blue-950 text-white shadow-xl shadow-blue-950/20">
        {/* Fondo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.25),transparent_60%)] pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-7 sm:gap-8 px-5 sm:px-10 pt-7 pb-8 sm:py-12 items-center">
          {/* Mensaje principal */}
          <div className="space-y-5 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
              <span className="w-6 h-px bg-amber-400/70 hidden sm:inline-block" />
              {tr('Tecnología · Hogar · Moda · Belleza', 'Electronics · Home · Fashion · Beauty')}
            </span>

            <h1 className="text-[28px] leading-[1.1] sm:text-5xl lg:text-[56px] font-extrabold tracking-tight">
              {tr('Lo que necesitas,', 'Everything you need,')}
              <br className="hidden sm:block" />{' '}
              <span className="text-amber-400">{tr('entregado en tu puerta.', 'delivered to your door.')}</span>
            </h1>

            <p className="text-blue-100/90 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {tr(`Productos seleccionados a precios justos. Recibe en ${delivery} y paga como prefieras: tarjeta, Zelle, Cash App o `, `Hand-picked products at fair prices. Get it in ${delivery} and pay your way: card, Zelle, Cash App or `)}
              <strong className="text-white font-semibold">{tr('en efectivo cuando lo recibes', 'cash when it arrives')}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                id="hero-shop-now-button"
                onClick={onShopNow}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-sm sm:text-base py-3.5 px-7 rounded-xl shadow-lg shadow-amber-500/25 transition-colors active:scale-[0.98]"
              >
                {tr('Comprar ahora', 'Shop now')}
                <ArrowRight className="w-4 h-4" />
              </button>
              {SHOW_COMPARE_PRICES && (
              <button
                id="banner-explore-deals-button"
                onClick={onExploreDeals}
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-sm sm:text-base py-3.5 px-7 rounded-xl transition-colors"
              >
                {tr('Ver ofertas de la semana', 'See this week\'s deals')}
              </button>
              )}
            </div>

            <ul className="hidden sm:flex sm:flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 pt-3 text-xs sm:text-[13px] text-blue-100 text-left">
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {tr(`Envío gratis desde ${formatMoneyShort(freeShippingThreshold)}`, `Free shipping on ${formatMoneyShort(freeShippingThreshold)}+`)}
              </li>
              <li className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {tr('Pago contra entrega', 'Cash on delivery')}
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {tr(`Devoluciones en ${RETURN_DAYS} días`, `${RETURN_DAYS}-day returns`)}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {tr('No guardamos tu tarjeta', 'We never store your card')}
              </li>
            </ul>
          </div>

          {/* Cupón de bienvenida */}
          <div className="w-full max-w-sm mx-auto lg:ml-auto">
            <div className="relative bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="absolute -top-3 left-6 bg-amber-500 text-blue-950 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> {tr('Bienvenida', 'Welcome')}
              </div>
              <p className="text-sm text-slate-500 mt-2">{tr('Tu cupón de bienvenida', 'Your welcome coupon')}</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight mt-1">
                10% <span className="text-lg font-bold text-slate-500">{tr('de descuento', 'off')}</span>
              </p>

              <button
                onClick={copyCoupon}
                className="mt-4 w-full flex items-center justify-between gap-3 border-2 border-dashed border-amber-400 bg-amber-50 hover:bg-amber-100 rounded-xl px-4 py-3 transition-colors group"
                aria-label={tr('Copiar cupón', 'Copy coupon')}
              >
                <span className="font-mono text-lg font-bold tracking-[0.2em] text-blue-950">{COUPON}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                  {copied ? <><Check className="w-4 h-4" /> {tr('Copiado', 'Copied')}</> : <><Copy className="w-4 h-4" /> {tr('Copiar', 'Copy')}</>}
                </span>
              </button>
              <p className="hidden sm:block text-[11px] text-slate-500 mt-3 leading-relaxed">
                {tr('Pégalo en tu bolsa, en el campo "Código de cupón", antes de pagar.', 'Paste it in your cart under "Coupon code" before checkout.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
