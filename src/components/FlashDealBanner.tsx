import React from 'react';
import { Zap, Truck, RotateCcw, ShieldCheck, Tag } from 'lucide-react';
import { RETURN_DAYS } from '../config';

interface FlashDealBannerProps {
  onExploreDeals: () => void;
}

export const FlashDealBanner: React.FC<FlashDealBannerProps> = ({ onExploreDeals }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white rounded-3xl shadow-xl my-4 sm:my-6 mx-3 sm:mx-6 lg:mx-8 border border-blue-800/80">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500 text-blue-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current text-blue-950" />
            Ofertas de la semana
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Tecnología, hogar y moda <span className="text-amber-400 drop-shadow-sm">a buen precio</span>
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
            Compra fácil y recibe en tu casa. Paga con PayPal, con tarjeta a través de PayPal o en efectivo al recibir.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs font-semibold text-blue-200">
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-lg">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Envío gratis desde US$25</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-lg">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Devoluciones en {RETURN_DAYS} días</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Pago seguro</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center bg-blue-950/90 border border-amber-500/30 p-5 rounded-2xl text-center w-full sm:w-auto min-w-[260px] shadow-2xl">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Tag className="w-4 h-4" /> Cupón de bienvenida
          </div>
          <div className="bg-slate-950 border border-dashed border-amber-400 px-5 py-2 rounded-xl text-2xl font-black tracking-widest">
            TEMASHOP10
          </div>
          <span className="text-[11px] text-blue-200 mt-2">10% de descuento en tu pedido</span>

          <button
            id="banner-explore-deals-button"
            onClick={onExploreDeals}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-sm py-2.5 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-current text-blue-950" />
            Ver ofertas
          </button>
        </div>
      </div>
    </div>
  );
};
