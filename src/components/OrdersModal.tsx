import React from 'react';
import { X, Package, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Order, User } from '../types';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: User | null;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentUser,
}) => {
  if (!isOpen) return null;

  // Filter orders for current user or all if guest / admin
  const userOrders = currentUser?.role === 'admin'
    ? orders
    : orders.filter((o) => !currentUser || o.userId === currentUser.id || o.userId === 'guest');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="orders-modal-container"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-900" />
            <div>
              <h2 className="text-base font-black text-slate-900">
                Mis Pedidos y Envíos
              </h2>
              <p className="text-[11px] text-slate-400">
                Historial de compras almacenado en TemaShop
              </p>
            </div>
          </div>
          <button
            id="close-orders-modal-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {userOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No tienes pedidos registrados aún</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Cuando completes una compra en TemaShop, podrás hacer seguimiento a tus paquetes desde este panel.
              </p>
            </div>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.id}
                id={`order-card-${order.orderNumber}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Código de Seguimiento</span>
                    <span className="font-black text-blue-950 text-sm">{order.orderNumber}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fecha de Compra:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Entrega Estimada:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      {order.estimatedDeliveryDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Pagado:</span>
                    <span className="font-black text-blue-950 text-sm">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="bg-slate-50 rounded-xl p-2.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Productos comprados ({order.items.reduce((s, i) => s + i.quantity, 0)}):
                  </span>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-8 h-8 rounded-md object-cover border border-slate-200"
                          />
                          <span className="truncate max-w-[240px] font-medium text-slate-800">{item.title}</span>
                          <span className="text-slate-400 font-bold">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 flex justify-between">
                  <span>Destino: {order.address.street}, {order.address.city}</span>
                  <span className="font-medium">Método: {order.paymentMethod === 'credit_card' ? 'Tarjeta' : order.paymentMethod === 'paypal' ? 'PayPal' : 'Contra Entrega'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
