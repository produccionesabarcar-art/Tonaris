import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import SeleccionDeGuiaPage from './pages/SeleccionDeGuiaPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/seleccionar-guia" element={<SeleccionDeGuiaPage />} />
      <Route path="/dashboard" element={<div>Menú Principal (Próximamente)</div>} />
    </Routes>
  )
}
