const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const sessionsRouter = require('./routes/sessions');
app.use('/api/sessions', sessionsRouter);

const progressRouter = require('./routes/progress');
app.use('/api/progress', progressRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'Tonaris API' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;