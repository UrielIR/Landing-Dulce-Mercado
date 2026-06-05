const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mercadopago = require('mercadopago');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  MP_ACCESS_TOKEN,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_TO,
  EMAIL_FROM,
  PORT
} = process.env;

if (!MP_ACCESS_TOKEN) {
  console.error('Error: falta MP_ACCESS_TOKEN en .env');
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('Error: faltan EMAIL_USER o EMAIL_PASS en .env');
  process.exit(1);
}

const emailTo = EMAIL_TO || EMAIL_USER;
const emailFrom = EMAIL_FROM || EMAIL_USER;

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

mercadopago.configure({ access_token: MP_ACCESS_TOKEN });

function formatMoney(value) {
  return `$${value.toLocaleString('es-CL')} CLP`;
}

function buildOrderHtml({ items, shipments, payer, external_reference, init_point }) {
  const rows = items.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.quantity}</td>
        <td>${formatMoney(item.unit_price)}</td>
        <td>${formatMoney(item.quantity * item.unit_price)}</td>
      </tr>
    `).join('');

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  return `
    <h2>Nuevo pedido Dulce Mercado</h2>
    <p><strong>Cliente:</strong> ${payer.name}</p>
    <p><strong>Email:</strong> ${payer.email}</p>
    <p><strong>Teléfono:</strong> ${payer.phone?.number || 'No disponible'}</p>
    <p><strong>Referencia externa:</strong> ${external_reference || 'N/A'}</p>
    <table border="0" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%;">
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
  const plainText = `Nuevo pedido de ${payload.payer.name} (${payload.payer.email})\nTotal: ${formatMoney(payload.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0))}\nLink de pago: ${payload.init_point}`;

  await transporter.sendMail({
    from: emailFrom,
    to: emailTo,
    cc: payload.payer.email,
    replyTo: payload.payer.email,
    subject: `Nueva orden Dulce Mercado: ${payload.payer.name}`,
    text: plainText,
    html
  });
}

app.post('/create_preference', async (req, res) => {
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
      statement_descriptor: 'Dulce Mercado'
    };

    const response = await mercadopago.preferences.create(preference);
    const preferenceData = response.body;

    try {
      await sendOrderNotification({
        items,
        payer,
        shipments: preference.shipments,
        external_reference,
        init_point: preferenceData.init_point
      });
    } catch (emailError) {
      console.error('Error enviando correo de pedido:', emailError);
    }

    return res.json(preferenceData);
  } catch (error) {
    console.error('Mercado Pago error:', error);
    const message = error.message || 'Error creando preferencia';
    const details = error.response?.body || null;
    return res.status(500).json({ message, details });
  }
});

app.post('/send_contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Nombre, email y mensaje son obligatorios.' });
  }

  try {
    await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      replyTo: email,
      subject: `Consulta web de ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone || 'No indicado'}\n\nMensaje:\n${message}`,
      html: `<p><strong>Nombre:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Teléfono:</strong> ${phone || 'No indicado'}</p><p><strong>Mensaje:</strong></p><p>${message.replace(/\n/g,'<br>')}</p>`
    });

    return res.json({ message: 'Consulta enviada correctamente.' });
  } catch (error) {
    console.error('Error enviando correo de consulta:', error);
    return res.status(500).json({ message: 'No se pudo enviar la consulta. Intenta más tarde.' });
  }
});

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Mercado Pago backend escuchando en http://localhost:${port}`);
});
