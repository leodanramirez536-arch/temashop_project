// Código compartido de las funciones de servidor (Vercel).
// Las claves secretas se configuran en Vercel → Settings → Environment Variables:
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE ("live" o "sandbox"), SUPABASE_SERVICE_KEY
// Nunca se envían al navegador.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qupydtmqiowjysqhqsww.supabase.co';

export function paypalBase() {
  return process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function checkConfig() {
  const missing = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'SUPABASE_SERVICE_KEY'].filter((k) => !process.env[k]);
  if (missing.length) {
    const err = new Error('El pago con PayPal aún no está configurado en el servidor.');
    err.status = 503;
    err.detail = `Faltan variables: ${missing.join(', ')}`;
    throw err;
  }
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const h = { apikey: key, 'Content-Type': 'application/json' };
  // Las claves antiguas (JWT) también van en Authorization; las nuevas "sb_secret_" solo en apikey
  if (!key.startsWith('sb_')) h.Authorization = `Bearer ${key}`;
  return h;
}

export async function getOrder(orderId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*`, {
    headers: supabaseHeaders(),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
}

export async function updateOrderRow(orderId, changes) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: { ...supabaseHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify(changes),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
}

export async function paypalToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal auth ${res.status}`);
  return json.access_token;
}

export async function paypalRequest(path, { method = 'GET', body, token, requestId } = {}) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (requestId) headers['PayPal-Request-Id'] = requestId;
  const res = await fetch(`${paypalBase()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}

export function sendError(res, err) {
  console.error(err?.detail || err);
  res.status(err?.status || 500).json({ error: err?.status ? err.message : 'Error procesando el pago. Inténtalo de nuevo.' });
}
