import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Lock, Download } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectCategory }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      {/* Guarantees strip */}
      <div className="border-b border-gray-800 py-8 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Envío Gratis</h4>
              <p className="text-[11px] text-gray-400">En todos los pedidos superiores a $25</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Devoluciones en 90 Días</h4>
              <p className="text-[11px] text-gray-400">Reembolso fácil y sin preguntas</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compra 100% Protegida</h4>
              <p className="text-[11px] text-gray-400">Seguridad cifrada de 256 bits</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Soporte 24/7</h4>
              <p className="text-[11px] text-gray-400">Atención personalizada y chat en vivo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">
              Tema<span className="text-orange-500">Shop</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Plataforma de comercio electrónico moderna estilo Temu y Amazon. Conectamos directamente a los fabricantes con los clientes para ofrecer precios increíbles sin intermediarios.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Transacciones seguras SSL verificadas</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Categorías Populares</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button onClick={() => onSelectCategory('Tecnología')} className="hover:text-orange-400 transition-colors">
                Tecnología & Gadgets
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Hogar y Cocina')} className="hover:text-orange-400 transition-colors">
                Hogar y Cocina
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Moda y Calzado')} className="hover:text-orange-400 transition-colors">
                Moda & Calzado
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Belleza y Cuidado')} className="hover:text-orange-400 transition-colors">
                Belleza & Cuidado Personal
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('Ofertas Flash')} className="hover:text-orange-400 transition-colors font-bold text-yellow-400">
                ⚡ Ofertas Flash Exclusivas
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Atención al Cliente</h4>
          <ul className="space-y-2 text-gray-400">
            <li><span className="hover:text-white cursor-pointer">Centro de Ayuda y Preguntas Frecuentes</span></li>
            <li><span className="hover:text-white cursor-pointer">Seguimiento de Envíos</span></li>
            <li><span className="hover:text-white cursor-pointer">Política de Devoluciones y Reembolsos</span></li>
            <li><span className="hover:text-white cursor-pointer">Garantía del Comprador TemaShop</span></li>
            <li><span className="hover:text-white cursor-pointer">Términos y Condiciones</span></li>
          </ul>
        </div>

        {/* Administration & Internal */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-2">Administración</h4>
          <p className="text-gray-400 text-xs">
            ¿Eres administrador de la plataforma? Accede al panel de control para dar de alta productos, gestionar stock y revisar pedidos.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              id="footer-admin-link-button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-blue-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-gray-700 hover:border-blue-700"
            >
              <span>Panel de Administración</span>
              <span className="bg-amber-500 text-blue-950 text-[9px] px-1.5 py-0.5 rounded uppercase font-black">ADMIN</span>
            </button>

            <a
              id="footer-download-zip-button"
              href="/temashop_project.zip"
              download="temashop_project.zip"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              title="Descargar código completo del proyecto en archivo .ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar ZIP</span>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom copyright */}
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} TemaShop Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span>Almacenamiento Local React + Tailwind</span>
            <span>•</span>
            <span>Versión 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
