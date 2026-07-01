const logger = require('../lib/logger');

/**
 * Middleware global de manejo de errores.
 * Debe registrarse al final de todos los middlewares en app.js
 */
function errorHandler(err, req, res, next) {
  logger.error(err, `[ERROR] ${req.method} ${req.path}`);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;