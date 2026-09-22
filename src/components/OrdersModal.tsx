import React, { useState } from 'react';
import { X, Package, Truck, ShoppingBag, Search, AlertCircle } from 'lucide-react';
import { Order, User } from '../types';
import { fetchGuestOrder, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../lib/api';
import { formatMoney } from '../config';
import { PaymentInstructions } from './PaymentInstructions';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onGuestOrderFound: (order: Order) => void;
}

const statusColor: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-blue-100 text-blue-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregado: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-red-100 text-red-700',
};

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentUser,
  onOpenAuth,
  onGuestOrderFound,
}) => {
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  // El administrador ve todos los pedidos en su panel; aquí solo los suyos como cliente
  const userOrders =
    currentUser?.role === 'admin'
      ? orders.filter((o) => o.customerEmail === currentUser.email)
      : orders;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setSearching(true);
    try {
      const found = await fetchGuestOrder(lookupNumber, lookupEmail);
      if (found) {
        onGuestOrderFound(found);
        setLookupNumber('');
      } else {
        setLookupError('No encontramos un pedido con ese número y correo.');
      }
    } catch (err: any) {
      setLookupError(err?.message || 'No se pudo buscar el pedido.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="orders-modal-container"
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-900" />
            <div>
              <h2 className="text-base font-black text-slate-900">Mis pedidos</h2>
              <p className="text-[11px] text-slate-400">
                {currentUser ? `Pedidos de ${currentUser.email}` : 'Consulta tus pedidos con el número y tu correo'}
              </p>
            </div>
          </div>
          <button id="close-orders-modal-button" onClick={onClose} aria-label="Cerrar"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!currentUser && (
            <form onSubmit={handleLookup} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-800">Buscar un pedido</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input required value={lookupNumber} onChange={(e) => setLookupNumber(e.target.value)} placeholder="TS-100001"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-blue-900" />
                <input required type="email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} placeholder="Correo del pedido"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900" />
                <button type="submit" disabled={searching}
                  className="bg-blue-900 hover:bg-blue-800 text-amber-300 font-bold rounded-xl px-3 py-2 flex items-center justify-center gap-1.5 disabled:opacity-60">
                  <Search className="w-3.5 h-3.5" /> {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {lookupError && (
                <p className="text-red-700 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {lookupError}</p>
              )}
              <p className="text-slate-500">
                ¿Tienes cuenta?{' '}
                <button type="button" onClick={onOpenAuth} className="text-blue-900 font-bold underline">Inicia sesión</button>{' '}
                para ver todos tus pedidos.
              </p>
            </form>
          )}

          {userOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Aún no hay pedidos para mostrar</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Cuando hagas una compra, podrás ver aquí el estado de tu pedido.
              </p>
            </div>
          ) : (
            userOrders.map((order) => (
              <div key={order.id} id={`order-card-${order.orderNumber}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Pedido</span>
                    <span className="font-black text-blue-950 text-sm">{order.orderNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${statusColor[order.status] || 'bg-slate-100'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      order.paymentStatus === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fecha:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pago:</span>
                    <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total:</span>
                    <span className="font-black text-blue-950 text-sm">{formatMoney(order.total)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover border border-slate-200" />}
                        <span className="truncate font-medium text-slate-800">{item.title}</span>
                        <span className="text-slate-400 font-bold flex-shrink-0">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-slate-900 flex-shrink-0">{formatMoney(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {order.status !== 'cancelado' && <PaymentInstructions order={order} />}

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> {order.address.street}, {order.address.city}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
