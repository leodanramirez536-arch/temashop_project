// Configuración pública de la tienda.
// Los valores se pueden cambiar sin tocar el código en Vercel → Settings → Environment Variables.
const env = (import.meta as any).env || {};

export const STORE_NAME = 'TemaShop';

// Canales de atención (opcionales). Si están vacíos, no se muestran.
export const CONTACT_EMAIL: string = env.VITE_CONTACT_EMAIL || '';
export const CONTACT_WHATSAPP: string = env.VITE_CONTACT_WHATSAPP || ''; // ej: 18095551234

// PayPal: el "Client ID" es público. Si no está configurado, PayPal no aparece en el pago.
export const PAYPAL_CLIENT_ID: string = env.VITE_PAYPAL_CLIENT_ID || '';

// Días para solicitar una devolución (debe coincidir con tu política real)
export const RETURN_DAYS = Number(env.VITE_RETURN_DAYS || 7);

// Tiempo estimado de entrega mostrado al cliente
export const DELIVERY_ESTIMATE = env.VITE_DELIVERY_ESTIMATE || '2 a 5 días hábiles';

export const formatMoney = (n: number) =>
  `US$${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
