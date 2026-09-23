import React, { createContext, useContext, useEffect, useState } from 'react';

// Idiomas de la tienda. Inglés por defecto (mercado de EE. UU.), español opcional.
export type Lang = 'en' | 'es';

const STORAGE_KEY = 'temashop_lang';

const readStoredLang = (): Lang => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'es') return v;
  } catch {
    /* almacenamiento no disponible */
  }
  return 'en';
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** tr('texto en español', 'English text') devuelve el texto del idioma activo */
  tr: (es: string, en: string) => string;
  /** Nombre de categoría traducido (las categorías se guardan en español en la base de datos) */
  cat: (category: string) => string;
  /** Etiqueta de producto traducida (NUEVO → NEW) */
  badge: (b: string) => string;
  /** Tiempo estimado de entrega en el idioma activo */
  delivery: string;
  /** Fecha en formato del idioma activo */
  date: (ts: number | string | Date, opts?: Intl.DateTimeFormatOptions) => string;
}

const CATEGORY_EN: Record<string, string> = {
  Todas: 'All',
  'Ofertas Flash': 'Deals',
  'Tecnología': 'Electronics',
  'Moda y Calzado': 'Fashion & Shoes',
  'Hogar y Cocina': 'Home & Kitchen',
  'Belleza y Cuidado': 'Beauty & Care',
  'Deportes y Aire Libre': 'Sports & Outdoors',
  Accesorios: 'Accessories',
};

// Idioma activo para código fuera de React (mensajes de error de la API)
let currentLang: Lang = readStoredLang();
export const trNow = (es: string, en: string) => (currentLang === 'en' ? en : es);

// Tiempo de entrega mostrado al cliente (se puede cambiar en Vercel)
const env = (import.meta as any).env || {};
export const deliveryEstimate = (lang: Lang) =>
  lang === 'en'
    ? env.VITE_DELIVERY_ESTIMATE_EN || '2–5 business days'
    : env.VITE_DELIVERY_ESTIMATE || '2 a 5 días hábiles';

const BADGE_EN: Record<string, string> = {
  NUEVO: 'NEW',
  'MÁS VENDIDO': 'BEST SELLER',
  'MAS VENDIDO': 'BEST SELLER',
  OFERTA: 'DEAL',
  AGOTADO: 'SOLD OUT',
  'ÚLTIMAS UNIDADES': 'LAST FEW',
  EXCLUSIVO: 'EXCLUSIVE',
  RECOMENDADO: 'RECOMMENDED',
};

const LangContext = createContext<LangContextValue | null>(null);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    currentLang = lang;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    currentLang = l;
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const value: LangContextValue = {
    lang,
    setLang,
    tr: (es, en) => (lang === 'en' ? en : es),
    cat: (c) => (lang === 'en' ? CATEGORY_EN[c] || c : c),
    delivery: deliveryEstimate(lang),
    badge: (b) => (lang === 'en' ? BADGE_EN[b.trim().toUpperCase()] || b : b),
    date: (ts, opts) =>
      new Date(ts).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-US', opts || { year: 'numeric', month: 'short', day: 'numeric' }),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = (): LangContextValue => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang debe usarse dentro de LangProvider');
  return ctx;
};

/** Título del producto en el idioma activo (usa español si falta la traducción) */
export const useProductText = () => {
  const { lang } = useLang();
  return {
    title: (p: { title: string; titleEn?: string }) => (lang === 'en' && p.titleEn ? p.titleEn : p.title),
    description: (p: { description: string; descriptionEn?: string }) =>
      lang === 'en' && p.descriptionEn ? p.descriptionEn : p.description,
  };
};

/** Botón EN / ES */
export const LanguageToggle: React.FC<{ className?: string; dark?: boolean }> = ({ className = '', dark = false }) => {
  const { lang, setLang } = useLang();
  const base = dark ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-200';
  const on = dark ? 'bg-white text-blue-950' : 'bg-blue-950 text-white';
  const off = dark ? 'text-blue-100 hover:text-white' : 'text-slate-600 hover:text-blue-950';
  return (
    <div className={`inline-flex items-center rounded-lg border p-0.5 text-[11px] font-bold ${base} ${className}`} role="group" aria-label="Language / Idioma">
      {(['en', 'es'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2 py-0.5 rounded-md transition-colors ${lang === l ? on : off}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
