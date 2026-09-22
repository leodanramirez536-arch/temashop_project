import React, { useState } from 'react';
import { X, CheckCircle2, Truck, CreditCard } from 'lucide-react';
import { CartItem, Order, User } from '../types';
import { SHIPPING_COST, SHIPPING_FREE_FROM } from './CartDrawer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: User | null;
  onPlaceOrder: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, items, currentUser, onPlaceOrder }) => {
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pago contra entrega');
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_FREE_FROM || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const handleClose = () => {
    setPlaced(null);
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !street.trim() || !city.trim() || !phone.trim()) {
      setError('Completa todos los campos de envío.');
      return;
    }
    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `TS-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'Procesando',
      customerName: fullName.trim(),
      customerEmail: email.trim().toLowerCase(),
      address: { fullName: fullName.trim(), street: street.trim(), city: city.trim(), phone: phone.trim() },
      items: items.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
        imageUrl: i.product.imageUrl,
      })),
      paymentMethod,
      subtotal,
      shipping,
      total,
    };
    onPlaceOrder(order);
    setPlaced(order);
  };

  const input =
    'w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto">
        <div className="p-5 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between rounded-t-3xl">
          <h2 className="font-black text-lg">Finalizar compra</h2>
          <button onClick={handleClose} className="p-1.5 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {placed ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black text-slate-900">¡Pedido confirmado!</h3>
            <p className="text-sm text-slate-600">
              Tu número de orden es <strong className="text-blue-950">{placed.orderNumber}</strong>. Total pagado:{' '}
              <strong>${placed.total.toFixed(2)}</strong>
            </p>
            <button onClick={handleClose} className="bg-blue-900 text-amber-400 font-black px-6 py-3 rounded-xl">
              Seguir comprando
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Datos de envío
              </h3>
              <input className={input} placeholder="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={input} placeholder="Dirección" value={street} onChange={(e) => setStreet(e.target.value)} />
              <input className={input} placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
              <input className={input} placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />

              <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 pt-2">
                <CreditCard className="w-4 h-4" /> Método de pago
              </h3>
              {['Pago contra entrega', 'Transferencia bancaria'].map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                  {m}
                </label>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 h-fit">
              <h3 className="text-xs font-black uppercase text-slate-500">Resumen</h3>
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between text-xs gap-2">
                  <span className="text-slate-700 line-clamp-1">
                    {i.quantity}× {i.product.title}
                  </span>
                  <span className="font-bold">${(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>{shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-black text-blue-950 text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={items.length === 0}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-blue-950 font-black py-3 rounded-xl"
              >
                Confirmar pedido
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
