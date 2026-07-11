const pool = require('../db/pool');
const logger = require('../lib/logger');

/**
 * Guarda el resultado de una sesión de práctica.
 * POST /api/sessions
 */
async function createSession(req, res) {
  const { userId, tonality, correct, total, duration } = req.body;

  if (!userId || !tonality || correct === undefined || !total || !duration) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const sessionId = Date.now().toString();
    const accuracy = Math.round((correct / total) * 100);

    const result = await pool.query(
      `INSERT INTO sessions (session_id, user_id, tonality, correct, total, duration, accuracy)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sessionId, userId, tonality, correct, total, duration, accuracy]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error(err, '[createSession]');
    res.status(500).json({ error: 'Error al guardar sesión.' });
  }
}

/**
 * Obtiene todas las sesiones de un usuario.
 * GET /api/sessions/:userId
 */
async function getSessionsByUser(req, res) {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    logger.error(err, '[getSessionsByUser]');
    res.status(500).json({ error: 'Error al obtener sesiones.' });
  }
}

module.exports = { createSession, getSessionsByUser };