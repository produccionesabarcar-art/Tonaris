import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: 'url(/LandingPage.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
  )
}
