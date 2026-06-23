const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

// POST /api/users/register
async function register(req, res, next) {
  try {
    const { user_id, name, email, password, role } = req.body;

    if (!user_id || !name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = role === 'admin' ? 'admin' : 'estudiante';

    const { rows } = await pool.query(
      `INSERT INTO users (user_id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, role, created_at`,
      [user_id, name, email, hashedPassword, userRole]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }
    next(err);
  }
}

// POST /api/users/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:userId
async function getById(req, res, next) {
  try {
    const { userId } = req.params;

    const { rows } = await pool.query(
      'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}


// GET /api/users/all
async function getAll(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
module.exports = { register, login, getById, getAll };