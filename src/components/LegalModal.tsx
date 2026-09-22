import React from 'react';
import { X, FileText } from 'lucide-react';
import { CONTACT_EMAIL, CONTACT_WHATSAPP, RETURN_DAYS, DELIVERY_ESTIMATE, STORE_NAME } from '../config';

export type LegalPage = 'terms' | 'privacy' | 'returns';

interface LegalModalProps {
  page: LegalPage | null;
  onClose: () => void;
}

const contactLine = () => {
  const parts: string[] = [];
  if (CONTACT_WHATSAPP) parts.push(`WhatsApp +${CONTACT_WHATSAPP.replace(/\D/g, '')}`);
  if (CONTACT_EMAIL) parts.push(`correo ${CONTACT_EMAIL}`);
  return parts.length ? parts.join(' o ') : 'los canales de contacto indicados en la tienda';
};

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-bold text-slate-900 pt-3">{children}</h3>
);

const Terms = () => (
  <>
    <p>Estos términos regulan las compras realizadas en {STORE_NAME}. Al hacer un pedido aceptas estas condiciones.</p>
    <H>1. Productos y precios</H>
    <p>Los precios se muestran en dólares estadounidenses (US$). Procuramos que la información y las fotos de cada producto sean exactas; si detectamos un error evidente de precio o de descripción, te contactaremos antes de enviar el pedido y podrás cancelarlo sin costo.</p>
    <H>2. Pedidos</H>
    <p>Un pedido se considera aceptado cuando lo confirmamos. Podemos cancelar un pedido si el producto se agotó, si no podemos verificar los datos de entrega o si detectamos un uso fraudulento. Si ya pagaste, te devolvemos el importe completo.</p>
    <H>3. Pagos</H>
    <p>Aceptamos tarjeta de débito o crédito y PayPal (procesados por PayPal), Zelle, Cash App y efectivo contra entrega. {STORE_NAME} no recibe ni guarda los datos de tu tarjeta. En pagos por Zelle o Cash App, el pedido se prepara cuando confirmamos que el pago llegó; si no recibimos el pago en 48 horas, el pedido puede cancelarse.</p>
    <H>4. Envíos</H>
    <p>El tiempo estimado de entrega es de {DELIVERY_ESTIMATE} desde la confirmación. Es una estimación y puede variar por causas ajenas a nosotros. Consulta la Política de Envíos y Devoluciones.</p>
    <H>5. Cuentas</H>
    <p>Eres responsable de mantener la confidencialidad de tu contraseña. Puedes comprar sin crear una cuenta.</p>
    <H>6. Derechos del consumidor</H>
    <p>Nada en estos términos limita los derechos que te otorga la legislación de protección al consumidor aplicable.</p>
    <H>7. Contacto</H>
    <p>Para cualquier consulta escríbenos por {contactLine()}.</p>
  </>
);

const Privacy = () => (
  <>
    <p>En {STORE_NAME} cuidamos tus datos personales. Esta política explica qué datos recopilamos y para qué.</p>
    <H>Datos que recopilamos</H>
    <p>Nombre, correo electrónico, teléfono y dirección de entrega cuando haces un pedido o creas una cuenta, y el detalle de tus compras.</p>
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

const Returns = () => (
  <>
    <H>Envíos</H>
    <p>Entregamos a domicilio. El tiempo estimado es de {DELIVERY_ESTIMATE} desde que confirmamos tu pedido. El costo del envío se muestra antes de confirmar la compra; los pedidos que superan el monto indicado en la tienda tienen envío gratis.</p>
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

const TITLES: Record<LegalPage, string> = {
  terms: 'Términos y Condiciones',
  privacy: 'Política de Privacidad',
  returns: 'Envíos y Devoluciones',
};

export const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  if (!page) return null;
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
            <h2 className="text-base font-black text-slate-900">{TITLES[page]}</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-2 text-xs text-slate-600 leading-relaxed">
          {page === 'terms' && <Terms />}
          {page === 'privacy' && <Privacy />}
          {page === 'returns' && <Returns />}
          <p className="pt-4 text-[11px] text-slate-400">Última actualización: {new Date(2026, 8, 22).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
};
