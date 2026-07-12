const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');
const logger = require('../lib/logger');

const SALT_ROUNDS = 10;

// POST /api/users/register
async function register(req, res, next) {
  try {
    const { user_id, name, email, password, role, institution } = req.body;

    if (!user_id || !name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres, un número, una mayúscula y una minúscula' });
    }

    if (password.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ error: 'La contraseña no puede ser igual a tu correo electrónico.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = role === 'admin' ? 'admin' : 'estudiante';

    const { rows } = await pool.query(
      `INSERT INTO users (user_id, name, email, password, role, institution)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, name, email, role, institution, created_at`,
      [user_id, name, email, hashedPassword, userRole, institution || null]
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
// PATCH /api/users/:userId/alias
async function updateAlias(req, res, next) {
  try {
    const { userId } = req.params;
    const { alias } = req.body;
    if (!alias || alias.length > 10) {
      return res.status(400).json({ error: 'Alias requerido, máximo 10 caracteres.' });
    }
    const { rows } = await pool.query(
      'UPDATE users SET alias = $1 WHERE user_id = $2 RETURNING user_id, name, alias',
      [alias.toUpperCase(), userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/users/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es obligatorio.' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [token, expires, email]
      );

      await sendPasswordResetEmail(email, token);
      logger.info({ email }, 'Token de recuperación generado y email enviado');
    }

    res.status(200).json({ status: 200, message: 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Enlace inválido o expirado.' });
    }

    if (newPassword === rows[0].email) {
      return res.status(400).json({ error: 'La contraseña no puede ser igual a tu correo electrónico.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_id = $2',
      [hashedPassword, rows[0].user_id]
    );

    logger.info({ user_id: rows[0].user_id }, 'Contraseña actualizada exitosamente');

    res.status(200).json({ status: 200, message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getById, getAll, updateAlias, forgotPassword, resetPassword };