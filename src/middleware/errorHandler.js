const logger = require('../lib/logger');

/**
 * Middleware global de manejo de errores.
 * Debe registrarse al final de todos los middlewares en app.js
 */
function errorHandler(err, req, res, next) {
  logger.error(err, `[ERROR] ${req.method} ${req.path}`);

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'Error interno del servidor.' : (err.message || 'Error interno del servidor.');

  res.status(status).json({ error: message });
}

module.exports = errorHandler;