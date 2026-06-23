const express = require('express');
const dotenv = require('dotenv');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;