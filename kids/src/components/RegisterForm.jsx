import { useState, useEffect } from 'react'

function useMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return mobile
}

const FIELDS = [
  {
    name: 'nombre',
    placeholder: 'Escribe tu nombre aqu\u00ED...',
    desktopPos: { top: '40.8%', left: '21.85%', width: '26%' },
    mobilePos: { top: '36%', left: '5%', width: '90%' },
    validate: (v) => {
      if (!v || !v.trim()) return 'El nombre es requerido'
      if (v.length < 3) return 'M\u00EDnimo 3 caracteres'
      return null
    },
  },
  {
    name: 'institucion',
    placeholder: 'Tu escuela o academia...',
    desktopPos: { top: '40.8%', right: '16.15%', width: '26%' },
    mobilePos: { top: '46%', left: '5%', width: '90%' },
    validate: (v) => {
      if (!v || !v.trim()) return 'La instituci\u00F3n es requerida'
      if (v.length < 3) return 'M\u00EDnimo 3 caracteres'
      return null
    },
  },
  {
    name: 'correo',
    placeholder: 'Tu correo o el de tu tutor...',
    desktopPos: { top: '56%', left: '21.85%', width: '26%' },
    mobilePos: { top: '56%', left: '5%', width: '90%' },
    validate: (v) => {
      if (!v || !v.trim()) return 'El correo es requerido'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Correo electr\u00F3nico inv\u00E1lido'
      return null
    },
  },
  {
    name: 'contrasena',
    placeholder: 'Crea tu clave secreta...',
    desktopPos: { top: '56%', right: '16.15%', width: '26%' },
    mobilePos: { top: '66%', left: '5%', width: '90%' },
    validate: (v) => {
      if (!v) return 'La contrase\u00F1a es requerida'
      if (v.length < 8) return 'M\u00EDnimo 8 caracteres'
      return null
    },
  },
]

export default function RegisterForm({ onSubmit, loading, error }) {
  const mobile = useMobile()
  const [formData, setFormData] = useState({
    nombre: '',
    institucion: '',
    correo: '',
    contrasena: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = {}
    for (const field of FIELDS) {
      const msg = field.validate(formData[field.name])
      if (msg) errors[field.name] = msg
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length === 0) {
      onSubmit({ ...formData })
    }
  }

  const pos = (field) => (mobile ? field.mobilePos : field.desktopPos)

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4" style={{ backgroundColor: '#2C3E50' }}>
      <div className="relative w-full" style={{ maxWidth: '900px' }}>
        <img
          src="/PaseDeEntrada.png?v=4"
          alt="Tonaris Kids Pase de Abordaje"
          className="w-full h-auto block"
          draggable={false}
        />

        {error && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white text-sm md:text-base px-4 py-2 rounded-lg shadow-lg"
            style={{ top: mobile ? '4%' : '6%' }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="absolute inset-0">
          {FIELDS.map((field) => {
            const p = pos(field)
            return (
              <div
                key={field.name}
                className="absolute"
                style={{
                  top: p.top,
                  left: p.left,
                  right: p.right,
                  width: p.width,
                }}
              >
                <input
                  type={field.name === 'contrasena' ? 'password' : field.name === 'correo' ? 'email' : 'text'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  aria-label={field.name}
                  aria-invalid={!!fieldErrors[field.name]}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#2C3E50',
                    fontSize: mobile ? '14px' : '20px',
                    fontWeight: '600',
                    fontFamily: "'Nunito', sans-serif",
                    padding: '8px 12px',
                  }}
                  className="placeholder:text-gray-600 placeholder:italic placeholder:opacity-70"
                />
                {fieldErrors[field.name] && (
                  <p className="text-red-500 text-xs mt-1 font-semibold" role="alert">
                    {fieldErrors[field.name]}
                  </p>
                )}
              </div>
            )
          })}
        </form>
      </div>
    </div>
  )
}
