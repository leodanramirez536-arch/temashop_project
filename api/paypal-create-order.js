import { checkConfig, getOrder, updateOrderRow, paypalToken, paypalRequest, readBody, sendError } from './_lib/shared.js';

// Crea la orden de PayPal con el total calculado por la base de datos (el navegador no decide el monto)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    checkConfig();
    const { orderId } = readBody(req);
    if (!orderId || typeof orderId !== 'string') return res.status(400).json({ error: 'Pedido no válido' });

    const order = await getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (order.payment_method !== 'paypal') return res.status(400).json({ error: 'Este pedido no se paga con PayPal' });
    if (order.payment_status === 'pagado') return res.status(409).json({ error: 'Este pedido ya está pagado' });
    if (order.status === 'cancelado') return res.status(409).json({ error: 'Este pedido fue cancelado' });

    const token = await paypalToken();
    const { ok, json } = await paypalRequest('/v2/checkout/orders', {
      method: 'POST',
      token,
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.id,
            custom_id: order.id,
            invoice_id: order.order_number,
            description: `Pedido ${order.order_number} - TemaShop`,
            amount: { currency_code: 'USD', value: Number(order.total).toFixed(2) },
          },
        ],
        application_context: { brand_name: 'TemaShop', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
      },
    });
    if (!ok || !json.id) {
      const err = new Error('PayPal no pudo crear el pago.');
      err.status = 502;
      err.detail = json;
      throw err;
    }

    await updateOrderRow(order.id, { paypal_order_id: json.id });
    res.status(200).json({ id: json.id });
  } catch (err) {
    sendError(res, err);
  }
}
