import React from 'react';
import { X, Package } from 'lucide-react';
import { Order } from '../types';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between">
          <h2 className="font-black flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Mis pedidos ({orders.length})
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Todavía no tienes pedidos.</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="border border-slate-200 rounded-2xl p-4 text-xs space-y-2 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-blue-950 text-sm">{o.orderNumber}</strong>
                    <span className="text-slate-400 ml-2">{new Date(o.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">{o.status}</span>
                </div>
                {o.items.map((i) => (
                  <div key={i.productId} className="flex items-center gap-2">
                    <img src={i.imageUrl} alt={i.title} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="flex-1 line-clamp-1">{i.quantity}× {i.title}</span>
                    <span className="font-bold">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">{o.paymentMethod} · {o.address.city}</span>
                  <strong className="text-blue-950 text-sm">${o.total.toFixed(2)}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
