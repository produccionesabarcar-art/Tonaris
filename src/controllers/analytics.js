const pool = require('../db/pool');
const logger = require('../lib/logger');

// Estructura para respuestas
function successResponse(data) {
  return { status: 200, data };
}

function errorResponse(message) {
  return { status: 500, error: message };
}

// Funciones de controlador
async function getStreak(req, res) {
  try {
    const { userId } = req.params;

    const sessionQuery = `
      SELECT DISTINCT TO_CHAR(created_at, 'YYYY-MM-DD') as day
      FROM sessions
      WHERE user_id = $1
      ORDER BY day DESC;
    `;
    const sessionResult = await pool.query(sessionQuery, [userId]);

    const userQuery = `
      SELECT freezes_available, daily_goal
      FROM users
      WHERE user_id = $1;
    `;
    const userResult = await pool.query(userQuery, [userId]);

    const user = userResult.rows[0] || { freezes_available: 0, daily_goal: 1 };

    const days = sessionResult.rows.map(r => r.day);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    let usedFreezeToday = false;
    if (!days.includes(today) && Number(user.freezes_available) > 0) {
      const yd = new Date(now.getTime() - 86400000);
      const yesterday = `${yd.getFullYear()}-${pad(yd.getMonth() + 1)}-${pad(yd.getDate())}`;
      if (days.includes(yesterday)) {
        usedFreezeToday = true;
      }
    }

    res.status(200).json({
      ...successResponse(sessionResult.rows),
      freezes_available: Number(user.freezes_available),
      daily_goal: Number(user.daily_goal || 1),
      used_freeze_today: usedFreezeToday
    });
  } catch (error) {
    logger.error(error, '[getStreak]');
    res.status(500).json(errorResponse(error.message));
  }
}

async function getHistory(req, res) {
  try {
    const { userId } = req.params;
    const query = `
      SELECT
        session_id,
        accuracy,
        tonality,
        correct,
        total,
        duration,
        created_at
      FROM sessions
      WHERE user_id = $1
      ORDER BY created_at ASC
      LIMIT 30;
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json(successResponse(result.rows));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

async function getIntervals(req, res) {
  try {
    const { userId } = req.params;
    const query = `
      SELECT
        interval,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
        ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as accuracy
      FROM exercise_results
      WHERE user_id = $1
      GROUP BY interval
      ORDER BY accuracy ASC;
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json(successResponse(result.rows));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

async function getSummary(req, res) {
  try {
    const { userId } = req.params;
    const query = `
      SELECT
        COUNT(*) as total_sessions,
        ROUND(AVG(accuracy)) as avg_accuracy,
        MAX(accuracy) as best_score
      FROM sessions
      WHERE user_id = $1;
    `;
    const result = await pool.query(query, [userId]);

    const userResult = await pool.query(
      'SELECT rank FROM users WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({
      ...successResponse(result.rows[0]),
      rank: userResult.rows[0]?.rank || 'Oyente'
    });
  } catch (error) {
    logger.error(error, '[getSummary]');
    res.status(500).json(errorResponse(error.message));
  }
}

async function getLeaderboard(req, res) {
  try {
    const query = `
      SELECT
        u.user_id,
        u.name,
        u.institution,
        COUNT(s.session_id) as total_sessions,
        ROUND(AVG(s.accuracy)) as avg_accuracy
      FROM users u
      LEFT JOIN sessions s ON u.user_id = s.user_id
      WHERE u.role = 'estudiante'
      GROUP BY u.user_id, u.name, u.institution
      ORDER BY avg_accuracy DESC
      LIMIT 20;
    `;
    const result = await pool.query(query);
    res.status(200).json(successResponse(result.rows));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

async function getTrend(req, res) {
  try {
    const { userId, skillId } = req.params;

    const query = `
      SELECT
        'last_7d' as period,
        COUNT(*)::int as total,
        ROUND(COALESCE(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END), 0)) as accuracy,
        ROUND(COALESCE(AVG(response_ms), 0))::int as avg_ms
      FROM exercise_results
      WHERE user_id = $1 AND interval = $2
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      UNION ALL
      SELECT
        'prev_7d' as period,
        COUNT(*)::int as total,
        ROUND(COALESCE(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END), 0)) as accuracy,
        ROUND(COALESCE(AVG(response_ms), 0))::int as avg_ms
      FROM exercise_results
      WHERE user_id = $1 AND interval = $2
        AND created_at >= CURRENT_DATE - INTERVAL '14 days'
        AND created_at < CURRENT_DATE - INTERVAL '7 days';
    `;

    const result = await pool.query(query, [userId, skillId]);

    const last = result.rows.find(r => r.period === 'last_7d') || {};
    const prev = result.rows.find(r => r.period === 'prev_7d') || {};

    res.status(200).json({
      status: 200,
      data: {
        skillId,
        accuracy_last_7d: last.accuracy ?? 0,
        accuracy_prev_7d: prev.accuracy ?? 0,
        avg_ms_last_7d: last.avg_ms ?? 0,
        avg_ms_prev_7d: prev.avg_ms ?? 0
      }
    });
  } catch (error) {
    logger.error(error, '[getTrend]');
    res.status(500).json(errorResponse(error.message));
  }
}

async function getMastery(req, res) {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM skill_mastery WHERE user_id = $1 ORDER BY skill_id',
      [userId]
    );
    res.status(200).json(successResponse(result.rows));
  } catch (error) {
    logger.error(error, '[getMastery]');
    res.status(500).json(errorResponse(error.message));
  }
}

async function updateDailyGoal(req, res) {
  try {
    const { userId } = req.params;
    const { dailyGoal } = req.body;

    if (dailyGoal === undefined || !Number.isInteger(dailyGoal) || dailyGoal < 1) {
      return res.status(400).json({ error: 'dailyGoal debe ser un entero positivo.' });
    }

    if (req.user.user_id !== userId) {
      return res.status(403).json({ error: 'No puedes modificar la meta de otro usuario.' });
    }

    const result = await pool.query(
      'UPDATE users SET daily_goal = $1 WHERE user_id = $2 RETURNING user_id, daily_goal',
      [dailyGoal, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({ status: 200, data: result.rows[0] });
  } catch (error) {
    logger.error(error, '[updateDailyGoal]');
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getStreak,
  getHistory,
  getIntervals,
  getSummary,
  getLeaderboard,
  getTrend,
  getMastery,
  updateDailyGoal
};