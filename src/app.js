const dotenv = require('dotenv');
dotenv.config();

const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN_BACKEND) {
  Sentry.init({ dsn: process.env.SENTRY_DSN_BACKEND });
}

const express = require('express');
const helmet = require('helmet');
const logger = require('./lib/logger');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { runMigrations } = require('./db/migrations/migrationRunner');
const pool = require('./db/pool');

const app = express();

// Middlewares globales
app.use(cors);
app.use(helmet());
app.use(express.json());

// Rutas
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');
const progressRouter = require('./routes/progress');
const analyticsRouter = require('./routes/analytics');

app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'Tonaris API' });
});

// Manejo de errores — siempre al final
if (process.env.SENTRY_DSN_BACKEND) {
  Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
let server;

if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', async () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    await runMigrations().catch(err => {
      logger.error(err, 'Migraciones fallidas');
      process.exit(1);
    });
  });

  server.on('error', (err) => {
    logger.error(err, 'Error al iniciar servidor');
  });
}

function shutdown(signal) {
  return () => {
    logger.info(`${signal} recibido. Cerrando servidor y pool de BD...`);
    if (server) {
      server.close(() => {
        pool.end(() => {
          logger.info('Pool de BD cerrado. Proceso terminado.');
          process.exit(0);
        });
      });
    } else {
      pool.end(() => process.exit(0));
    }
  };
}

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

module.exports = app;