import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  MessageCircle,
  Mail,
  Lock,
} from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, RETURN_DAYS, formatMoneyShort } from '../config';
import { useLang } from '../i18n';
import { subscribeEmail } from '../lib/api';

const whatsappLink = (text?: string) =>
  `https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/* ------------------------------------------------------------------ */
/* Franja de garantías (debajo del catálogo)                           */
/* ------------------------------------------------------------------ */
export const GuaranteeStrip: React.FC<{ freeShippingThreshold: number; onOpenReturns: () => void }> = ({
  freeShippingThreshold,
  onOpenReturns,
}) => {
  const { tr, delivery } = useLang();
  const items = [
    {
      icon: <Truck className="w-5 h-5" />,
      title: tr('Envío a domicilio', 'Home delivery'),
      text: tr(`Llega en ${delivery}. Gratis desde ${formatMoneyShort(freeShippingThreshold)}.`, `Arrives in ${delivery}. Free on orders ${formatMoneyShort(freeShippingThreshold)}+.`),
    },
    {
      icon: <Banknote className="w-5 h-5" />,
      title: tr('Paga al recibir', 'Pay on delivery'),
      text: tr('Elige efectivo contra entrega y paga solo cuando tengas tu pedido en la mano.', 'Choose cash on delivery and pay only once your order is in your hands.'),
    },
    {
      icon: <RotateCcw className="w-5 h-5" />,
      title: tr(`Devoluciones en ${RETURN_DAYS} días`, `${RETURN_DAYS}-day returns`),
      text: tr('¿No era lo que esperabas? Solicita tu devolución sin complicaciones.', 'Not what you expected? Request a return, hassle-free.'),
      action: { label: tr('Ver política', 'See policy'), onClick: onOpenReturns },
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: tr('Pago protegido', 'Secure payment'),
      text: tr('Las tarjetas se procesan con PayPal. Nunca vemos ni guardamos tus datos.', 'Cards are processed by PayPal. We never see or store your card details.'),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((it) => (
          <div key={it.title} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center flex-shrink-0">
              {it.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{it.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {it.text}{' '}
                {it.action && (
                  <button onClick={it.action.onClick} className="text-blue-900 font-semibold underline underline-offset-2">
                    {it.action.label}
                  </button>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Cómo comprar en 3 pasos                                             */
/* ------------------------------------------------------------------ */
export const HowToBuy: React.FC<{ onShopNow: () => void }> = ({ onShopNow }) => {
  const { tr } = useLang();
  const steps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: tr('Elige tus productos', 'Pick your products'),
      text: tr('Explora por categoría o busca lo que necesitas y añádelo a tu bolsa.', 'Browse by category or search for what you need and add it to your cart.'),
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: tr('Confirma tu pedido', 'Place your order'),
      text: tr('Escribe tu dirección y elige cómo pagar. No necesitas crear una cuenta.', 'Enter your address and choose how to pay. No account needed.'),
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: tr('Recíbelo en casa', 'Get it at home'),
      text: tr('Preparamos tu pedido y puedes consultar su estado en cualquier momento.', 'We prepare your order and you can check its status anytime.'),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">{tr('Así de fácil', 'It\'s that easy')}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mt-2">{tr('Compra en 3 pasos', 'Shop in 3 steps')}</h2>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative bg-white border border-slate-200 rounded-2xl p-6">
            <span className="absolute top-5 right-5 text-5xl font-extrabold text-slate-100 leading-none select-none">
              {i + 1}
            </span>
            <div className="relative w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              {s.icon}
            </div>
            <h3 className="relative text-base font-bold text-slate-900 mt-4">{s.title}</h3>
            <p className="relative text-sm text-slate-500 mt-1.5 leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="text-center mt-8">
        <button
          onClick={onShopNow}
          className="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm py-3 px-7 rounded-xl transition-colors"
        >
          {tr('Empezar a comprar', 'Start shopping')}
        </button>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Métodos de pago                                                     */
/* ------------------------------------------------------------------ */
export const PaymentMethods: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { tr } = useLang();
  const methods = [
    { name: tr('Tarjeta', 'Card'), detail: tr('Débito o crédito', 'Debit or credit'), icon: <CreditCard className="w-5 h-5" />, color: 'text-blue-700 bg-blue-50' },
    { name: 'Zelle', detail: tr('Transferencia directa', 'Bank transfer'), icon: <Smartphone className="w-5 h-5" />, color: 'text-violet-700 bg-violet-50' },
    { name: 'Cash App', detail: tr('Pago desde tu app', 'Pay from the app'), icon: <Smartphone className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
    { name: tr('Efectivo', 'Cash'), detail: tr('Pagas al recibir', 'Pay on delivery'), icon: <Banknote className="w-5 h-5" />, color: 'text-amber-700 bg-amber-50' },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {methods.map((m) => (
          <span key={m.name} className="bg-white/10 border border-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
            {m.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">{tr('Formas de pago', 'Payment options')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mt-2">{tr('Paga como te quede mejor', 'Pay the way you prefer')}</h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            {tr('Los pagos con tarjeta se procesan de forma segura a través de PayPal: no necesitas cuenta de PayPal y nosotros nunca vemos los datos de tu tarjeta. Si prefieres, paga en efectivo cuando recibas tu pedido.', 'Card payments are processed securely by PayPal. You don\'t need a PayPal account, and we never see your card details. Prefer cash? Pay when your order arrives.')}
          </p>
          <p className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mt-4">
            <ShieldCheck className="w-4 h-4" /> {tr('Conexión cifrada en todo el proceso de compra', 'Encrypted connection throughout checkout')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {methods.map((m) => (
            <div key={m.name} className="border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>{m.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{m.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Preguntas frecuentes                                                */
/* ------------------------------------------------------------------ */
export const FAQ: React.FC<{ freeShippingThreshold: number; onOpenOrders: () => void }> = ({
  freeShippingThreshold,
  onOpenOrders,
}) => {
  const { tr, delivery } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  const items: { q: string; a: React.ReactNode }[] = [
    {
      q: tr('¿Cuánto tarda en llegar mi pedido?', 'How long does delivery take?'),
      a: tr(`La entrega estimada es de ${delivery} desde que confirmamos tu pedido. El envío es gratis en compras desde ${formatMoneyShort(freeShippingThreshold)}.`, `Estimated delivery is ${delivery} after we confirm your order. Shipping is free on orders ${formatMoneyShort(freeShippingThreshold)}+.`),
    },
    {
      q: tr('¿Es seguro pagar con tarjeta?', 'Is it safe to pay by card?'),
      a: tr('Sí. Los pagos con tarjeta los procesa PayPal, una de las plataformas de pago más usadas del mundo. Tu tarjeta nunca pasa por nuestra tienda y no guardamos sus datos. No necesitas tener cuenta de PayPal.', 'Yes. Card payments are processed by PayPal, one of the most widely used payment platforms in the world. Your card never passes through our store and we don\'t store its details. You don\'t need a PayPal account.'),
    },
    {
      q: tr('¿Puedo pagar cuando reciba el producto?', 'Can I pay when my order arrives?'),
      a: tr('Sí. Al finalizar tu compra elige "Efectivo contra entrega" y pagas en el momento en que recibes tu pedido.', 'Yes. At checkout choose "Cash" and pay when you receive your order.'),
    },
    {
      q: tr('¿Y si el producto no me convence?', 'What if I\'m not happy with it?'),
      a: tr(`Tienes ${RETURN_DAYS} días desde que recibes tu pedido para solicitar una devolución. Revisa la política de envíos y devoluciones al final de la página.`, `You have ${RETURN_DAYS} days from delivery to request a return. See our Shipping & Returns policy at the bottom of the page.`),
    },
    {
      q: tr('¿Cómo sé en qué estado va mi pedido?', 'How do I track my order?'),
      a: (
        <>
          {tr('Con tu número de pedido y tu correo puedes consultarlo en cualquier momento, sin necesidad de cuenta.', 'Use your order number and email to check it anytime, no account needed.')}{' '}
          <button onClick={onOpenOrders} className="text-blue-900 font-semibold underline underline-offset-2">
            {tr('Consultar mi pedido', 'Track my order')}
          </button>
        </>
      ),
    },
    {
      q: tr('¿Necesito crear una cuenta para comprar?', 'Do I need an account to buy?'),
      a: tr('No. Puedes comprar como invitado. Si creas una cuenta, verás todos tus pedidos en un solo lugar.', 'No. You can check out as a guest. With an account, you see all your orders in one place.'),
    },
  ];

  return (
    <section id="faq" className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">{tr('Resolvemos tus dudas', 'We\'re here to help')}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mt-2">{tr('Preguntas frecuentes', 'Frequently asked questions')}</h2>
      </div>
      <div className="space-y-2.5">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className={`bg-white border rounded-2xl transition-colors ${isOpen ? 'border-blue-900/30' : 'border-slate-200'}`}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-[15px] font-semibold text-slate-900">{it.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-900' : ''}`} />
              </button>
              {isOpen && <div className="px-5 pb-5 -mt-1 text-sm text-slate-600 leading-relaxed">{it.a}</div>}
            </div>
          );
        })}
      </div>

      {(CONTACT_WHATSAPP || CONTACT_EMAIL) && (
        <div className="mt-8 bg-blue-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold">{tr('¿Tienes otra pregunta?', 'Have another question?')}</p>
            <p className="text-sm text-blue-200 mt-0.5">{tr('Te respondemos personalmente antes de que compres.', 'A real person will answer before you buy.')}</p>
          </div>
          <div className="flex gap-2">
            {CONTACT_WHATSAPP && (
              <a
                href={whatsappLink(tr('Hola, tengo una pregunta sobre un producto de TemaShop.', 'Hi, I have a question about a TemaShop product.'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm py-2.5 px-5 rounded-xl"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {CONTACT_EMAIL && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-2.5 px-5 rounded-xl"
              >
                <Mail className="w-4 h-4" /> {tr('Correo', 'Email')}
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Botón flotante de WhatsApp                                          */
/* ------------------------------------------------------------------ */
export const WhatsAppButton: React.FC = () => {
  const { tr } = useLang();
  if (!CONTACT_WHATSAPP) return null;
  return (
    <a
      href={whatsappLink(tr('Hola, quiero hacer un pedido en TemaShop.', 'Hi, I would like to place an order at TemaShop.'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tr('Escríbenos por WhatsApp', 'Message us on WhatsApp')}
      className="fixed z-40 right-4 bottom-20 sm:bottom-6 sm:right-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-xl shadow-emerald-900/20 p-3.5 sm:pl-4 sm:pr-5 transition-colors"
    >
      <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline text-sm font-semibold">{tr('¿Te ayudamos?', 'Need help?')}</span>
    </a>
  );
};

/* ------------------------------------------------------------------ */
/* Suscripción a ofertas por correo                                    */
/* ------------------------------------------------------------------ */
export const Newsletter: React.FC = () => {
  const { tr, lang } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      setError(tr('Escribe un correo válido.', 'Please enter a valid email.'));
      return;
    }
    setStatus('sending');
    try {
      await subscribeEmail(email, lang);
      setStatus('done');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || tr('No se pudo guardar. Inténtalo de nuevo.', 'Something went wrong. Please try again.'));
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
            {tr('Entérate primero de las ofertas', 'Be the first to hear about deals')}
          </h2>
          <p className="text-sm text-blue-950/80 mt-2 leading-relaxed">
            {tr('Te avisamos de productos nuevos y ofertas de la semana. Sin spam: puedes darte de baja cuando quieras.',
                'Get new arrivals and weekly deals in your inbox. No spam, unsubscribe anytime.')}
          </p>
        </div>
        {status === 'done' ? (
          <div className="bg-white/90 rounded-2xl p-5 flex items-center gap-3 text-blue-950">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{tr('¡Listo! Ya estás en la lista.', "You're in! Thanks for subscribing.")}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="newsletter-email" className="sr-only">{tr('Correo electrónico', 'Email')}</label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                placeholder={tr('tucorreo@ejemplo.com', 'you@example.com')}
                className="flex-1 px-4 py-3.5 rounded-xl bg-white text-sm text-slate-900 border border-white focus:outline-none focus:ring-2 focus:ring-blue-950"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm px-6 py-3.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {status === 'sending' ? tr('Enviando...', 'Sending...') : tr('Suscribirme', 'Subscribe')}
              </button>
            </div>
            {status === 'error' && <p className="text-xs font-semibold text-red-800">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
};
