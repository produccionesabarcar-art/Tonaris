const pool = require('../db/pool');
const logger = require('../lib/logger');
const { getRankFromMasteredCount } = require('../lib/ranks');

/**
 * Guarda el resultado de una sesión de práctica.
 * POST /api/sessions
 */
async function createSession(req, res) {
  const { userId, tonality, correct, total, duration, results } = req.body;

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

    if (results && results.length > 0) {
      const touchedSkills = new Set();

      for (let i = 0; i < results.length; i++) {
        const { interval, is_correct, response_ms } = results[i];
        const resultId = `${sessionId}-${i}`;
        await pool.query(
          `INSERT INTO exercise_results (result_id, session_id, user_id, interval, is_correct, response_ms)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [resultId, sessionId, userId, interval, is_correct, response_ms]
        );
        touchedSkills.add(interval);
      }

      for (const skillId of touchedSkills) {
        const stats = await pool.query(
          `SELECT
             COUNT(*)::int as total,
             ROUND(COALESCE(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END), 0)) as accuracy,
             ROUND(COALESCE(AVG(response_ms), 0))::int as avg_ms
           FROM exercise_results
           WHERE user_id = $1 AND interval = $2
             AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
          [userId, skillId]
        );

        const { total: attemptCount, accuracy: acc7d, avg_ms } = stats.rows[0];

        let mastery;
        if (acc7d >= 90 && attemptCount >= 20) {
          mastery = 'mastered';
        } else if (acc7d >= 70) {
          mastery = 'stable';
        } else if (acc7d >= 40) {
          mastery = 'learning';
        } else {
          mastery = 'unknown';
        }

        await pool.query(
          `INSERT INTO skill_mastery (user_id, skill_id, mastery, accuracy_7d, avg_ms_7d, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (user_id, skill_id)
           DO UPDATE SET
             mastery = EXCLUDED.mastery,
             accuracy_7d = EXCLUDED.accuracy_7d,
             avg_ms_7d = EXCLUDED.avg_ms_7d,
             updated_at = NOW()`,
          [userId, skillId, mastery, acc7d, avg_ms]
        );
      }

      // Update rank based on mastered skills
      const masteredResult = await pool.query(
        `SELECT COUNT(*)::int as cnt FROM skill_mastery
         WHERE user_id = $1 AND mastery = 'mastered'`,
        [userId]
      );
      const newRank = getRankFromMasteredCount(masteredResult.rows[0].cnt);
      await pool.query(
        'UPDATE users SET rank = $1 WHERE user_id = $2 AND rank != $1',
        [newRank, userId]
      );
    }

    // Grant freeze on 7-day streak milestone
    const streakCheck = await pool.query(
      `SELECT DISTINCT TO_CHAR(created_at, 'YYYY-MM-DD') as day
       FROM sessions
       WHERE user_id = $1
       ORDER BY day DESC`,
      [userId]
    );

    const sDays = streakCheck.rows.map(r => r.day);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const userRow = await pool.query(
      'SELECT freezes_available FROM users WHERE user_id = $1',
      [userId]
    );
    const freezesAvail = Number(userRow.rows[0]?.freezes_available ?? 0);

    const todaySessionCount = sDays.filter(d => d === today).length;
    if (todaySessionCount === 1) {
      let streakDays = 0;
      for (let i = 0; ; i++) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        if (sDays.includes(dateStr)) {
          streakDays++;
        } else {
          break;
        }
      }

      if (streakDays > 0 && streakDays % 7 === 0 && freezesAvail < 2) {
        await pool.query(
          'UPDATE users SET freezes_available = LEAST(freezes_available + 1, 2) WHERE user_id = $1',
          [userId]
        );
        logger.info({ userId, streakDays }, 'Freeze granted for 7-day streak milestone');
      }
    }

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