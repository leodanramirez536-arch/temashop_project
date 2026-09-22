import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Order } from '../types';
import { ZELLE_RECIPIENT, ZELLE_NAME, CASHAPP_TAG, CONTACT_WHATSAPP, formatMoney } from '../config';

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded-lg"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
};

const Row: React.FC<{ label: string; value: string; copy?: boolean }> = ({ label, value, copy }) => (
  <div className="flex items-center justify-between gap-2 py-1">
    <span className="text-slate-500">{label}</span>
    <span className="flex items-center gap-2 font-bold text-slate-900 text-right break-all">
      {value}
      {copy && <CopyButton value={value} />}
    </span>
  </div>
);

// Instrucciones para pagar un pedido por Zelle o Cash App
export const PaymentInstructions: React.FC<{ order: Order }> = ({ order }) => {
  if (order.paymentStatus === 'pagado') return null;
  if (order.paymentMethod !== 'zelle' && order.paymentMethod !== 'cashapp') return null;

  const isZelle = order.paymentMethod === 'zelle';
  const amount = order.total.toFixed(2);
  const cashAppLink = CASHAPP_TAG ? `https://cash.app/${CASHAPP_TAG}/${amount}` : '';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-left space-y-2">
      <p className="font-black text-blue-950 text-sm">
        {isZelle ? 'Paga con Zelle' : 'Paga con Cash App'}
      </p>
      <div className="bg-white rounded-xl border border-blue-100 px-3 py-1.5 divide-y divide-slate-100">
        {isZelle ? (
          <>
            <Row label="Enviar a" value={ZELLE_RECIPIENT} copy />
            {ZELLE_NAME && <Row label="A nombre de" value={ZELLE_NAME} />}
          </>
        ) : (
          <Row label="Cashtag" value={CASHAPP_TAG} copy />
        )}
        <Row label="Monto exacto" value={formatMoney(order.total)} copy />
        <Row label="Nota / memo" value={order.orderNumber} copy />
      </div>
      {!isZelle && cashAppLink && (
        <a
          href={cashAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-emerald-500 hover:bg-emerald-400 text-white font-black py-2.5 rounded-xl"
        >
          Abrir Cash App y pagar {formatMoney(order.total)}
        </a>
      )}
      <p className="text-slate-600">
        Escribe <strong>{order.orderNumber}</strong> en la nota del pago. Preparamos tu pedido cuando confirmamos que el pago llegó.
        {CONTACT_WHATSAPP && ' Si quieres, envíanos la captura del pago por WhatsApp.'}
      </p>
    </div>
  );
};
