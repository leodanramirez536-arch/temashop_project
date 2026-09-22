import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Lock, 
  Package, 
  Banknote,
  Sparkles
} from 'lucide-react';
import { CartItem, Order, User } from '../types';
import { saveOrderToStorage } from '../utils/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: User | null;
  discountRate: number;
  onOrderSuccess: (order: Order) => void;
  onViewOrders: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  discountRate,
  onOrderSuccess,
  onViewOrders,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('+34 612 345 678');
  const [street, setStreet] = useState('Paseo de la Castellana 110, 4º D');
  const [city, setCity] = useState('Madrid');
  const [state, setState] = useState('Madrid');
  const [zipCode, setZipCode] = useState('28046');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'cash_on_delivery'>('credit_card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8920');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 25;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = (subtotal * discountRate) / 100;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 4.99;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !street.trim() || !city.trim() || !zipCode.trim()) {
      setFormError('Por favor completa todos los campos de entrega requeridos.');
      return;
    }

    setIsProcessing(true);

    // Simulate payment gateway processing
    setTimeout(() => {
      // Calculate estimated delivery: 3 to 5 days ahead
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);
      const deliveryString = deliveryDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `TS-${randomDigits}`,
        userId: currentUser?.id || 'guest',
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        address: {
          street,
          city,
          state,
          zipCode,
        },
        items: cart.map((item) => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
        })),
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod,
        status: 'completada',
        createdAt: Date.now(),
        estimatedDeliveryDate: deliveryString,
      };

      saveOrderToStorage(newOrder);
      setCompletedOrder(newOrder);
      setIsProcessing(false);
      setStep('success');
      onOrderSuccess(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        id="checkout-modal-container"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-black text-slate-900">
              {step === 'form' ? 'Finalizar Pedido Departamental' : '¡Pedido Confirmado con Éxito!'}
            </h2>
          </div>
          <button
            id="close-checkout-modal-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Section 1: Customer & Shipping Details */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-900" />
                1. Datos de Entrega Prioritaria
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nombre Completo *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@ejemplo.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Dirección de Entrega *</label>
                  <input
                    id="checkout-street"
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Calle, número, departamento o piso"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Ciudad *</label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Madrid"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Provincia/Estado</label>
                    <input
                      id="checkout-state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Madrid"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">C.P. *</label>
                    <input
                      id="checkout-zip"
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="28013"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Teléfono de Contacto</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Payment Method */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-900" />
                2. Método de Pago Seguro
              </h3>

              <div className="grid grid-cols-3 gap-2.5 mb-3">
                <button
                  type="button"
                  id="paymethod-card"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  id="paymethod-paypal"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="text-blue-700 font-black italic text-base">P</span>
                  <span>PayPal</span>
                </button>

                <button
                  type="button"
                  id="paymethod-cash"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>Contra Entrega</span>
                </button>
              </div>

              {/* Card form simulator */}
              {paymentMethod === 'credit_card' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Número de Tarjeta</label>
                    <input
                      id="card-number-input"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Vencimiento</label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">CVV / CVC</label>
                      <input
                        id="card-cvv-input"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>Serás conectado de forma segura con PayPal Express Checkout para autorizar la orden.</span>
                </div>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pagarás en efectivo directamente al repartidor cuando recibas tu paquete en la puerta.</span>
                </div>
              )}
            </div>

            {/* Order Summary & Submit */}
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} piezas)</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Descuento preferencial ({discountRate}%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Costo de Envío</span>
                <span className="font-semibold text-emerald-700">
                  {shipping === 0 ? 'CORTESÍA' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-blue-200">
                <span>Total a Pagar</span>
                <span className="text-blue-950 text-lg">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="confirm-order-submit-button"
              type="submit"
              disabled={isProcessing}
              className="w-full bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-950 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando pago seguro...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirmar Pedido y Pagar (${total.toFixed(2)})</span>
                </>
              )}
            </button>

          </form>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-3 py-1 rounded-full uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> ¡Orden Registrada!
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                ¡Gracias por tu compra en TemaShop!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hemos recibido tu pedido y nuestro centro de distribución ya está preparando tus piezas con embalaje protegido.
              </p>
            </div>

            {/* Order Card details */}
            {completedOrder && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 max-w-lg mx-auto text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Número de Orden</span>
                    <strong className="text-base font-black text-blue-950">{completedOrder.orderNumber}</strong>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    Confirmado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="block text-slate-400 font-medium">Cliente:</span>
                    <p className="font-semibold text-slate-900">{completedOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Total abonado:</span>
                    <p className="font-black text-blue-950 text-sm">${completedOrder.total.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-400 font-medium">Dirección de entrega:</span>
                    <p className="font-semibold text-slate-900">
                      {completedOrder.address.street}, {completedOrder.address.city}, CP {completedOrder.address.zipCode}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-400 font-medium">Fecha estimada de entrega:</span>
                    <p className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      {completedOrder.estimatedDeliveryDate}
                    </p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">Artículos incluidos:</span>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {completedOrder.items.map((item, i) => (
                      <div key={i} className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        <img src={item.imageUrl} alt={item.title} className="w-7 h-7 object-cover rounded" />
                        <span className="font-bold text-slate-800 text-[11px]">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <button
                id="view-placed-orders-button"
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Ver Mis Pedidos</span>
              </button>

              <button
                id="continue-shopping-button"
                onClick={onClose}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/20 border border-amber-500/20"
              >
                <span>Seguir Explorando</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
