import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4" style={{ backgroundColor: '#2C3E50' }}>
      <div className="relative w-full" style={{ maxWidth: '900px' }}>
        <img
          src="/LandingPage.png"
          alt="Tonaris Kids Landing Page"
          className="w-full h-auto block"
          draggable={false}
        />

        <button
          onClick={() => navigate('/register')}
          style={{
            position: 'absolute',
            top: '65%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '25%',
            height: '9%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
          }}
          aria-label="INSCRÍBETE"
        />

        <button
          onClick={() => navigate('/login')}
          style={{
            position: 'absolute',
            top: '78%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '25%',
            height: '9%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
          }}
          aria-label="INGRESA"
        />
      </div>
    </div>
  )
}
