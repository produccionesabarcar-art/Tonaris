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
  const resetLink = `https://abarcaraudio.netlify.app/reset-password?token=${resetToken}`;

  try {
    await getResend().emails.send({
      from: 'Tonaris <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperación de contraseña - Tonaris',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
    });

    logger.info({ email }, 'Email de recuperación enviado exitosamente');
  } catch (err) {
    logger.error(err, `Error al enviar email de recuperación a ${email}`);
    throw err;
  }
}

module.exports = { sendPasswordResetEmail };
