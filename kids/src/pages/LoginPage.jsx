import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('tonaris_token', data.token)
      localStorage.setItem('tonaris_user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4" style={{ backgroundColor: '#2C3E50' }}>
      <div className="relative w-full" style={{ maxWidth: '900px' }}>
        <img
          src="/BienvenidoDeNuevo.png"
          alt="Tonaris Kids Bienvenido de Nuevo"
          className="w-full h-auto block"
          draggable={false}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="w-full" style={{ maxWidth: '400px' }}>
            {error && (
              <div className="bg-red-500 text-white text-sm md:text-base px-4 py-2 rounded-lg shadow-lg mb-4 text-center" role="alert">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#2C3E50',
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: "'Nunito', sans-serif",
                padding: '8px 12px',
                marginBottom: '16px',
              }}
              className="placeholder:text-gray-600 placeholder:italic placeholder:opacity-70"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#2C3E50',
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: "'Nunito', sans-serif",
                padding: '8px 12px',
                marginBottom: '12px',
              }}
              className="placeholder:text-gray-600 placeholder:italic placeholder:opacity-70"
            />

            <div className="text-center mb-6">
              <Link
                to="#"
                style={{
                  color: '#1E3A5F',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
                onClick={(e) => e.preventDefault()}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleLogin}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '50%',
                  height: '50px',
                }}
                aria-label="Entrar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
