import { useState } from 'react'
import RegisterForm from '../components/RegisterForm'
import { registerUser } from '../api/client'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await registerUser(formData)
      localStorage.setItem('tonaris_token', token)
      localStorage.setItem('tonaris_user', JSON.stringify(user))
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="bg-parchment rounded-xl p-5 md:p-10 shadow-lg w-full text-center"
          style={{ maxWidth: '900px' }}
        >
          <div className="text-6xl mb-6" aria-hidden="true">🎉</div>
          <h1
            className="font-fredoka text-3xl md:text-4xl mb-4"
            style={{ color: '#1E3A5F' }}
          >
            ¡Registro exitoso!
          </h1>
          <p className="text-xl md:text-2xl" style={{ color: '#2C3E50' }}>
            Bienvenido a la aventura musical.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  )
}
