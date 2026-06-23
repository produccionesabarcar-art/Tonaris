// Almacenamiento temporal en memoria — se reemplaza con DB en Etapa 2
const sessions = [];

/**
 * Guarda el resultado de una sesión de práctica.
 * POST /api/sessions
 */
function createSession(req, res) {
  const { userId, tonality, correct, total, duration } = req.body;

  if (!userId || !tonality || correct === undefined || !total || !duration) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  const newSession = {
    sessionId: Date.now().toString(),
    userId,
    tonality,
    correct,
    total,
    duration,
    accuracy: Math.round((correct / total) * 100),
    createdAt: new Date().toISOString()
  };

  sessions.push(newSession);
  res.status(201).json(newSession);
}

/**
 * Obtiene todas las sesiones de un usuario.
 * GET /api/sessions/:userId
 */
function getSessionsByUser(req, res) {
  const { userId } = req.params;
  const userSessions = sessions.filter(s => s.userId === userId);
  res.json(userSessions);
}

module.exports = { createSession, getSessionsByUser, sessions };