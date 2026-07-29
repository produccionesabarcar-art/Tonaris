import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

export default function MenuPage() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(2)

  const cards = [
    { name: 'Entrenamiento', img: '/CardEntrenamiento.png', route: '/entrenamiento' },
    { name: 'Clasificación', img: '/CardClasificacion.png', route: '/clasificacion' },
    { name: 'Aventura', img: '/CardAventura.png', route: '/aventura' },
    { name: 'Refugio', img: '/CardRefugio.png', route: '/refugio' },
    { name: 'Tienda', img: '/CardTienda.png', route: '/tienda' },
  ]

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#2C3E50' }}>
      <img
        src="/TonarisMenu.png"
        alt="Tonaris Kids Menu"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={5}
          spaceBetween={20}
          initialSlide={2}
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: false,
          }}
          keyboard={{ enabled: true }}
          mousewheel={{ thresholdDelta: 50 }}
          modules={[EffectCoverflow, Keyboard, Mousewheel]}
          className="w-full h-full"
          style={{ paddingTop: '150px', paddingBottom: '20px' }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index} className="flex items-center justify-center">
              <div
                className={`relative transition-all duration-300 ${
                  index === activeIndex ? 'cursor-pointer scale-110' : 'cursor-default opacity-90'
                }`}
                style={{
                  width: '240px',   // 👈 CAMBIA ESTE NÚMERO para el ancho
                  height: '320px',  // 👈 CAMBIA ESTE NÚMERO para el alto
                  border: '0px solid red',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                }}
                onClick={() => index === activeIndex && navigate(card.route)}
              >
                <img
                  src={card.img}
                  alt={card.name}
                  className="w-full h-full object-contain drop-shadow-[0_15px_12px_rgba(0,0,0,0.45)]"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 5,
            background: 'linear-gradient(to right, #2C3E50 0%, transparent 15%, transparent 85%, #2C3E50 100%)',
          }}
        />
      </div>
    </div>
  )
}
