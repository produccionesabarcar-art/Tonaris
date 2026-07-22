import { useNavigate } from 'react-router-dom'

export default function SeleccionDeGuiaPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2C3E50' }}>
      <div className="relative w-full" style={{ maxWidth: '900px' }}>
        <img
          src="/SeleccionDeGuia.png"
          alt="Selecciona tu guía"
          className="w-full h-auto block"
          draggable={false}
        />

        <button
          type="button"
          style={{
            position: 'absolute',
            top: '79%',
            left: '17%',
            width: '29%',
            height: '10%',
            border: '0px solid red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            cursor: 'pointer',
            borderRadius: '8px',
          }}
          onClick={() => {
            console.log("Guía Julieta seleccionada")
            navigate('/dashboard')
          }}
          aria-label="JULIETA"
        />

        <button
          type="button"
          style={{
            position: 'absolute',
            top: '79%',
            right: '18%',
            width: '28%',
            height: '10%',
            border: '0px solid red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            cursor: 'pointer',
            borderRadius: '8px',
          }}
          onClick={() => {
            console.log("Guía Martín seleccionado")
            navigate('/dashboard')
          }}
          aria-label="MARTÍN"
        />
      </div>
    </div>
  )
}
