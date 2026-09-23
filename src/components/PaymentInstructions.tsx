import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Order } from '../types';
import { ZELLE_RECIPIENT, ZELLE_NAME, CASHAPP_TAG, CONTACT_WHATSAPP, BANK_ACCOUNTS, BANK_HOLDER, BANK_HOLDER_ID, DOP_RATE, formatMoney, formatDOP } from '../config';
import { useLang } from '../i18n';

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const { tr } = useLang();
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
      {copied ? tr('Copiado', 'Copied') : tr('Copiar', 'Copy')}
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

// Instrucciones para pagar por transferencia bancaria en República Dominicana
const BankTransferInstructions: React.FC<{ order: Order }> = ({ order }) => {
  const { tr } = useLang();
  const hasDopAccount = BANK_ACCOUNTS.some((b) => b.currency === 'DOP');
  const showDop = DOP_RATE > 0 && hasDopAccount;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-left space-y-2">
      <p className="font-black text-blue-950 text-sm">{tr('Paga por transferencia bancaria', 'Pay by bank transfer')}</p>
      <p className="text-slate-600">
        {tr('Transfiere o deposita a cualquiera de estas cuentas desde tu banco, app o subagente bancario:', 'Transfer or deposit to any of these accounts from your bank, banking app or bank agent:')}
      </p>
      {BANK_ACCOUNTS.map((b) => (
        <div key={b.bank + b.number} className="bg-white rounded-xl border border-blue-100 px-3 py-1.5 divide-y divide-slate-100">
          <Row label={tr('Banco', 'Bank')} value={b.bank} />
          {b.type && <Row label={tr('Tipo de cuenta', 'Account type')} value={`${b.type} · ${b.currency}`} />}
          <Row label={tr('Número de cuenta', 'Account number')} value={b.number} copy />
        </div>
      ))}
      <div className="bg-white rounded-xl border border-blue-100 px-3 py-1.5 divide-y divide-slate-100">
        {BANK_HOLDER && <Row label={tr('Titular', 'Account holder')} value={BANK_HOLDER} />}
        {BANK_HOLDER_ID && <Row label={tr('Cédula / RNC', 'ID / RNC')} value={BANK_HOLDER_ID} copy />}
        <Row label={tr('Monto exacto', 'Exact amount')} value={formatMoney(order.total)} copy />
        {showDop && <Row label={tr('Monto en pesos', 'Amount in pesos')} value={formatDOP(order.total)} copy />}
        <Row label={tr('Concepto / referencia', 'Reference / memo')} value={order.orderNumber} copy />
      </div>
      {showDop && (
        <p className="text-slate-500">
          {tr(`Monto en pesos calculado a RD$${DOP_RATE} por US$1.`, `Peso amount calculated at RD$${DOP_RATE} per US$1.`)}
        </p>
      )}
      <p className="text-slate-600">
        {tr('Escribe', 'Write')} <strong>{order.orderNumber}</strong> {tr('en el concepto de la transferencia. Las transferencias entre bancos distintos (ACH/LBTR) pueden tardar hasta 1 día hábil. Preparamos tu pedido cuando confirmamos que el pago llegó.', "in the transfer memo. Transfers between different banks (ACH/LBTR) can take up to 1 business day. We'll prepare your order once we confirm the payment arrived.")}
        {CONTACT_WHATSAPP && tr(' Envíanos el comprobante por WhatsApp para confirmarlo más rápido.', ' Send us the receipt on WhatsApp so we can confirm it faster.')}
      </p>
    </div>
  );
};

// Instrucciones para pagar un pedido por Zelle, Cash App o transferencia
export const PaymentInstructions: React.FC<{ order: Order }> = ({ order }) => {
  const { tr } = useLang();
  if (order.paymentStatus === 'pagado') return null;
  if (order.paymentMethod === 'transferencia_rd') return BANK_ACCOUNTS.length ? <BankTransferInstructions order={order} /> : null;
  if (order.paymentMethod !== 'zelle' && order.paymentMethod !== 'cashapp') return null;

  const isZelle = order.paymentMethod === 'zelle';
  const amount = order.total.toFixed(2);
  const cashAppLink = CASHAPP_TAG ? `https://cash.app/${CASHAPP_TAG}/${amount}` : '';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-left space-y-2">
      <p className="font-black text-blue-950 text-sm">
        {isZelle ? tr('Paga con Zelle', 'Pay with Zelle') : tr('Paga con Cash App', 'Pay with Cash App')}
      </p>
      <div className="bg-white rounded-xl border border-blue-100 px-3 py-1.5 divide-y divide-slate-100">
        {isZelle ? (
          <>
            <Row label={tr('Enviar a', 'Send to')} value={ZELLE_RECIPIENT} copy />
            {ZELLE_NAME && <Row label={tr('A nombre de', 'Recipient name')} value={ZELLE_NAME} />}
          </>
        ) : (
          <Row label="Cashtag" value={CASHAPP_TAG} copy />
        )}
        <Row label={tr('Monto exacto', 'Exact amount')} value={formatMoney(order.total)} copy />
        <Row label={tr('Nota / memo', 'Note / memo')} value={order.orderNumber} copy />
      </div>
      {!isZelle && cashAppLink && (
        <a
          href={cashAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-emerald-500 hover:bg-emerald-400 text-white font-black py-2.5 rounded-xl"
        >
          {tr('Abrir Cash App y pagar', 'Open Cash App and pay')} {formatMoney(order.total)}
        </a>
      )}
      <p className="text-slate-600">
        {tr('Escribe', 'Write')} <strong>{order.orderNumber}</strong> {tr('en la nota del pago. Preparamos tu pedido cuando confirmamos que el pago llegó.', "in the payment note. We'll prepare your order once we confirm the payment arrived.")}
        {CONTACT_WHATSAPP && tr(' Si quieres, envíanos la captura del pago por WhatsApp.', ' You can also send us a screenshot of the payment on WhatsApp.')}
      </p>
    </div>
  );
};
