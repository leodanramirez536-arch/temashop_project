import { checkConfig, getOrder, updateOrderRow, paypalToken, paypalRequest, readBody, sendError } from './_lib/shared.js';

// Cobra el pago en PayPal, verifica monto y moneda, y marca el pedido como pagado
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    checkConfig();
    const { orderId, paypalOrderId } = readBody(req);
    if (!orderId || !paypalOrderId) return res.status(400).json({ error: 'Datos incompletos' });

    const order = await getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (order.payment_status === 'pagado') return res.status(200).json({ ok: true });
    if (order.paypal_order_id !== paypalOrderId) return res.status(400).json({ error: 'El pago no corresponde a este pedido' });

    const token = await paypalToken();
    let result = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: 'POST',
      token,
      requestId: `capture-${order.id}`,
    });
    // Si ya se había cobrado, consultamos el estado
    if (!result.ok && result.status === 422) {
      result = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, { token });
    }
    if (!result.ok) {
      const err = new Error('PayPal no pudo completar el cobro. Inténtalo de nuevo o usa otro método.');
      err.status = 402;
      err.detail = result.json;
      throw err;
    }

    const unit = result.json.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const paidValue = Number(capture?.amount?.value || 0);
    const currency = capture?.amount?.currency_code;
    const completed = result.json.status === 'COMPLETED' && capture?.status === 'COMPLETED';

    if (!completed || currency !== 'USD' || Math.abs(paidValue - Number(order.total)) > 0.009) {
      const err = new Error('El pago no se completó correctamente. Si se descontó dinero, contáctanos.');
      err.status = 402;
      err.detail = { status: result.json.status, capture };
      throw err;
    }

    await updateOrderRow(order.id, {
      payment_status: 'pagado',
      status: order.status === 'pendiente' ? 'confirmado' : order.status,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
}
