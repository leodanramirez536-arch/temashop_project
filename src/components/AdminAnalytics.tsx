import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Award,
  Layers,
  Calendar
} from 'lucide-react';
import { Product, Order } from '../types';

interface AdminAnalyticsProps {
  products: Product[];
  orders: Order[];
}

const CATEGORY_NAMES = [
  'Tecnología',
  'Hogar y Cocina',
  'Moda y Calzado',
  'Belleza y Cuidado',
  'Deportes y Aire Libre',
  'Accesorios'
];

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ products, orders }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [barMetric, setBarMetric] = useState<'both' | 'revenue' | 'units'>('both');

  // 1. DATA FOR TIMELINE (LINE CHART) - VENTAS TOTALES EN EL TIEMPO
  const salesTimelineData = useMemo(() => {
    // Generate dates according to selected range
    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 10;
    const now = new Date();
    const result = [];

    // Map existing orders by date key (YYYY-MM-DD)
    const orderSalesByDate: Record<string, { total: number; count: number }> = {};
    orders.filter((o) => o.status !== 'cancelado').forEach((ord) => {
      const d = new Date(ord.createdAt);
      const key = d.toISOString().split('T')[0];
      if (!orderSalesByDate[key]) {
        orderSalesByDate[key] = { total: 0, count: 0 };
      }
      orderSalesByDate[key].total += ord.total;
      orderSalesByDate[key].count += 1;
    });

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

      // Solo pedidos reales
      const seedRevenue = 0;
      const seedOrders = 0;

      const realOrders = orderSalesByDate[key];
      const addedRevenue = realOrders ? realOrders.total : 0;
      const addedCount = realOrders ? realOrders.count : 0;

      const totalVentas = Number((seedRevenue + addedRevenue).toFixed(2));
      const pedidos = seedOrders + addedCount;
      const ticketPromedio = pedidos > 0 ? Number((totalVentas / pedidos).toFixed(2)) : 0;

      result.push({
        date: dayLabel,
        isoDate: key,
        totalVentas,
        pedidos,
        ticketPromedio,
      });
    }

    return result;
  }, [orders, timeRange]);

  // 2. DATA FOR CATEGORY PERFORMANCE (BAR CHART) - RENDIMIENTO POR CATEGORÍA
  const categoryPerformanceData = useMemo(() => {
    // Collect order items by category
    const orderCategorySales: Record<string, { revenue: number; units: number }> = {};
    orders.filter((o) => o.status !== 'cancelado').forEach((ord) => {
      ord.items.forEach((item) => {
        // Find product category
        const prod = products.find((p) => p.id === item.id || p.title === item.title);
        const cat = prod ? prod.category : 'Otros';
        if (!orderCategorySales[cat]) {
          orderCategorySales[cat] = { revenue: 0, units: 0 };
        }
        orderCategorySales[cat].revenue += item.price * item.quantity;
        orderCategorySales[cat].units += item.quantity;
      });
    });

    return CATEGORY_NAMES.map((cat) => {
      const catProducts = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
      
      // Calculate accumulated product sales volume
      const baseProductUnits = 0;
      const baseProductRevenue = 0;

      const added = orderCategorySales[cat] || { revenue: 0, units: 0 };

      const totalRevenue = Number((baseProductRevenue + added.revenue).toFixed(2));
      const totalUnits = baseProductUnits + added.units;
      const stockAvailable = catProducts.reduce((sum, p) => sum + p.stock, 0);

      return {
        categoria: cat,
        ingresos: Math.round(totalRevenue),
        unidadesVendidas: totalUnits,
        stockDisponible: stockAvailable,
        cantidadProductos: catProducts.length,
      };
    });
  }, [products, orders]);

  // Calculate summary KPIs
  const totalAccumulatedSales = useMemo(() => {
    return categoryPerformanceData.reduce((sum, c) => sum + c.ingresos, 0);
  }, [categoryPerformanceData]);

  const totalUnitsSold = useMemo(() => {
    return categoryPerformanceData.reduce((sum, c) => sum + c.unidadesVendidas, 0);
  }, [categoryPerformanceData]);

  const topCategory = useMemo(() => {
    if (categoryPerformanceData.length === 0) return null;
    return [...categoryPerformanceData].sort((a, b) => b.ingresos - a.ingresos)[0];
  }, [categoryPerformanceData]);

  const globalAverageOrder = useMemo(() => {
    if (salesTimelineData.length === 0) return 0;
    const totalRev = salesTimelineData.reduce((s, d) => s + d.totalVentas, 0);
    const totalOrders = salesTimelineData.reduce((s, d) => s + d.pedidos, 0);
    return totalOrders > 0 ? (totalRev / totalOrders).toFixed(2) : '0.00';
  }, [salesTimelineData]);

  // Custom Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
          <span className="font-bold text-slate-300 block border-b border-slate-700 pb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {label}
          </span>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}:
              </span>
              <strong className="font-mono text-white">
                {entry.dataKey === 'totalVentas' ? `$${Number(entry.value).toFixed(2)}` : `${entry.value} u.`}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[180px]">
          <span className="font-bold text-amber-400 block border-b border-slate-700 pb-1">
            Categoría: {label}
          </span>
          {payload.map((entry: any, index: number) => (
            <div key={`bar-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span 
                  className="w-2.5 h-2.5 rounded-sm inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}:
              </span>
              <strong className="font-mono text-white">
                {entry.dataKey === 'ingresos' ? `$${Number(entry.value).toLocaleString()}` : `${Number(entry.value).toLocaleString()} u.`}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Facturación Estimada Total
            </span>
            <span className="text-xl font-black text-blue-950 block mt-0.5">
              ${totalAccumulatedSales.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +14.8% este mes
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Unidades Despachadas
            </span>
            <span className="text-xl font-black text-slate-900 block mt-0.5">
              {totalUnitsSold.toLocaleString()} u.
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              En todas las categorías
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Categoría con Mayor Rendimiento
            </span>
            <span className="text-sm font-black text-blue-950 block mt-1 truncate max-w-[140px]">
              {topCategory?.categoria || 'Tecnología'}
            </span>
            <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
              ${topCategory?.ingresos.toLocaleString()} generados
            </span>
          </div>
          <div className="p-2.5 bg-amber-500 text-blue-950 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              Ticket Promedio por Pedido
            </span>
            <span className="text-xl font-black text-blue-950 block mt-0.5">
              ${globalAverageOrder}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              Histórico promedio tienda
            </span>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-2xl border border-slate-200">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 1. GRÁFICO DE LÍNEAS: VENTAS TOTALES EN EL TIEMPO */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-900 text-amber-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Evolución de Ventas Totales e Ingresos
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualización temporal de ventas totales en dólares ($) y volumen de pedidos
            </p>
          </div>

          {/* Time range pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-blue-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-blue-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Días
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-blue-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Periodo Completo
            </button>
          </div>
        </div>

        {/* Line Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesTimelineData}
              margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#1e3a8a" 
                tick={{ fontSize: 11, fill: '#1e3a8a' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#d97706" 
                tick={{ fontSize: 11, fill: '#d97706' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val} ped.`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                iconType="circle"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalVentas"
                name="Ventas Totales ($)"
                stroke="#1e3a8a"
                strokeWidth={3}
                dot={{ stroke: '#1e3a8a', strokeWidth: 2, fill: '#ffffff', r: 4 }}
                activeDot={{ r: 6, fill: '#1e3a8a', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pedidos"
                name="Volumen de Pedidos"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff', r: 3 }}
                activeDot={{ r: 5, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRÁFICO DE BARRAS: RENDIMIENTO DE PRODUCTOS POR CATEGORÍA */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500 text-blue-950 rounded-xl">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Rendimiento Comercial de Productos por Categoría
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativa de volumen de facturación e inventario movilizado por sección
            </p>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setBarMetric('both')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                barMetric === 'both'
                  ? 'bg-blue-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Métrica Combinada
            </button>
            <button
              onClick={() => setBarMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                barMetric === 'revenue'
                  ? 'bg-blue-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solo Ingresos ($)
            </button>
            <button
              onClick={() => setBarMetric('units')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                barMetric === 'units'
                  ? 'bg-blue-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solo Unidades
            </button>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryPerformanceData}
              margin={{ top: 15, right: 15, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="categoria" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} 
              />
              
              {(barMetric === 'both' || barMetric === 'revenue') && (
                <Bar
                  dataKey="ingresos"
                  name="Ingresos Comerciales ($)"
                  fill="#1e3a8a"
                  radius={[6, 6, 0, 0]}
                  barSize={barMetric === 'both' ? 22 : 36}
                />
              )}

              {(barMetric === 'both' || barMetric === 'units') && (
                <Bar
                  dataKey="unidadesVendidas"
                  name="Unidades Vendidas"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  barSize={barMetric === 'both' ? 22 : 36}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Data Table Breakdown */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-900" />
            Desglose tabular de rendimiento por categoría:
          </span>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Catálogo Activo</th>
                  <th className="py-2.5 px-3">Unidades Vendidas</th>
                  <th className="py-2.5 px-3">Stock en Almacén</th>
                  <th className="py-2.5 px-3 text-right">Facturación Estimada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryPerformanceData.map((cat) => (
                  <tr key={cat.categoria} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-900 inline-block" />
                      {cat.categoria}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{cat.cantidadProductos} productos</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{cat.unidadesVendidas.toLocaleString()} u.</td>
                    <td className="py-2.5 px-3 text-slate-500">{cat.stockDisponible} u.</td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-950">
                      ${cat.ingresos.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
