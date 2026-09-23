// Configuración pública de la tienda.
// Los valores se pueden cambiar sin tocar el código en Vercel → Settings → Environment Variables.
import { trNow } from './i18n';

const env = (import.meta as any).env || {};

export const STORE_NAME = 'TemaShop';

// Canales de atención (opcionales). Si están vacíos, no se muestran.
export const CONTACT_EMAIL: string = env.VITE_CONTACT_EMAIL || '';
export const CONTACT_WHATSAPP: string = env.VITE_CONTACT_WHATSAPP || ''; // ej: 18095551234

// PayPal: el "Client ID" es público. Si no está configurado, PayPal no aparece en el pago.
export const PAYPAL_CLIENT_ID: string = env.VITE_PAYPAL_CLIENT_ID || '';

// Zelle y Cash App: pagos directos a tu cuenta. Si están vacíos, no aparecen en el pago.
export const ZELLE_RECIPIENT: string = env.VITE_ZELLE_RECIPIENT || ''; // correo o teléfono registrado en Zelle
export const ZELLE_NAME: string = env.VITE_ZELLE_NAME || '';           // nombre que verá el cliente en Zelle
export const CASHAPP_TAG: string = (env.VITE_CASHAPP_TAG || '').replace(/^\$?/, env.VITE_CASHAPP_TAG ? '$' : ''); // ej: $MiTienda

// Días para solicitar una devolución (debe coincidir con tu política real)
export const RETURN_DAYS = Number(env.VITE_RETURN_DAYS || 7);

// Tiempo estimado de entrega mostrado al cliente
export const DELIVERY_ESTIMATE = env.VITE_DELIVERY_ESTIMATE || '2 a 5 días hábiles';

// Monto corto: "US$25" en vez de "US$25.00" cuando no tiene centavos
export const formatMoneyShort = (n: number) =>
  Number.isInteger(Number(n)) ? `${trNow('US$', '$')}${Number(n).toLocaleString('en-US')}` : formatMoney(n);

export const formatMoney = (n: number) =>
  `${trNow('US$', '$')}${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
