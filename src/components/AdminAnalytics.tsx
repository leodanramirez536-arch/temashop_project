import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Product, Order } from '../types';

interface AdminAnalyticsProps {
  products: Product[];
  orders: Order[];
}

const COLORS = ['#1e3a8a', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#0ea5e9'];

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ products, orders }) => {
  const byCategory = Object.values(
    products.reduce((acc, p) => {
      acc[p.category] = acc[p.category] || { name: p.category, stock: 0, valor: 0, productos: 0 };
      acc[p.category].stock += p.stock;
      acc[p.category].valor += Number((p.price * p.stock).toFixed(2));
      acc[p.category].productos += 1;
      return acc;
    }, {} as Record<string, { name: string; stock: number; valor: number; productos: number }>)
  );

  const topSellers = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 6)
    .map((p) => ({ name: p.title.length > 18 ? p.title.slice(0, 18) + '…' : p.title, ventas: p.salesCount }));

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const avgTicket = orders.length ? revenue / orders.length : 0;
  const lowStock = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Stat label="Ingresos por órdenes" value={`$${revenue.toFixed(2)}`} />
        <Stat label="Ticket promedio" value={`$${avgTicket.toFixed(2)}`} />
        <Stat label="Categorías activas" value={String(byCategory.length)} />
        <Stat label="Productos con stock bajo" value={String(lowStock)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-black text-slate-800 mb-3 uppercase">Más vendidos</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="ventas" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-black text-slate-800 mb-3 uppercase">Valor de inventario por categoría</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="valor" nameKey="name" outerRadius={90} label={{ fontSize: 10 }}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
    <span className="text-slate-400 block text-[10px] font-bold uppercase">{label}</span>
    <span className="text-lg font-black text-blue-950">{value}</span>
  </div>
);
