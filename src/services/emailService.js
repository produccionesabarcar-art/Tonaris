const { Resend } = require('resend');
const logger = require('../lib/logger');

let resendInstance = null;

function getResend() {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

async function sendPasswordResetEmail(email, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
  const resetLink = `${frontendUrl}/tonaris/index.html?screen=reset-password&token=${resetToken}`;

  try {
    await getResend().emails.send({
      from: 'Abarcar Audio <onboarding@resend.dev>',
      to: email,
      subject: 'Restablece tu contraseña — Abarcar Audio',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0C;font-family:system-ui,sans-serif;">
  <table role="presentation" style="width:100%;max-width:480px;margin:0 auto;padding:32px 16px;">
    <tr><td style="text-align:center;padding-bottom:24px;">
      <img src="https://abarcaraudio.com/logo.png" alt="ABARCAR" style="height:32px;opacity:0.6;">
    </td></tr>
    <tr><td style="background:#111115;border:1px solid rgba(245,243,239,0.07);border-radius:14px;padding:32px 24px;">
      <h1 style="font-family:Montserrat,sans-serif;font-size:20px;font-weight:700;color:#F5F3EF;margin:0 0 12px;">Restablece tu contraseña</h1>
      <p style="font-size:14px;color:rgba(245,243,239,0.5);line-height:1.6;margin:0 0 24px;">Recibimos una solicitud para restablecer tu contraseña en Tonaris. Haz clic en el botón de abajo para continuar.</p>
      <table role="presentation" style="width:100%;">
        <tr><td style="text-align:center;">
          <a href="${resetLink}" style="display:inline-block;padding:12px 28px;background:#5B2A45;color:#fff;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">Restablecer contraseña</a>
        </td></tr>
      </table>
      <p style="font-size:12px;color:rgba(245,243,239,0.25);line-height:1.5;margin:24px 0 0;">Si no solicitaste este cambio, ignora este mensaje. El enlace expira en 1 hora.</p>
    </td></tr>
    <tr><td style="text-align:center;padding-top:16px;">
      <p style="font-size:11px;color:rgba(245,243,239,0.15);margin:0;">Tonaris por ABARCAR Audio</p>
    </td></tr>
  </table>
</body>
</html>`,
    });

    logger.info({ email }, 'Email de recuperación enviado exitosamente');
  } catch (err) {
    logger.error(err, `Error al enviar email de recuperación a ${email}`);
    throw err;
  }
}

module.exports = { sendPasswordResetEmail };
