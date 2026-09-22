import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Mail, MessageCircle } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, RETURN_DAYS, DELIVERY_ESTIMATE } from '../config';
import type { LegalPage } from './LegalModal';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenLegal: (page: LegalPage) => void;
  onOpenOrders: () => void;
  freeShippingThreshold: number;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenLegal, onOpenOrders, freeShippingThreshold }) => {
  const linkClass = 'hover:text-white transition-colors text-left';
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      <div className="border-b border-gray-800 py-8 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Envío gratis</h4>
              <p className="text-[11px] text-gray-400">En pedidos desde US${freeShippingThreshold.toFixed(2)} · {DELIVERY_ESTIMATE}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Devoluciones</h4>
              <p className="text-[11px] text-gray-400">{RETURN_DAYS} días desde que recibes tu pedido</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pago seguro</h4>
              <p className="text-[11px] text-gray-400">Tarjeta, Zelle, Cash App o efectivo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">
              Tema<span className="text-amber-400">Shop</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Tienda en línea de tecnología, hogar, moda, belleza y accesorios con entrega a domicilio.
          </p>
          {(CONTACT_EMAIL || CONTACT_WHATSAPP) && (
            <div className="space-y-1.5 text-xs pt-1">
              {CONTACT_WHATSAPP && (
                <a href={`https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
              {CONTACT_EMAIL && (
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-white">
                  <Mail className="w-3.5 h-3.5" /> {CONTACT_EMAIL}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Categorías</h4>
          <ul className="space-y-2 text-gray-400">
            {['Tecnología', 'Hogar y Cocina', 'Moda y Calzado', 'Belleza y Cuidado', 'Deportes y Aire Libre', 'Accesorios'].map((c) => (
              <li key={c}>
                <button onClick={() => onSelectCategory(c)} className={linkClass}>{c}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Ayuda</h4>
          <ul className="space-y-2 text-gray-400">
            <li><button onClick={onOpenOrders} className={linkClass}>Consultar mi pedido</button></li>
            <li><button onClick={() => onOpenLegal('returns')} className={linkClass}>Envíos y devoluciones</button></li>
            <li><button onClick={() => onOpenLegal('terms')} className={linkClass}>Términos y condiciones</button></li>
            <li><button onClick={() => onOpenLegal('privacy')} className={linkClass}>Política de privacidad</button></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} TemaShop. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
