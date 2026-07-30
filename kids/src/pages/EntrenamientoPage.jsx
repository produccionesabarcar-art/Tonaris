import { useNavigate } from 'react-router-dom'

export default function EntrenamientoPage() {
  const navigate = useNavigate()

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#1a3a2a' }}>
      <img
        src="/Entrenamiento.png"
        alt="Entrenamiento Tonaris Kids"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Entrenamiento</h1>
          <p className="text-xl">Área de práctica y ejercicios</p>
          <p className="text-sm mt-4 opacity-70">(Próximamente: juegos, lecciones y actividades)</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/menu')}
        className="absolute top-6 left-6 z-50 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: '18px',
        }}
      >
        <span>&larr;</span> Volver al Menú
      </button>
    </div>
  )
}
