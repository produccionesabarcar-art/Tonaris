import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import SeleccionDeGuiaPage from './pages/SeleccionDeGuiaPage'
import MenuPage from './pages/MenuPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/seleccionar-guia" element={<SeleccionDeGuiaPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/dashboard" element={<MenuPage />} />
      <Route path="/aventura" element={<div className="text-white text-center mt-20 text-2xl">Aventura (Próximamente)</div>} />
      <Route path="/entrenamiento" element={<div className="text-white text-center mt-20 text-2xl">Entrenamiento (Próximamente)</div>} />
      <Route path="/clasificacion" element={<div className="text-white text-center mt-20 text-2xl">Clasificación (Próximamente)</div>} />
      <Route path="/refugio" element={<div className="text-white text-center mt-20 text-2xl">Refugio (Próximamente)</div>} />
      <Route path="/tienda" element={<div className="text-white text-center mt-20 text-2xl">Tienda (Próximamente)</div>} />
    </Routes>
  )
}
