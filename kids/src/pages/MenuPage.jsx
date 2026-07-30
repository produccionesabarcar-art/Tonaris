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
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#0d2818' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/TonarisMenu.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          loop={true}
          slidesPerView={3}
          spaceBetween={30}
          initialSlide={2}
          preventClicks={false}
          preventClicksPropagation={false}
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
                className="relative transition-all duration-300 cursor-pointer hover:scale-105"
                style={{
                  width: '240px',
                  height: '320px',
                }}
                onClick={() => navigate(card.route)}
              >
                <img
                  src={card.img}
                  alt={card.name}
                  className="w-full h-full object-contain drop-shadow-[0_15px_12px_rgba(0,0,0,0.45)]"
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm font-bold px-3 py-1 rounded whitespace-nowrap border border-white/20">
                  {card.name}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
