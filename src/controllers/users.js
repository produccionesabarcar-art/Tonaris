const pool = require('../db/pool');

/**
 * Registra un nuevo usuario.
 * POST /api/users/register
 */
async function registerUser(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son requeridos.' });
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }

    const userId = Date.now().toString();
    const result = await pool.query(
      'INSERT INTO users (user_id, name, email) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[registerUser]', err.message);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
}

/**
 * Obtiene el perfil de un usuario por su ID.
 * GET /api/users/:userId
 */
async function getUserById(req, res) {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getUserById]', err.message);
    res.status(500).json({ error: 'Error al obtener usuario.' });
  }
}

module.exports = { registerUser, getUserById };