# Tonaris — Entrenamiento Auditivo

Plataforma web de entrenamiento auditivo basada en el círculo de quintas y el sistema pedagógico PAIEM de Abarcar Audio.

**Propietario:** Javier — Abarcar Audio, Bogotá, Colombia.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (local) / Supabase (producción) |
| Auth | bcrypt + JWT |
| Frontend app | Vanilla JS (tonaris/) |
| Frontend kids | React 19 + Vite + Tailwind 4 + Swiper.js 14 (kids/) |
| Panel admin | React + Vite (admin/) |
| Logs | Pino |
| Monitoreo | Sentry + UptimeRobot |
| Testing | Jest + Supertest (23 tests) |
| CI | GitHub Actions |
| Envío email | Resend SDK |

## Despliegues

| Componente | URL |
|------------|-----|
| Backend API | `https://tonaris.onrender.com` |
| App Tonaris | Netlify |
| Panel Admin | Netlify |
| Frontend Kids | (en desarrollo) |

---

## Frontend Kids — Portal Infantil

Portal de registro y menú principal para estudiantes Tonaris Kids.

### Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | LandingPage | Bienvenida con botones INSCRÍBETE / INGRESA |
| `/register` | RegisterPage | Formulario de registro (nombre, institución, correo, contraseña) |
| `/login` | LoginPage | Inicio de sesión |
| `/forgot-password` | ForgotPasswordPage | Recuperación de contraseña |
| `/seleccionar-guia` | SeleccionDeGuiaPage | Elegir entre Julieta o Martín |
| `/menu` | MenuPage | Carrusel 3D con 5 tarjetas |
| `/dashboard` | MenuPage | (alias de /menu) |
| `/aventura`, `/entrenamiento`, `/clasificacion`, `/refugio`, `/tienda` | Placeholder | Próximamente |

### Flujo de usuario

```
Landing → INSCRÍBETE → /register → /seleccionar-guia → /menu
Landing → INGRESA → /login → /menu
Landing → ¿Olvidaste tu contraseña? → /forgot-password
```

### Características

- Inputs y botones con posicionamiento absoluto sobre imágenes de fondo
- Campos transparentes sin bordes visibles
- Carrusel 3D con Swiper.js (efecto Coverflow)
- Responsive (desktop / mobile)
- Validación de formularios con feedback visual
- Detección automática de entorno (local vs producción)

### Imágenes

| Archivo | Propósito |
|---------|-----------|
| `LandingPage.png` | Fondo landing |
| `PaseDeEntrada.png` | Fondo registro |
| `BienvenidoDeNuevo.png` | Fondo login |
| `RecuperacionDeContraseña.png` | Fondo recuperación |
| `SeleccionDeGuia.png` | Fondo selección de guía |
| `TonarisMenu.png` | Fondo menú principal |
| `CardAventura.png` | Tarjeta Aventura |
| `CardEntrenamiento.png` | Tarjeta Entrenamiento |
| `CardClasificacion.png` | Tarjeta Clasificación |
| `CardRefugio.png` | Tarjeta Refugio |
| `CardTienda.png` | Tarjeta Tienda |

---

## API — Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/users/register` | ❌ | Registro (rate limited) |
| POST | `/api/users/login` | ❌ | Login (rate limited) |
| POST | `/api/users/forgot-password` | ❌ | Recuperación de contraseña (rate limited) |
| POST | `/api/users/reset-password` | ❌ | Resetear contraseña (rate limited) |
| GET | `/api/users/all` | ✅ admin | Lista usuarios |
| GET | `/api/users/:userId` | ✅ | Usuario por ID |
| PATCH | `/api/users/:userId/alias` | ✅ | Actualizar alias |
| POST | `/api/sessions` | ✅ | Guardar sesión + resultados |
| GET | `/api/sessions/:userId` | ✅ | Sesiones de un usuario |
| GET | `/api/progress/:userId` | ✅ | Progreso agregado |
| GET | `/api/analytics/streak/:userId` | ✅ | Racha de días |
| GET | `/api/analytics/history/:userId` | ✅ | Historial por sesión |
| GET | `/api/analytics/intervals/:userId` | ✅ | Precisión por intervalo |
| GET | `/api/analytics/summary/:userId` | ✅ | Resumen del estudiante |
| GET | `/api/analytics/leaderboard` | ❌ | Ranking público |
| GET | `/api/analytics/trend/:userId/:skillId` | ✅ | Comparativa 7d vs prev 7d |
| GET | `/api/analytics/mastery/:userId` | ✅ | Skill mastery del usuario |
| PATCH | `/api/analytics/daily-goal/:userId` | ✅ | Actualizar meta diaria |

---

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (3000) |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL (5432) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Secreto para firma de JWT |
| `RESEND_API_KEY` | API Key de Resend para emails |
| `FRONTEND_URLS` | URLs permitidas para CORS (separadas por coma) |

---

## Instalación

### 1. Backend

```bash
npm install
```

Crear `.env` con las variables de entorno necesarias.

```bash
# Ejecutar migraciones (automático al iniciar)
npm start

# Desarrollo
npm run dev
```

### 2. Frontend Kids

```bash
cd kids
npm install
npm run dev
```

El servidor de Vite corre en `http://localhost:5173` con proxy a `http://127.0.0.1:3000` para peticiones `/api`.

### 3. Panel Admin

```bash
cd admin
npm install
npm run dev
```

### 4. App Tonaris (Vanilla JS)

Abrir `tonaris/index.html` con Live Server (puerto 5500).

---

## Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage
```

---

## Pendientes

- [ ] Quitar bordes rojos de depuración en RegisterForm.jsx
- [ ] Conectar selección de guía al backend (PATCH /api/users/:userId)
- [ ] Implementar las 5 secciones del menú Kids
- [ ] Dashboard personalizado por guía (Julieta/Martín)
- [ ] Tutoriales guiados
- [ ] Autenticación JWT en rutas protegidas del frontend Kids
- [ ] Tests de sesiones y analytics
- [ ] Dominios personalizados

---

*Documentación actualizada al 23/07/2026.*