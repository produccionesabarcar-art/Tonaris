const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const logger = require('./lib/logger');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { runMigrations } = require('./db/migrations/migrationRunner');

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
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  await runMigrations().catch(err => {
    logger.error(err, 'Migraciones fallidas');
    process.exit(1);
  });
});

server.on('error', (err) => {
  logger.error(err, 'Error al iniciar servidor');
});

module.exports = app;