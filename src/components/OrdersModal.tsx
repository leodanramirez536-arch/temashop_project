import React, { useState } from 'react';
import { X, Package, Truck, ShoppingBag, Search, AlertCircle } from 'lucide-react';
import { Order, User, Product } from '../types';
import { fetchGuestOrder, orderStatusLabel, paymentStatusLabel, paymentMethodLabel } from '../lib/api';
import { useLang } from '../i18n';
import { formatMoney } from '../config';
import { PaymentInstructions } from './PaymentInstructions';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onGuestOrderFound: (order: Order) => void;
  products?: Product[];
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
  products = [],
}) => {
  const { tr, lang, date } = useLang();
  const itemTitle = (id: string, fallback: string) => {
    const p = products.find((x) => x.id === id);
    return lang === 'en' && p?.titleEn ? p.titleEn : fallback;
  };
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
        setLookupError(tr('No encontramos un pedido con ese número y correo.', "We couldn't find an order with that number and email."));
      }
    } catch (err: any) {
      setLookupError(err?.message || tr('No se pudo buscar el pedido.', 'Could not look up the order.'));
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
              <h2 className="text-base font-black text-slate-900">{tr('Mis pedidos', 'My orders')}</h2>
              <p className="text-[11px] text-slate-400">
                {currentUser ? tr(`Pedidos de ${currentUser.email}`, `Orders for ${currentUser.email}`) : tr('Consulta tus pedidos con el número y tu correo', 'Look up an order with its number and your email')}
              </p>
            </div>
          </div>
          <button id="close-orders-modal-button" onClick={onClose} aria-label={tr('Cerrar', 'Close')}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!currentUser && (
            <form onSubmit={handleLookup} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-800">{tr('Buscar un pedido', 'Find an order')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input required value={lookupNumber} onChange={(e) => setLookupNumber(e.target.value)} placeholder="TS-100001"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-blue-900" />
                <input required type="email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} placeholder={tr('Correo del pedido', 'Order email')}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900" />
                <button type="submit" disabled={searching}
                  className="bg-blue-900 hover:bg-blue-800 text-amber-300 font-bold rounded-xl px-3 py-2 flex items-center justify-center gap-1.5 disabled:opacity-60">
                  <Search className="w-3.5 h-3.5" /> {searching ? tr('Buscando...', 'Searching...') : tr('Buscar', 'Search')}
                </button>
              </div>
              {lookupError && (
                <p className="text-red-700 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {lookupError}</p>
              )}
              <p className="text-slate-500">
                {tr('¿Tienes cuenta?', 'Have an account?')}{' '}
                <button type="button" onClick={onOpenAuth} className="text-blue-900 font-bold underline">{tr('Inicia sesión', 'Sign in')}</button>{' '}
                {tr('para ver todos tus pedidos.', 'to see all your orders.')}
              </p>
            </form>
          )}

          {userOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{tr('Aún no hay pedidos para mostrar', 'No orders to show yet')}</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {tr('Cuando hagas una compra, podrás ver aquí el estado de tu pedido.', 'When you place an order, you\'ll see its status here.')}
              </p>
            </div>
          ) : (
            userOrders.map((order) => (
              <div key={order.id} id={`order-card-${order.orderNumber}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{tr('Pedido', 'Order')}</span>
                    <span className="font-black text-blue-950 text-sm">{order.orderNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${statusColor[order.status] || 'bg-slate-100'}`}>
                      {orderStatusLabel(order.status, lang)}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      order.paymentStatus === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {paymentStatusLabel(order.paymentStatus, lang)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tr('Fecha:', 'Date:')}</span>
                    <span>{date(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{tr('Pago:', 'Payment:')}</span>
                    <span>{paymentMethodLabel(order.paymentMethod, lang)}</span>
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
                        <span className="truncate font-medium text-slate-800">{itemTitle(item.id, item.title)}</span>
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
