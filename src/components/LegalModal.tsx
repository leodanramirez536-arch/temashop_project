import React from 'react';
import { X, FileText } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, RETURN_DAYS, STORE_NAME } from '../config';
import { useLang, deliveryEstimate } from '../i18n';

const DELIVERY_ES = deliveryEstimate('es');
const DELIVERY_EN = deliveryEstimate('en');

export type LegalPage = 'terms' | 'privacy' | 'returns';

interface LegalModalProps {
  page: LegalPage | null;
  onClose: () => void;
}

const contactLine = (en = false) => {
  const parts: string[] = [];
  if (CONTACT_WHATSAPP) parts.push(`WhatsApp +${CONTACT_WHATSAPP.replace(/\D/g, '')}`);
  if (CONTACT_EMAIL) parts.push(`${en ? 'email' : 'correo'} ${CONTACT_EMAIL}`);
  if (en) return parts.length ? parts.join(' or ') : 'the contact channels listed in the store';
  return parts.length ? parts.join(' o ') : 'los canales de contacto indicados en la tienda';
};

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-bold text-slate-900 pt-3">{children}</h3>
);

const TermsEs = () => (
  <>
    <p>Estos términos regulan las compras realizadas en {STORE_NAME}. Al hacer un pedido aceptas estas condiciones.</p>
    <H>1. Productos y precios</H>
    <p>Los precios se muestran en dólares estadounidenses (US$). Procuramos que la información y las fotos de cada producto sean exactas; si detectamos un error evidente de precio o de descripción, te contactaremos antes de enviar el pedido y podrás cancelarlo sin costo.</p>
    <H>2. Pedidos</H>
    <p>Un pedido se considera aceptado cuando lo confirmamos. Podemos cancelar un pedido si el producto se agotó, si no podemos verificar los datos de entrega o si detectamos un uso fraudulento. Si ya pagaste, te devolvemos el importe completo.</p>
    <H>3. Pagos</H>
    <p>Aceptamos tarjeta de débito o crédito y PayPal (procesados por PayPal), Zelle, Cash App y efectivo contra entrega. {STORE_NAME} no recibe ni guarda los datos de tu tarjeta. En pagos por Zelle o Cash App, el pedido se prepara cuando confirmamos que el pago llegó; si no recibimos el pago en 48 horas, el pedido puede cancelarse.</p>
    <H>4. Envíos</H>
    <p>El tiempo estimado de entrega es de {DELIVERY_ES} desde la confirmación. Es una estimación y puede variar por causas ajenas a nosotros. Consulta la Política de Envíos y Devoluciones.</p>
    <H>5. Cuentas</H>
    <p>Eres responsable de mantener la confidencialidad de tu contraseña. Puedes comprar sin crear una cuenta.</p>
    <H>6. Derechos del consumidor</H>
    <p>Nada en estos términos limita los derechos que te otorga la legislación de protección al consumidor aplicable.</p>
    <H>7. Contacto</H>
    <p>Para cualquier consulta escríbenos por {contactLine()}.</p>
  </>
);

const PrivacyEs = () => (
  <>
    <p>En {STORE_NAME} cuidamos tus datos personales. Esta política explica qué datos recopilamos y para qué.</p>
    <H>Datos que recopilamos</H>
    <p>Nombre, correo electrónico, teléfono y dirección de entrega cuando haces un pedido o creas una cuenta, y el detalle de tus compras. Si te suscribes a nuestras ofertas, guardamos tu correo para enviártelas; puedes pedir la baja en cualquier momento.</p>
    <H>Para qué los usamos</H>
    <p>Solo para procesar y entregar tus pedidos, comunicarnos contigo sobre ellos, atender devoluciones y cumplir obligaciones legales. No vendemos tus datos.</p>
    <H>Con quién los compartimos</H>
    <p>Con los proveedores necesarios para operar la tienda: el servicio de base de datos y cuentas (Supabase), los servicios de pago (PayPal, Zelle, Cash App) y la empresa o persona que realiza la entrega.</p>
    <H>Contraseñas y pagos</H>
    <p>Tu contraseña se guarda cifrada y nadie de {STORE_NAME} puede verla. Nunca guardamos los datos de tu tarjeta.</p>
    <H>En tu navegador</H>
    <p>Guardamos en tu navegador tu bolsa de compras, tus favoritos y, si compras sin cuenta, los números de tus pedidos. No usamos cookies publicitarias.</p>
    <H>Tus derechos</H>
    <p>Puedes pedir acceso, corrección o eliminación de tus datos escribiéndonos por {contactLine()}.</p>
  </>
);

const ReturnsEs = () => (
  <>
    <H>Envíos</H>
    <p>Entregamos a domicilio. El tiempo estimado es de {DELIVERY_ES} desde que confirmamos tu pedido. El costo del envío se muestra antes de confirmar la compra; los pedidos que superan el monto indicado en la tienda tienen envío gratis.</p>
    <p>Te contactaremos por teléfono o WhatsApp para coordinar la entrega. Revisa el paquete al recibirlo.</p>
    <H>Devoluciones</H>
    <p>Puedes solicitar una devolución dentro de los {RETURN_DAYS} días siguientes a la entrega. El producto debe estar sin usar, en su empaque original y con todos sus accesorios.</p>
    <p>Si el producto llegó dañado, defectuoso o no corresponde con lo que pediste, avísanos dentro de las 48 horas siguientes a la entrega y lo cambiamos o te devolvemos el dinero sin costo para ti.</p>
    <H>Reembolsos</H>
    <p>Una vez recibido y revisado el producto devuelto, hacemos el reembolso por el mismo medio de pago: a tu tarjeta o cuenta PayPal si pagaste con tarjeta, por Zelle o Cash App si pagaste por esos medios, o por transferencia si pagaste en efectivo.</p>
    <H>Cancelaciones</H>
    <p>Puedes cancelar tu pedido sin costo antes de que sea enviado.</p>
    <H>Cómo solicitarla</H>
    <p>Escríbenos por {contactLine()} con tu número de pedido.</p>
  </>
);


