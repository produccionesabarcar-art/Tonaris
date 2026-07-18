function generateUserId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `usr_${result}`
}

export async function registerUser({ nombre, institucion, correo, contrasena }) {
  const user_id = generateUserId()
  const payload = {
    name: nombre,
    email: correo,
    password: contrasena,
    institution: institucion,
    role: 'estudiante',
    user_id,
  }

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  const url = isDev
    ? '/api/users/register'
    : 'https://tonaris.onrender.com/api/users/register'

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Error de conexión. Intenta de nuevo.')
  }

  if (!res.ok) {
    let data
    try {
      data = await res.json()
    } catch {
      throw new Error('Error de conexión. Intenta de nuevo.')
    }
    if (res.status === 429) {
      throw new Error('Demasiados intentos. Intenta en 15 minutos.')
    }
    const msg = data.error || data.message
    throw new Error(msg || 'Error al registrarse. Intenta de nuevo.')
  }

  return res.json()
}
