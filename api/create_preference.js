const { mercadopago, sendOrderNotification } = require('./utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { items, payer, shipments, back_urls, external_reference } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ message: 'El carrito no puede estar vacío.' });
  }

  try {
    const preference = {
      items,
      payer,
      shipments: shipments || { cost: 0, mode: 'not_specified' },
      back_urls: back_urls || {},
      auto_return: 'approved',
      external_reference,
      statement_descriptor: 'Dulce Conexion'
    };

    const response = await mercadopago.preferences.create(preference);
    const preferenceData = response.body;

    sendOrderNotification({
      items,
      payer,
      init_point: preferenceData.init_point,
      external_reference
    }).catch(error => {
      console.error('Error enviando correo de pedido:', error);
    });

    return res.status(200).json(preferenceData);
  } catch (error) {
    console.error('Mercado Pago error:', error);
    const message = error.message || 'Error creando preferencia';
    const details = error.response?.body || null;
    return res.status(500).json({ message, details });
  }
};
