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
import { CONTACT_EMAIL, CONTACT_WHATSAPP, DELIVERY_ESTIMATE, RETURN_DAYS, formatMoneyShort } from '../config';

const whatsappLink = (text?: string) =>
  `https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/* ------------------------------------------------------------------ */
/* Franja de garantías (debajo del catálogo)                           */
/* ------------------------------------------------------------------ */
export const GuaranteeStrip: React.FC<{ freeShippingThreshold: number; onOpenReturns: () => void }> = ({
  freeShippingThreshold,
  onOpenReturns,
}) => {
  const items = [
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'Envío a domicilio',
      text: `Llega en ${DELIVERY_ESTIMATE}. Gratis desde ${formatMoneyShort(freeShippingThreshold)}.`,
    },
    {
      icon: <Banknote className="w-5 h-5" />,
      title: 'Paga al recibir',
      text: 'Elige efectivo contra entrega y paga solo cuando tengas tu pedido en la mano.',
    },
    {
      icon: <RotateCcw className="w-5 h-5" />,
      title: `Devoluciones en ${RETURN_DAYS} días`,
      text: '¿No era lo que esperabas? Solicita tu devolución sin complicaciones.',
      action: { label: 'Ver política', onClick: onOpenReturns },
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Pago protegido',
      text: 'Las tarjetas se procesan con PayPal. Nunca vemos ni guardamos tus datos.',
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
  const steps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Elige tus productos',
      text: 'Explora por categoría o busca lo que necesitas y añádelo a tu bolsa.',
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: 'Confirma tu pedido',
      text: 'Escribe tu dirección y elige cómo pagar. No necesitas crear una cuenta.',
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'Recíbelo en casa',
      text: 'Preparamos tu pedido y puedes consultar su estado en cualquier momento.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Así de fácil</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mt-2">Compra en 3 pasos</h2>
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
          Empezar a comprar
        </button>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Métodos de pago                                                     */
/* ------------------------------------------------------------------ */
export const PaymentMethods: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const methods = [
    { name: 'Tarjeta', detail: 'Débito o crédito', icon: <CreditCard className="w-5 h-5" />, color: 'text-blue-700 bg-blue-50' },
    { name: 'Zelle', detail: 'Transferencia directa', icon: <Smartphone className="w-5 h-5" />, color: 'text-violet-700 bg-violet-50' },
    { name: 'Cash App', detail: 'Pago desde tu app', icon: <Smartphone className="w-5 h-5" />, color: 'text-emerald-700 bg-emerald-50' },
    { name: 'Efectivo', detail: 'Pagas al recibir', icon: <Banknote className="w-5 h-5" />, color: 'text-amber-700 bg-amber-50' },
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Formas de pago</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mt-2">Paga como te quede mejor</h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Los pagos con tarjeta se procesan de forma segura a través de PayPal: no necesitas cuenta de PayPal y
            nosotros nunca vemos los datos de tu tarjeta. Si prefieres, paga en efectivo cuando recibas tu pedido.
          </p>
          <p className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mt-4">
            <ShieldCheck className="w-4 h-4" /> Conexión cifrada en todo el proceso de compra
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
  const [open, setOpen] = useState<number | null>(0);

  const items: { q: string; a: React.ReactNode }[] = [
    {
      q: '¿Cuánto tarda en llegar mi pedido?',
      a: `La entrega estimada es de ${DELIVERY_ESTIMATE} desde que confirmamos tu pedido. El envío es gratis en compras desde ${formatMoneyShort(freeShippingThreshold)}.`,
    },
    {
      q: '¿Es seguro pagar con tarjeta?',
      a: 'Sí. Los pagos con tarjeta los procesa PayPal, una de las plataformas de pago más usadas del mundo. Tu tarjeta nunca pasa por nuestra tienda y no guardamos sus datos. No necesitas tener cuenta de PayPal.',
    },
    {
      q: '¿Puedo pagar cuando reciba el producto?',
      a: 'Sí. Al finalizar tu compra elige "Efectivo contra entrega" y pagas en el momento en que recibes tu pedido.',
    },
    {
      q: '¿Y si el producto no me convence?',
      a: `Tienes ${RETURN_DAYS} días desde que recibes tu pedido para solicitar una devolución. Revisa la política de envíos y devoluciones al final de la página.`,
    },
    {
      q: '¿Cómo sé en qué estado va mi pedido?',
      a: (
        <>
          Con tu número de pedido y tu correo puedes consultarlo en cualquier momento, sin necesidad de cuenta.{' '}
          <button onClick={onOpenOrders} className="text-blue-900 font-semibold underline underline-offset-2">
            Consultar mi pedido
          </button>
        </>
      ),
    },
    {
      q: '¿Necesito crear una cuenta para comprar?',
      a: 'No. Puedes comprar como invitado. Si creas una cuenta, verás todos tus pedidos en un solo lugar.',
    },
  ];

  return (
    <section id="faq" className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Resolvemos tus dudas</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mt-2">Preguntas frecuentes</h2>
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
            <p className="font-bold">¿Tienes otra pregunta?</p>
            <p className="text-sm text-blue-200 mt-0.5">Te respondemos personalmente antes de que compres.</p>
          </div>
          <div className="flex gap-2">
            {CONTACT_WHATSAPP && (
              <a
                href={whatsappLink('Hola, tengo una pregunta sobre un producto de TemaShop.')}
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
                <Mail className="w-4 h-4" /> Correo
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
  if (!CONTACT_WHATSAPP) return null;
  return (
    <a
      href={whatsappLink('Hola, quiero hacer un pedido en TemaShop.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed z-40 right-4 bottom-20 sm:bottom-6 sm:right-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-xl shadow-emerald-900/20 p-3.5 sm:pl-4 sm:pr-5 transition-colors"
    >
      <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline text-sm font-semibold">¿Te ayudamos?</span>
    </a>
  );
};
