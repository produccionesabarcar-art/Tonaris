# Instrucciones para Agentes — Tonaris Kids

Instrucciones específicas para trabajar en el frontend `kids/` (React + Vite + Tailwind).

---

## Stack

| Herramienta | Uso |
|-------------|-----|
| React 19 | UI framework |
| Vite 6 | Bundler + dev server |
| Tailwind CSS 4 | Estilos utilitarios |
| Swiper.js 14 | Carrusel 3D (Coverflow effect) |
| react-router-dom 7 | Enrutamiento SPA |

## Convenciones de código Kids

### Posicionamiento
- **Todos los inputs y botones** usan `position: absolute` sobre imágenes de fondo
- Los puntos de referencia son porcentajes (`top`, `left`) relativos al contenedor de la imagen
- Cada página tiene un contenedor `max-width: 900px` centrado
- Fondo global de páginas: `#2C3E50`

### Transparencia
- Inputs: `backgroundColor: transparent`, `border: none`, `outline: none`
- Botones: `backgroundColor: transparent` o `rgba(255,0,0,0.1)` (debug), `border: none`
- NO usar bordes visibles, sombras de input, o estilos de formulario tradicionales

### Responsive
- Hook `useMobile(breakpoint = 768)` para detectar mobile
- Desktop y mobile tienen posiciones diferentes definidas por campo
- Mobile: inputs ocupan `width: 90%`, apilados verticalmente

### Imágenes
- Todas en `public/`, referenciadas como `/Nombre.png`
- Las imágenes son el "layout" real — los inputs se posicionan encima
- Usar `draggable={false}` para evitar arrastrar imágenes

### Swiper (carrusel 3D)
- Efecto `coverflow` con `rotate: 15`, `depth: 150`, `modifier: 1.5`
- `slidesPerView: 5`, `centeredSlides: true`
- Módulos: `EffectCoverflow`, `Keyboard`, `Mousewheel`
- Fade lateral con `linear-gradient` sobre las orillas

### API calls
- `api/client.js` exporta `registerUser()` que auto-detecta entorno
- Desarrollo: usa proxy Vite (peticiones a `/api/...`)
- Producción: apunta a `https://tonaris.onrender.com/api/...`
- Las páginas pueden hacer fetch directo (como `LoginPage` y `ForgotPasswordPage` hacen)

### Token management
- Token guardado en `localStorage` como `tonaris_token`
- Usuario guardado como `tonaris_user` (JSON)
- Ambos se limpian al cerrar sesión (si se implementa)

## Reglas específicas Kids

1. **No romper el posicionamiento absoluto** — cualquier cambio en un formulario debe mantener las coordenadas que alinean los inputs con las imágenes de fondo
2. **No cambiar imágenes de fondo sin permiso** — son diseñadas específicamente para que los inputs calcen exactamente
3. **Mantener la transparencia** — inputs y botones deben ser visualmente invisibles sobre la imagen (el diseño visual está en la imagen PNG)
4. **Usar el hook `useMobile` existente** — no crear lógica responsive separada
5. **Swiper config** existente no debe modificarse sin probar visualmente en mobile y desktop

## Dependencias prohibidas

No instalar sin preguntar:
- Librerías de UI (Material UI, Chakra, etc.) — el diseño está basado en imágenes
- Librerías de formularios (Formik, React Hook Form) — la validación es manual
- Librerías de animación (Framer Motion) — Swiper ya maneja animaciones 3D
- Otras librerías de carrusel — Swiper está configurado y funcionando

## Nota sobre producción

`LoginPage.jsx` y `ForgotPasswordPage.jsx` usan fetch relativo (`/api/users/...`). En desarrollo esto funciona vía proxy de Vite (`vite.config.js`). En producción, estos fetchs se resolverían contra el mismo dominio del frontend — actualizar para que apunten a `https://tonaris.onrender.com/api/...` cuando no estén en localhost.

## Archivos sensibles en kids/

| Archivo | Riesgo |
|---------|--------|
| `src/pages/LoginPage.jsx` | Fetch directo, cambiar la URL rompe login |
| `src/pages/MenuPage.jsx` | Configuración Swiper, cambiar afecta UX en mobile |
| `src/components/RegisterForm.jsx` | Posicionamiento de 4 campos, cambiar desalinea con imagen |
| `src/api/client.js` | URLs de API, cambiar rompe registro |

## Cómo agregar una página nueva

1. Crear `src/pages/NuevaPagina.jsx` con el patrón de imagen + posicionamiento absoluto
2. Agregar ruta en `src/App.jsx`
3. Si necesita assets, ponerlos en `public/`
4. Si necesita API, usar fetch directo o agregar función en `api/client.js`

*Documento actualizado al 23/07/2026.*