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
      console.log('Response status:', res.status)
      if (!res.ok) {
        const text = await res.text()
        let errMsg
        try {
          const data = JSON.parse(text)
          errMsg = data.error || data.message || `Error ${res.status}`
        } catch {
          errMsg = text || `Error del servidor (${res.status})`
        }
        throw new Error(errMsg)
      }
      const data = await res.json()
      console.log('Response data:', data)
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

        <div className="absolute inset-0 px-4">
          {error && (
            <div
              className="bg-red-500 text-white text-sm md:text-base px-4 py-2 rounded-lg shadow-lg text-center"
              role="alert"
              style={{
                position: 'absolute',
                top: '32%',
                left: '22%',
                width: '56%',
              }}
            >
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              position: 'absolute',
              top: '45%',
              left: '31.5%',
              width: '45%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#2C3E50',
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: "'Nunito', sans-serif",
              padding: '8px 12px',
            }}
            className="placeholder:text-gray-600 placeholder:italic placeholder:opacity-70"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              position: 'absolute',
              top: '58.5%',
              left: '31.5%',
              width: '45%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#2C3E50',
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: "'Nunito', sans-serif",
              padding: '8px 12px',
            }}
            className="placeholder:text-gray-600 placeholder:italic placeholder:opacity-70"
          />

          <Link
            to="/forgot-password"
            style={{
              position: 'absolute',
              top: '68%',
              left: '50.5%',
              transform: 'translateX(-50%)',
              opacity: 0,
              pointerEvents: 'auto',
              color: '#1E3A5F',
              fontWeight: '600',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 40px',
              backgroundColor: 'transparent',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '16px',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            onClick={handleLogin}
            style={{
              position: 'absolute',
              top: '75%',
              left: '33.5%',
              width: '34%',
              height: '60px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
            }}
            aria-label="Entrar"
          />
        </div>
      </div>
    </div>
  )
}
