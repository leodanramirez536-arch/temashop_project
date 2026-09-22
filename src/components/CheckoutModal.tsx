import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, Truck, Lock, Package, Banknote, AlertCircle, CreditCard, Clock } from 'lucide-react';
import { CartItem, Order, User, StoreSettings, PaymentMethod } from '../types';
import { placeOrder, paypalCreateOrder, paypalCaptureOrder, checkCoupon, PAYMENT_METHOD_LABELS } from '../lib/api';
import { PAYPAL_CLIENT_ID, ZELLE_RECIPIENT, CASHAPP_TAG, DELIVERY_ESTIMATE, formatMoney } from '../config';
import { PaymentInstructions } from './PaymentInstructions';
import type { LegalPage } from './LegalModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: User | null;
  couponCode: string | null;
  settings: StoreSettings;
  onOrderSuccess: (order: Order) => void;
  onOrderUpdated: (order: Order) => void;
  onViewOrders: () => void;
  onOpenLegal: (page: LegalPage) => void;
  onOpenAuth: () => void;
}

const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none';

// Carga el SDK de PayPal una sola vez
let paypalSdkPromise: Promise<any> | null = null;
function loadPayPalSdk(): Promise<any> {
  if ((window as any).paypal) return Promise.resolve((window as any).paypal);
  if (!paypalSdkPromise) {
    paypalSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=USD&intent=capture&components=buttons&enable-funding=card`;
      script.async = true;
      script.onload = () => resolve((window as any).paypal);
      script.onerror = () => {
        paypalSdkPromise = null;
        reject(new Error('No se pudo cargar PayPal. Revisa tu conexión.'));
      };
      document.body.appendChild(script);
    });
  }
  return paypalSdkPromise;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  couponCode,
  settings,
  onOrderSuccess,
  onOrderUpdated,
  onViewOrders,
  onOpenLegal,
  onOpenAuth,
}) => {
  const paypalEnabled = !!PAYPAL_CLIENT_ID;
  const methods: { id: PaymentMethod; title: string; subtitle: string; info: string }[] = [
    ...(paypalEnabled ? [{ id: 'paypal' as PaymentMethod, title: 'Tarjeta', subtitle: 'Débito, crédito o PayPal',
      info: 'Al continuar verás el formulario seguro de PayPal. Puedes pagar con tarjeta de débito o crédito sin crear cuenta PayPal. TemaShop no ve ni guarda los datos de tu tarjeta.' }] : []),
    ...(ZELLE_RECIPIENT ? [{ id: 'zelle' as PaymentMethod, title: 'Zelle', subtitle: 'Desde tu banco',
      info: 'Al confirmar te mostramos a dónde enviar el pago por Zelle. Preparamos tu pedido cuando recibimos el pago.' }] : []),
    ...(CASHAPP_TAG ? [{ id: 'cashapp' as PaymentMethod, title: 'Cash App', subtitle: CASHAPP_TAG,
      info: 'Al confirmar te mostramos el enlace para pagar con Cash App. Preparamos tu pedido cuando recibimos el pago.' }] : []),
    { id: 'cash_on_delivery', title: 'Efectivo', subtitle: 'Al recibir',
      info: 'Pagas en efectivo al recibir tu pedido. Te contactaremos por teléfono o WhatsApp para confirmar la entrega.' },
  ];
  const [step, setStep] = useState<'form' | 'pay' | 'success'>('form');
  const [order, setOrder] = useState<Order | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(methods[0].id);
  const [couponPercent, setCouponPercent] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [payError, setPayError] = useState('');
  const paypalRef = useRef<HTMLDivElement>(null);

  // Reinicia el formulario cada vez que se abre
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setOrder(null);
      setFormError('');
      setPayError('');
      setName((n) => n || currentUser?.name || '');
      setEmail(currentUser?.email || '');
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen || !couponCode) {
      setCouponPercent(0);
      return;
    }
    checkCoupon(couponCode).then(setCouponPercent).catch(() => setCouponPercent(0));
  }, [isOpen, couponCode]);

  // Muestra los botones de PayPal para el pedido creado
  useEffect(() => {
    if (step !== 'pay' || !order || !paypalRef.current) return;
    let cancelled = false;
    const container = paypalRef.current;
    container.innerHTML = '';
    loadPayPalSdk()
      .then((paypal) => {
        if (cancelled || !paypal) return;
        return paypal
          .Buttons({
            style: { layout: 'vertical', shape: 'rect', label: 'pay' },
            createOrder: () => paypalCreateOrder(order.id),
            onApprove: async (data: any) => {
              setPayError('');
              setIsProcessing(true);
              try {
                await paypalCaptureOrder(order.id, data.orderID);
                const paid = { ...order, paymentStatus: 'pagado' as const, status: 'confirmado' as const };
                setOrder(paid);
                onOrderUpdated(paid);
                setStep('success');
              } catch (err: any) {
                setPayError(err?.message || 'No se pudo confirmar el pago.');
              } finally {
                setIsProcessing(false);
              }
            },
            onError: (err: any) => {
              setPayError(err?.message || 'PayPal no pudo procesar el pago. Inténtalo de nuevo.');
            },
          })
          .render(container);
      })
      .catch((err: any) => setPayError(err?.message || 'No se pudo cargar PayPal.'));
    return () => {
      cancelled = true;
    };
  }, [step, order]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * couponPercent) / 100;
  const shipping = subtotal >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (cart.length === 0) {
      setFormError('Tu bolsa está vacía.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      setFormError('Escribe un número de teléfono válido para coordinar la entrega.');
      return;
    }
    if (!acceptTerms) {
      setFormError('Debes aceptar los Términos y la Política de Privacidad para continuar.');
      return;
    }

    setIsProcessing(true);
    try {
      const created = await placeOrder({
        name,
        email,
        phone,
        address: { street, city, state, zipCode, notes },
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        paymentMethod,
        coupon: couponPercent > 0 ? couponCode : null,
      });
      setOrder(created);
      onOrderSuccess(created);
      setStep(paymentMethod === 'paypal' ? 'pay' : 'success');
    } catch (err: any) {
      setFormError(err?.message || 'No se pudo registrar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const headerTitle =
    step === 'form' ? 'Finalizar pedido' : step === 'pay' ? 'Pagar con tarjeta' : '¡Pedido recibido!';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="checkout-modal-container"
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-900" />
            <h2 className="text-lg font-black text-slate-900">{headerTitle}</h2>
          </div>
          <button
            id="close-checkout-modal-button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            {!currentUser && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                <span>Puedes comprar sin cuenta. Si inicias sesión, verás tus pedidos desde cualquier dispositivo.</span>
                <button type="button" onClick={onOpenAuth} className="font-bold underline">
                  Iniciar sesión
                </button>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-900" />
                1. Datos de entrega
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="checkout-name" className="block text-slate-600 font-semibold mb-1">Nombre completo *</label>
                  <input id="checkout-name" type="text" required autoComplete="name" value={name}
                    onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="block text-slate-600 font-semibold mb-1">Correo electrónico *</label>
                  <input id="checkout-email" type="email" required autoComplete="email" value={email}
                    readOnly={!!currentUser} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com"
                    className={`${inputClass} ${currentUser ? 'text-slate-500' : ''}`} />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-slate-600 font-semibold mb-1">Teléfono / WhatsApp *</label>
                  <input id="checkout-phone" type="tel" required autoComplete="tel" value={phone}
                    onChange={(e) => setPhone(e.target.value)} placeholder="809-000-0000" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="checkout-city" className="block text-slate-600 font-semibold mb-1">Ciudad *</label>
                  <input id="checkout-city" type="text" required autoComplete="address-level2" value={city}
                    onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-street" className="block text-slate-600 font-semibold mb-1">Dirección *</label>
                  <input id="checkout-street" type="text" required autoComplete="street-address" value={street}
                    onChange={(e) => setStreet(e.target.value)} placeholder="Calle, número, sector, edificio / apto."
                    className={inputClass} />
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-slate-600 font-semibold mb-1">Provincia</label>
                  <input id="checkout-state" type="text" autoComplete="address-level1" value={state}
                    onChange={(e) => setState(e.target.value)} placeholder="Provincia" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="checkout-zip" className="block text-slate-600 font-semibold mb-1">Código postal</label>
                  <input id="checkout-zip" type="text" autoComplete="postal-code" value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)} placeholder="Opcional" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-notes" className="block text-slate-600 font-semibold mb-1">Indicaciones para la entrega</label>
                  <input id="checkout-notes" type="text" value={notes} maxLength={300}
                    onChange={(e) => setNotes(e.target.value)} placeholder="Opcional: referencias, horario, etc."
                    className={inputClass} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-900" />
                2. Forma de pago
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    id={`paymethod-${m.id}`}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                      paymentMethod === m.id ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {m.id === 'paypal' ? <CreditCard className="w-5 h-5 text-blue-700" /> : m.id === 'cash_on_delivery' ? <Banknote className="w-5 h-5 text-emerald-600" /> : <span className={`font-black text-base ${m.id === 'zelle' ? 'text-purple-700' : 'text-emerald-600'}`}>{m.id === 'zelle' ? 'Z' : '$'}</span>}
                    <span>{m.title}</span>
                    <span className="font-medium text-[10px] text-slate-500 truncate max-w-full">{m.subtitle}</span>
                  </button>
                ))}
              </div>

              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                {methods.find((m) => m.id === paymentMethod)?.info}
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} artículos)</span>
                <span className="font-semibold text-slate-900">{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Cupón {couponCode} ({couponPercent}%)</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Envío</span>
                <span className="font-semibold text-emerald-700">{shipping === 0 ? 'GRATIS' : formatMoney(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-blue-200">
                <span>Total</span>
                <span className="text-blue-950 text-lg">{formatMoney(total)}</span>
              </div>
              <p className="text-[10px] text-slate-500">El total final se confirma con los precios y el stock actuales al registrar el pedido.</p>
            </div>

            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 accent-blue-900" />
              <span>
                Acepto los{' '}
                <button type="button" onClick={() => onOpenLegal('terms')} className="text-blue-900 font-semibold underline">Términos y Condiciones</button>
                , la{' '}
                <button type="button" onClick={() => onOpenLegal('privacy')} className="text-blue-900 font-semibold underline">Política de Privacidad</button>
                {' '}y la{' '}
                <button type="button" onClick={() => onOpenLegal('returns')} className="text-blue-900 font-semibold underline">Política de Envíos y Devoluciones</button>.
              </span>
            </label>

            <button
              id="confirm-order-submit-button"
              type="submit"
              disabled={isProcessing || cart.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-950 border-t-transparent rounded-full animate-spin" />
                  <span>Registrando pedido...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{paymentMethod === 'paypal' ? 'Continuar al pago con tarjeta' : 'Confirmar pedido'} ({formatMoney(total)})</span>
                </>
              )}
            </button>
          </form>
        )}

        {step === 'pay' && order && (
          <div className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Tu pedido <strong>{order.orderNumber}</strong> está reservado. Completa el pago de <strong>{formatMoney(order.total)}</strong> para confirmarlo.
              </span>
            </div>
            {payError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {payError}
              </div>
            )}
            {isProcessing && <p className="text-xs text-slate-500 text-center">Confirmando tu pago...</p>}
            <div ref={paypalRef} className="min-h-[150px]" />
            <p className="text-[11px] text-slate-500 text-center">
              Si cierras esta ventana sin pagar, el pedido quedará pendiente y te contactaremos.
            </p>
          </div>
        )}

        {step === 'success' && order && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">¡Gracias por tu compra!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {order.paymentStatus === 'pagado'
                  ? 'Recibimos tu pago. Te contactaremos para coordinar la entrega.'
                  : order.paymentMethod === 'zelle' || order.paymentMethod === 'cashapp'
                    ? 'Tu pedido está reservado. Completa el pago con los datos de abajo.'
                    : 'Recibimos tu pedido. Te contactaremos por teléfono o WhatsApp para confirmar la entrega.'}
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <PaymentInstructions order={order} />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 max-w-lg mx-auto text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Número de pedido</span>
                  <strong className="text-base font-black text-blue-950">{order.orderNumber}</strong>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  order.paymentStatus === 'pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus === 'pagado' ? 'Pagado' : PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>
                  <span className="block text-slate-400 font-medium">Cliente:</span>
                  <p className="font-semibold text-slate-900">{order.customerName}</p>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Total:</span>
                  <p className="font-black text-blue-950 text-sm">{formatMoney(order.total)}</p>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-400 font-medium">Dirección:</span>
                  <p className="font-semibold text-slate-900">{order.address.street}, {order.address.city}</p>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-400 font-medium">Entrega estimada:</span>
                  <p className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    {DELIVERY_ESTIMATE}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Guarda tu número de pedido. Puedes consultarlo en "Mis pedidos" con tu correo {order.customerEmail}.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <button id="view-placed-orders-button" onClick={() => { onClose(); onViewOrders(); }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                <span>Ver mis pedidos</span>
              </button>
              <button id="continue-shopping-button" onClick={onClose}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-amber-400 font-bold text-xs py-3 px-4 rounded-xl">
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
