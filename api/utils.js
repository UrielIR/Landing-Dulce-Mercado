const nodemailer = require('nodemailer');
const mercadopago = require('mercadopago');

const {
  MP_ACCESS_TOKEN,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_TO,
  EMAIL_FROM
} = process.env;

if (!MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN is required');
}
if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS are required');
}

mercadopago.configure({ access_token: MP_ACCESS_TOKEN });

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const emailFrom = EMAIL_FROM || EMAIL_USER;
const emailTo = EMAIL_TO || EMAIL_USER;

function formatMoney(value) {
  return `$${value.toLocaleString('es-CL')} CLP`;
}

function buildOrderHtml({ items, payer, init_point, external_reference }) {
  const rows = items.map(item => `
    <tr>
      <td>${item.title}</td>
      <td align="center">${item.quantity}</td>
      <td align="right">${formatMoney(item.unit_price)}</td>
      <td align="right">${formatMoney(item.quantity * item.unit_price)}</td>
    </tr>
  `).join('');

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  return `
    <h2>Nuevo pedido Dulce Conexion</h2>
    <p><strong>Cliente:</strong> ${payer.name}</p>
    <p><strong>Email:</strong> ${payer.email}</p>
    <p><strong>Teléfono:</strong> ${payer.phone?.number || 'No disponible'}</p>
    <p><strong>Referencia externa:</strong> ${external_reference || 'N/A'}</p>
    <table border="0" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th align="left">Producto</th>
          <th align="center">Cantidad</th>
          <th align="right">Precio unitario</th>
          <th align="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right"><strong>Total</strong></td>
          <td align="right"><strong>${formatMoney(total)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p><strong>Link de pago Mercado Pago:</strong> <a href="${init_point}" target="_blank">Pagar ahora</a></p>
  `;
}

async function sendOrderNotification(payload) {
  const html = buildOrderHtml(payload);
  const total = payload.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const text = [`Nuevo pedido de ${payload.payer.name} (${payload.payer.email})`,
    `Total: ${formatMoney(total)}`,
    `Link de pago: ${payload.init_point}`
  ].join('\n');

  return transporter.sendMail({
    from: emailFrom,
    to: emailTo,
    cc: payload.payer.email,
    replyTo: payload.payer.email,
    subject: `Nueva orden Dulce Conexion: ${payload.payer.name}`,
    text,
    html
  });
}

module.exports = {
  mercadopago,
  sendOrderNotification,
  formatMoney
};
