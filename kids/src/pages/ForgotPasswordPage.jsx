import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
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
      setSuccess('¡Enlace enviado! Revisa tu correo.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4" style={{ backgroundColor: '#2C3E50' }}>
      <div className="relative w-full" style={{ maxWidth: '900px' }}>
        <img
          src="/RecuperacionDeContraseña.png"
          alt="Tonaris Kids Recuperacion de Contraseña"
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
                top: '42%',
                left: '22%',
                width: '56%',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="bg-green-500 text-white text-sm md:text-base px-4 py-2 rounded-lg shadow-lg text-center"
              role="status"
              style={{
                position: 'absolute',
                top: '42%',
                left: '22%',
                width: '56%',
              }}
            >
              {success}
            </div>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              position: 'absolute',
              top: '54%',
              left: '34%',
              width: '38.5%',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '0px solid red',
              borderRadius: '8px',
              outline: 'none',
              color: '#2C3E50',
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: "'Nunito', sans-serif",
              padding: '8px 12px',
            }}
            className="placeholder:text-gray-600 placeholder:italic placeholder:opacity-70"
          />

          <button
            onClick={handleSubmit}
            style={{
              position: 'absolute',
              top: '66%',
              left: '35%',
              width: '30%',
              height: '60px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '0px solid red',
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer',
              color: '#2C3E50',
              fontSize: '0px',
              fontWeight: '600',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            ENVIAR ENLACE
          </button>

          <Link
            to="/login"
            style={{
              position: 'absolute',
              top: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'transparent',
              fontWeight: '600',
              border: '0px solid red',
              borderRadius: '4px',
              padding: '2px 40px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '35px',
              textDecoration: 'none',
              cursor: 'pointer',
              width: '220px',
              height: '80px',
            }}
          >
            Volver
          </Link>
        </div>
      </div>
    </div>
  )
}
