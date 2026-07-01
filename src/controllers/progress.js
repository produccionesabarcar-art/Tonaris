const pool = require('../db/pool');
const logger = require('../lib/logger');

/**
 * Obtiene el progreso de un usuario.
 * GET /api/progress/:userId
 */
async function getUserProgress(req, res) {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_sessions,
        ROUND(AVG(accuracy)) AS avg_accuracy,
        MAX(accuracy) AS best_accuracy,
        SUM(correct) AS total_correct,
        SUM(total) AS total_questions,
        MAX(created_at) AS last_session
       FROM sessions
       WHERE user_id = $1`,
      [userId]
    );

    const data = result.rows[0];

    if (!data.total_sessions || data.total_sessions === '0') {
      return res.status(404).json({ error: 'No hay sesiones para este usuario.' });
    }

    res.json({
      userId,
      totalSessions: parseInt(data.total_sessions),
      avgAccuracy: parseInt(data.avg_accuracy),
      bestAccuracy: parseInt(data.best_accuracy),
      totalCorrect: parseInt(data.total_correct),
      totalQuestions: parseInt(data.total_questions),
      lastSession: data.last_session
    });
  } catch (err) {
    logger.error(err, '[getUserProgress]');
    res.status(500).json({ error: 'Error al obtener progreso.' });
  }
}

module.exports = { getUserProgress };