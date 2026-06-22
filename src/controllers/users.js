// Almacenamiento temporal en memoria — se reemplaza con DB en Etapa 2
const users = [];

/**
 * Registra un nuevo usuario.
 * POST /api/users/register
 */
function registerUser(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son requeridos.' });
  }

  const alreadyExists = users.find(u => u.email === email);
  if (alreadyExists) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
  }

  const newUser = {
    userId: Date.now().toString(),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  res.status(201).json(newUser);
}

/**
 * Obtiene el perfil de un usuario por su ID.
 * GET /api/users/:userId
 */
function getUserById(req, res) {
  const { userId } = req.params;
  const user = users.find(u => u.userId === userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json(user);
}

module.exports = { registerUser, getUserById };