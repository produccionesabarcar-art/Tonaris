# CODEMAP — Tonaris (Backend + Frontend Kids)

Mapa estructural del proyecto. Para agentes OpenCode: encuentra rápido dónde está cada cosa.

---

## Estructura de carpetas

```
/
├── src/                             # Backend Express
│   ├── app.js                       # Entry point: middlewares globales, monta rutas, graceful shutdown
│   ├── routes/                      # Solo define rutas + middlewares → delega a controllers
│   │   ├── users.js                 # 7 rutas: register, login, forgot/reset-password, getAll, getById, updateAlias
│   │   ├── sessions.js              # POST / (crear sesión), GET /:userId (listar)
│   │   ├── progress.js              # GET /:userId (progreso agregado)
│   │   └── analytics.js             # 8 rutas: streak, history, intervals, summary, leaderboard, trend, mastery, daily-goal
│   ├── controllers/                 # Lógica de negocio — toda la queries y cálculos
│   │   ├── users.js                 # register (bcrypt + validación), login (JWT), forgot/reset-password, getById, getAll, updateAlias
│   │   ├── sessions.js              # createSession (inserta session + exercise_results + actualiza skill_mastery + rank + freezes)
│   │   ├── progress.js              # getUserProgress (sesiones agregadas por usuario)
│   │   └── analytics.js             # streak (rachas + freezes), history, intervals, summary, leaderboard, trend, mastery, dailyGoal
│   ├── middleware/
│   │   ├── auth.js                  # authenticate (JWT Bearer) + authorizeAdmin (rol admin)
│   │   ├── cors.js                  # Lista blanca de orígenes permitidos
│   │   ├── errorHandler.js          # Error 4-args: loggea con pino, responde JSON
│   │   └── rateLimiter.js           # express-rate-limit: 5 req/15min en rutas auth
│   ├── lib/
│   │   ├── logger.js                # Pino con pino-pretty (colorizado)
│   │   └── ranks.js                 # RANKS array + getRankFromMasteredCount()
│   ├── services/
│   │   └── emailService.js          # Resend SDK — envío de email de recuperación
│   └── db/
│       ├── pool.js                  # Pool de pg desde env vars
│       └── migrations/              # 12 migraciones SQL
├── kids/                            # Frontend React (portal infantil)
│   ├── public/                      # Imágenes y assets estáticos
│   ├── src/
│   │   ├── api/client.js            # HTTP client con detección de entorno
│   │   ├── components/RegisterForm.jsx
│   │   ├── pages/                   # 6 páginas (Landing, Register, Login, ForgotPassword, SeleccionDeGuia, Menu)
│   │   ├── App.jsx                  # Router (12 rutas)
│   │   ├── main.jsx                 # Entry point con BrowserRouter
│   │   └── index.css
│   ├── vite.config.js               # Proxy /api → http://127.0.0.1:3000
│   └── package.json                 # Dependencias: react 19, swiper 14, tailwind 4
├── tests/                           # Tests Jest + Supertest (23 tests, 5 suites)
├── .github/workflows/
│   ├── ci.yml                       # Push main: npm ci + node --check
│   └── test.yml                     # Push/PR main: npm ci + npm run test:coverage
├── admin/                           # Panel admin React + Vite (desplegado en Netlify)
├── tonaris/                         # App principal Vanilla JS (desplegada en Netlify)
├── tonaris-context.md               # Documento de contexto (fuente de verdad)
├── CODEMAP.md                       # Este archivo
├── AGENTS.md                        # Instrucciones para agentes autónomos
└── README.md                        # Documentación principal
```

---

## Módulos clave

### Routes → Controllers

Toda ruta define: `router.METHOD('/path', [middleware...], controller)`. Los controllers tienen el sufijo del archivo (ej. `register` en `controllers/users.js`).