const TermsEn = () => (
  <>
    <p>These terms govern purchases made at {STORE_NAME}. By placing an order, you agree to them.</p>
    <H>1. Products and prices</H>
    <p>Prices are shown in U.S. dollars (USD). We work to keep product information and photos accurate. If we find an obvious pricing or description error, we will contact you before shipping and you may cancel at no cost.</p>
    <H>2. Orders</H>
    <p>An order is accepted once we confirm it. We may cancel an order if the item is out of stock, if we cannot verify the delivery details, or if we detect fraudulent use. If you already paid, we refund the full amount.</p>
    <H>3. Payments</H>
    <p>We accept debit or credit cards and PayPal (processed by PayPal), Zelle, Cash App and cash on delivery. {STORE_NAME} never receives or stores your card details. For Zelle or Cash App payments, we prepare your order once we confirm the payment arrived; if payment is not received within 48 hours, the order may be canceled.</p>
    <H>4. Shipping</H>
    <p>Estimated delivery time is {DELIVERY_EN} after confirmation. This is an estimate and may vary due to circumstances beyond our control. See our Shipping &amp; Returns Policy.</p>
    <H>5. Accounts</H>
    <p>You are responsible for keeping your password confidential. You can shop without creating an account.</p>
    <H>6. Consumer rights</H>
    <p>Nothing in these terms limits the rights you have under applicable consumer protection laws.</p>
    <H>7. Contact</H>
    <p>For any questions, reach us via {contactLine(true)}.</p>
  </>
);

const PrivacyEn = () => (
  <>
    <p>At {STORE_NAME} we take care of your personal data. This policy explains what we collect and why.</p>
    <H>Data we collect</H>
    <p>Your name, email, phone number and delivery address when you place an order or create an account, plus the details of your purchases. If you subscribe to our deals, we keep your email to send them; you can unsubscribe at any time.</p>
    <H>How we use it</H>
    <p>Only to process and deliver your orders, contact you about them, handle returns and meet legal obligations. We do not sell your data.</p>
    <H>Who we share it with</H>
    <p>Only the providers needed to run the store: our database and accounts service (Supabase), payment services (PayPal, Zelle, Cash App) and the company or person making the delivery.</p>
    <H>Passwords and payments</H>
    <p>Your password is stored encrypted and no one at {STORE_NAME} can see it. We never store your card details.</p>
    <H>In your browser</H>
    <p>We save your cart, your favorites, your language preference and, if you check out as a guest, your order numbers in your browser. We do not use advertising cookies.</p>
    <H>Your rights</H>
    <p>You can request access to, correction of or deletion of your data by contacting us via {contactLine(true)}.</p>
  </>
);

const ReturnsEn = () => (
  <>
    <H>Shipping</H>
    <p>We deliver to your door. Estimated delivery is {DELIVERY_EN} after we confirm your order. The shipping cost is shown before you place your order; orders above the amount shown in the store ship free.</p>
    <p>We will contact you by phone or WhatsApp to arrange delivery. Please inspect the package when you receive it.</p>
    <H>Returns</H>
    <p>You can request a return within {RETURN_DAYS} days of delivery. Items must be unused, in their original packaging and with all accessories.</p>
    <p>If your item arrived damaged, defective or not as ordered, let us know within 48 hours of delivery and we will replace it or refund you at no cost to you.</p>
    <H>Refunds</H>
    <p>Once we receive and inspect the returned item, we refund you using the same payment method: to your card or PayPal account if you paid by card, via Zelle or Cash App if you paid that way, or by bank transfer if you paid in cash.</p>
    <H>Cancellations</H>
    <p>You can cancel your order at no cost before it ships.</p>
    <H>How to request one</H>
    <p>Contact us via {contactLine(true)} with your order number.</p>
  </>
);

const TITLES: Record<LegalPage, string> = {
  terms: 'Términos y Condiciones',
  privacy: 'Política de Privacidad',
  returns: 'Envíos y Devoluciones',
};

const TITLES_EN: Record<LegalPage, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  returns: 'Shipping & Returns',
};

export const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  const { lang, tr, date } = useLang();
  if (!page) return null;
  const en = lang === 'en';
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-black text-slate-900">{(en ? TITLES_EN : TITLES)[page]}</h2>
          </div>
          <button onClick={onClose} aria-label={tr('Cerrar', 'Close')} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2 text-xs text-slate-600 leading-relaxed">
          {page === 'terms' && (en ? <TermsEn /> : <TermsEs />)}
          {page === 'privacy' && (en ? <PrivacyEn /> : <PrivacyEs />)}
          {page === 'returns' && (en ? <ReturnsEn /> : <ReturnsEs />)}
          <p className="pt-4 text-[11px] text-slate-400">{tr('Última actualización:', 'Last updated:')} {date(new Date(2026, 8, 23), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
};
