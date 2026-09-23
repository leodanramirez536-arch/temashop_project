import React from 'react';
import { ShoppingBag, Mail, MessageCircle } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP } from '../config';
import type { LegalPage } from './LegalModal';
import { PaymentMethods } from './StoreInfo';
import { useLang, LanguageToggle } from '../i18n';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenLegal: (page: LegalPage) => void;
  onOpenOrders: () => void;
  freeShippingThreshold: number;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenLegal, onOpenOrders }) => {
  const { tr, cat } = useLang();
  const linkClass = 'hover:text-white transition-colors text-left';
  return (
    <footer className="bg-slate-950 text-gray-300 mt-8 border-t border-slate-800">
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
            {tr('Tecnología, hogar, moda, belleza y accesorios con entrega a domicilio. Compra fácil, paga como prefieras y recibe en casa.', 'Electronics, home, fashion, beauty and accessories delivered to your door. Shop easy, pay your way and get it at home.')}
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
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">{tr('Categorías', 'Categories')}</h4>
          <ul className="space-y-2 text-gray-400">
            {['Tecnología', 'Hogar y Cocina', 'Moda y Calzado', 'Belleza y Cuidado', 'Deportes y Aire Libre', 'Accesorios'].map((c) => (
              <li key={c}>
                <button onClick={() => onSelectCategory(c)} className={linkClass}>{cat(c)}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">{tr('Ayuda', 'Help')}</h4>
          <ul className="space-y-2 text-gray-400">
            <li><button onClick={onOpenOrders} className={linkClass}>{tr('Consultar mi pedido', 'Track my order')}</button></li>
            <li><button onClick={() => onOpenLegal('returns')} className={linkClass}>{tr('Envíos y devoluciones', 'Shipping & returns')}</button></li>
            <li><button onClick={() => onOpenLegal('terms')} className={linkClass}>{tr('Términos y condiciones', 'Terms & conditions')}</button></li>
            <li><button onClick={() => onOpenLegal('privacy')} className={linkClass}>{tr('Política de privacidad', 'Privacy policy')}</button></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-3"><p>© {new Date().getFullYear()} TemaShop. {tr('Todos los derechos reservados.', 'All rights reserved.')}</p><LanguageToggle dark /></div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">{tr('Aceptamos', 'We accept')}</span>
            <PaymentMethods compact />
          </div>
        </div>
      </div>
    </footer>
  );
};
