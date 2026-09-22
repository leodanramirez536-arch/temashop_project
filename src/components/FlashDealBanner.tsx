import React, { useState, useEffect } from 'react';
import { Zap, Clock, Truck, RotateCcw, ShieldCheck, Crown } from 'lucide-react';

interface FlashDealBannerProps {
  onExploreDeals: () => void;
}

export const FlashDealBanner: React.FC<FlashDealBannerProps> = ({ onExploreDeals }) => {
  // 5 hours 42 minutes 19 seconds countdown
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset loop
          return { hours: 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

  return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white rounded-3xl shadow-xl my-4 sm:my-6 mx-3 sm:mx-6 lg:mx-8 border border-blue-800/80">
      {/* Background subtle luminous accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Headlines & Badges */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500 text-blue-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            <Crown className="w-3.5 h-3.5 fill-current text-blue-950" />
            VENTA ESPECIAL DEPARTAMENTAL
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Colecciones Selectas con <span className="text-amber-400 drop-shadow-sm">Hasta 70% de Beneficio</span>
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
            Precios exclusivos directos de fabricantes de alta gama en tecnología, hogar, moda y accesorios. Aprovecha los cupos reservados antes del cierre de temporada.
          </p>

          {/* Value props badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-semibold text-blue-200">
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Envío Cortesía &gt; $25</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Garantía de Devolución 90 Días</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Certificado de Autenticidad</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Countdown & CTA */}
        <div className="flex flex-col items-center bg-blue-950/90 backdrop-blur-md border border-amber-500/30 p-5 rounded-2xl text-center w-full sm:w-auto min-w-[280px] shadow-2xl">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" /> La ronda preferencial finaliza en:
          </div>

          {/* Time digits */}
          <div className="flex items-center gap-2 font-mono my-1">
            <div className="bg-slate-950 text-white border border-blue-900 px-3 py-2 rounded-xl text-2xl font-black shadow-inner">
              {formatNumber(timeLeft.hours)}
              <span className="block text-[9px] font-sans font-normal text-slate-400 text-center uppercase">Horas</span>
            </div>
            <span className="text-2xl font-black text-amber-400">:</span>
            <div className="bg-slate-950 text-white border border-blue-900 px-3 py-2 rounded-xl text-2xl font-black shadow-inner">
              {formatNumber(timeLeft.minutes)}
              <span className="block text-[9px] font-sans font-normal text-slate-400 text-center uppercase">Min</span>
            </div>
            <span className="text-2xl font-black text-amber-400">:</span>
            <div className="bg-slate-950 text-white border border-blue-900 px-3 py-2 rounded-xl text-2xl font-black shadow-inner">
              {formatNumber(timeLeft.seconds)}
              <span className="block text-[9px] font-sans font-normal text-slate-400 text-center uppercase">Seg</span>
            </div>
          </div>

          <button
            id="banner-explore-deals-button"
            onClick={onExploreDeals}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-sm py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-current text-blue-950" />
            Explorar Colección Ahora
          </button>
          <span className="text-[10px] text-amber-300/80 mt-2 font-medium">
            ✨ Piezas reservadas por tiempo limitado
          </span>
        </div>

      </div>
    </div>
  );
};
