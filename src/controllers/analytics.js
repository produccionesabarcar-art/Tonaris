const pool = require('../db/pool');

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
    const query = `
      SELECT DATE(created_at) as day
      FROM sessions
      WHERE user_id = $1
      GROUP BY DATE(created_at)
      ORDER BY day DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json(successResponse(result.rows));
  } catch (error) {
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
        COUNT(session_id) as total_sessions,
        AVG(accuracy) as avg_accuracy,
        MAX(accuracy) as best_score
      FROM exercise_results
      JOIN sessions ON exercise_results.session_id = sessions.session_id
      WHERE exercise_results.user_id = $1
        AND sessions.user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json(successResponse(result.rows[0]));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

async function getLeaderboard(req, res) {
  try {
    const query = `
      SELECT
        u.user_id,
        u.name,
        COUNT(s.session_id) as total_sessions,
        ROUND(AVG(s.accuracy)) as avg_accuracy
      FROM users u
      LEFT JOIN sessions s ON u.user_id = s.user_id
      WHERE u.role = 'estudiante'
      GROUP BY u.user_id, u.name
      ORDER BY avg_accuracy DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.status(200).json(successResponse(result.rows));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
}

module.exports = {
  getStreak,
  getHistory,
  getIntervals,
  getSummary,
  getLeaderboard
};