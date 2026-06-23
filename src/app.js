const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { runMigrations } = require('./db/migrations/migrationRunner');

const app = express();

// Middlewares globales
app.use(cors);
app.use(express.json());

// Rutas
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');
const progressRouter = require('./routes/progress');

app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/progress', progressRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'Tonaris API' });
});

// Manejo de errores — siempre al final
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await runMigrations().catch(err => {
    console.error('Migraciones fallidas:', err.message);
    process.exit(1);
  });
});

server.on('error', (err) => {
  console.error('Error al iniciar servidor:', err.message);
});

module.exports = app;