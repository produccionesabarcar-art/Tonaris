/**
 * Middleware global de manejo de errores.
 * Debe registrarse al final de todos los middlewares en app.js
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;