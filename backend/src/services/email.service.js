const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

const sendWorkOrderEmail = async ({ to, subject, order, clientName, bikeInfo }) => {
  if (!transporter) {
    console.log('SMTP no configurado. Simulación de email:', { to, subject });
    return { success: true, simulated: true };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1565c0; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">TALLER SKM</h1>
      </div>
      <div style="padding: 20px; background: #f5f5f5;">
        <h2 style="color: #333;">${subject}</h2>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <p><strong>Orden #${order.id}</strong></p>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Moto:</strong> ${bikeInfo}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
          <p><strong>Total:</strong> $${Number(order.total || 0).toFixed(2)}</p>
          ${order.entryDate ? `<p><strong>Fecha:</strong> ${order.entryDate}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Este es un mensaje automático del sistema de gestión de órdenes de Taller SKM.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Taller SKM" <noreply@skm.com>',
      to,
      subject,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initTransporter,
  sendWorkOrderEmail,
};