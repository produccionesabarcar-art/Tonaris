import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import { registerUser } from '../api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await registerUser(formData)
      localStorage.setItem('tonaris_token', token)
      localStorage.setItem('tonaris_user', JSON.stringify(user))
      navigate('/seleccionar-guia')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  )
}