| Ruta | Controller | Lógica crítica |
|------|-----------|----------------|
| `POST /api/users/register` | `users.register` | Valida password con regex, bcrypt.hash, inserta usuario |
| `POST /api/users/login` | `users.login` | Busca por email, bcrypt.compare, firma JWT 7d |
| `POST /api/sessions` | `sessions.createSession` | Inserta sesión + exercise_results, UPSERT skill_mastery, actualiza rank y freezes |
| `GET /api/analytics/streak/:userId` | `analytics.getStreak` | Días consecutivos + freezes_available + daily_goal + used_freeze_today |
| `GET /api/analytics/leaderboard` | `analytics.getLeaderboard` | Ranking público por alias y precisión (sin auth) |

### Frontend Kids — Páginas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `pages/LandingPage.jsx` | Landing con botones INSCRÍBETE / INGRESA |
| `/register` | `pages/RegisterPage.jsx` | Registro con RegisterForm |
| `/login` | `pages/LoginPage.jsx` | Login con fetch directo |
| `/forgot-password` | `pages/ForgotPasswordPage.jsx` | Recuperación de contraseña |
| `/seleccionar-guia` | `pages/SeleccionDeGuiaPage.jsx` | Elegir Julieta o Martín |
| `/menu`, `/dashboard` | `pages/MenuPage.jsx` | Carrusel 3D con Swiper.js |
| `/aventura`, `/entrenamiento`, `/clasificacion`, `/refugio`, `/tienda` | (inline) | Placeholders "Próximamente" |

### Middleware chain típica

```
Request → cors → helmet → json parser → rateLimiter (auth routes) → 
  authenticate (rutas protegidas) → authorizeAdmin (rutas admin) → 
    controller → pool.query() → response
Error → Sentry (si DSN presente) → errorHandler → JSON error response
```

---

## Flujos principales

**Registro (Kids):** `POST /api/users/register` → `rateLimiter` → `users.register` → valida campos + password regex + password≠email → `bcrypt.hash` → `pool.query(INSERT INTO users)` → 201 con usuario o 409 si email duplicado. En frontend: `RegisterPage` → `RegisterForm` → `registerUser()` en `client.js` → guarda token en localStorage → redirige a `/seleccionar-guia`.

**Login (Kids):** `POST /api/users/login` → `rateLimiter` → `users.login` → valida email+password → `pool.query(SELECT * FROM users WHERE email=$1)` → `bcrypt.compare` → `jwt.sign({user_id, role})` → 200 con token + user. En frontend: `LoginPage` → fetch directo → guarda token → redirige a `/`.

**Recuperación de contraseña:** `POST /api/users/forgot-password` → `rateLimiter` → genera `crypto.randomBytes(32)` → guarda en DB con expiración 1h → envía email vía Resend → respuesta genérica (no revela si email existe). `POST /api/users/reset-password` → verifica token vigente → bcrypt.hash nueva password → UPDATE.

**Session con resultados:** `POST /api/sessions` → `authenticate` → `sessions.createSession` → INSERT session + INSERT exercise_results (batch) → por cada interval único: COUNT + accuracy 7d en exercise_results → determina mastery (≥90%+20intentos=mastered, ≥70%=stable, ≥40%=learning) → UPSERT skill_mastery → cuenta mastered → actualiza rank si cambió → si primera sesión del día y racha%7=0: otorga freeze (capped 2).

---

## Convenciones

- **payload POST /api/sessions**: usar `userId` (camelCase), no `user_id`
- **IDs usuario**: `usr_` + random string (generado en frontend)
- **IDs sesión**: `String(Date.now())`
- **Respuestas JSON errores**: siempre `{ error: "mensaje" }`
- **Logs**: solo vía `logger` (pino) — prohibido `console.log`
- **Pool**: `const pool = require('../db/pool')` — sin destructuring
- **Auth orden**: `authenticate` antes que `authorizeAdmin`
- **Tests**: cada archivo mockea `pool` y `rateLimiter`; usar `jest.clearAllMocks()` en `beforeEach`
- **Kids inputs/botones**: todos con posicionamiento absoluto sobre imágenes, transparentes (`backgroundColor: transparent`, sin bordes visibles)
- **Kids imágenes**: servidas desde `public/`, referenciadas como `/imagen.png`
- **Kids entorno**: Vite proxy `/api` → `http://127.0.0.1:3000` en desarrollo; producción apunta a `https://tonaris.onrender.com`
