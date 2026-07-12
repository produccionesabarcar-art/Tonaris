/**
 * Middleware de CORS.
 * Permite que el frontend de Tonaris se comunique con la API.
 */
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:5173',
  'https://abarcaraudio.netlify.app',
];

function cors(req, res, next) {
  const origin = req.headers['origin'];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    return res.status(403).json({ error: 'Origen no autorizado.' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

module.exports = cors;
