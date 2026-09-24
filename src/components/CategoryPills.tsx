import React from 'react';
import { 
  Zap, 
  Layers, 
  Laptop, 
  Shirt, 
  UtensilsCrossed, 
  Sparkles, 
  Activity, 
  Glasses,
  ArrowUpDown
} from 'lucide-react';
import { CATEGORIES_LIST } from '../data/initialProducts';
import { useLang } from '../i18n';
import { SHOW_COMPARE_PRICES } from '../config';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalProductsCount: number;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalProductsCount,
}) => {
  const { tr, cat } = useLang();
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Todas':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Ofertas Flash':
        return <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />;
      case 'Tecnología':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'Moda y Calzado':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'Hogar y Cocina':
        return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'Belleza y Cuidado':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Deportes y Aire Libre':
        return <Activity className="w-3.5 h-3.5" />;
      case 'Accesorios':
        return <Glasses className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-200">
        
        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES_LIST.filter((c) => SHOW_COMPARE_PRICES || c !== 'Ofertas Flash').map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                id={`category-pill-${category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCategory(category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isSelected
                    ? 'bg-blue-950 text-white border border-blue-950'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-950 border border-slate-200'
                }`}
              >
                {getCategoryIcon(category)}
                <span>{cat(category)}</span>
              </button>
            );
          })}
        </div>

        {/* Sort and Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span className="font-medium whitespace-nowrap">
            <strong className="text-blue-950">{totalProductsCount}</strong> {totalProductsCount === 1 ? tr('producto', 'product') : tr('productos', 'products')}
          </span>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-900" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">{tr('Más recientes', 'Newest')}</option>
              <option value="price_low">{tr('Precio: menor a mayor', 'Price: low to high')}</option>
              <option value="price_high">{tr('Precio: mayor a menor', 'Price: high to low')}</option>
              {SHOW_COMPARE_PRICES && <option value="discount">{tr('Mayor descuento', 'Biggest discount')}</option>}
              <option value="sales">{tr('Más vendidos', 'Best sellers')}</option>
              <option value="rating">{tr('Mejor calificados', 'Top rated')}</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
