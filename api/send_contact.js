const nodemailer = require('nodemailer');

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_TO,
  EMAIL_FROM
} = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS are required');
}

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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Método no permitido' });
  }

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

    return res.status(200).json({ message: 'Consulta enviada correctamente.' });
  } catch (error) {
    console.error('Error enviando correo de consulta:', error);
    return res.status(500).json({ message: 'No se pudo enviar la consulta. Intenta más tarde.' });
  }
};
