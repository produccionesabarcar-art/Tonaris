# CODEMAP — Tonaris Backend

Mapa estructural del proyecto. Para agentes OpenCode: encuentra rápido dónde está cada cosa.

---

## Estructura de carpetas

```
/
├── src/
│   ├── app.js                     # Entry point: middlewares globales, monta rutas, graceful shutdown
│   ├── routes/                    # Solo define rutas + middlewares → delega a controllers
│   │   ├── users.js               # 7 rutas: register, login, forgot/reset-password, getAll, getById, updateAlias
│   │   ├── sessions.js            # POST / (crear sesión), GET /:userId (listar)
│   │   ├── progress.js            # GET /:userId (progreso agregado)
│   │   └── analytics.js           # 8 rutas: streak, history, intervals, summary, leaderboard, trend, mastery, daily-goal
│   ├── controllers/               # Lógica de negocio — toda la queries y cálculos
│   │   ├── users.js               # register (bcrypt + validación), login (JWT), forgot/reset-password, getById, getAll, updateAlias
│   │   ├── sessions.js            # createSession (inserta session + exercise_results + actualiza skill_mastery + rank + freezes)
│   │   ├── progress.js            # getUserProgress (sesiones agregadas por usuario)
│   │   └── analytics.js           # streak (rachas + freezes), history, intervals, summary, leaderboard, trend, mastery, dailyGoal
│   ├── middleware/
│   │   ├── auth.js                # authenticate (JWT Bearer) + authorizeAdmin (rol admin)
│   │   ├── cors.js                # Lista blanca de orígenes permitidos
│   │   ├── errorHandler.js        # Error 4-args: loggea con pino, responde JSON
│   │   └── rateLimiter.js         # express-rate-limit: 5 req/15min en rutas auth
│   ├── lib/
│   │   ├── logger.js              # Pino con pino-pretty (colorizado)
│   │   └── ranks.js               # RANKS array + getRankFromMasteredCount()
│   ├── services/
│   │   └── emailService.js        # Resend SDK — envío de email de recuperación
│   └── db/
│       ├── pool.js                # Pool de pg desde env vars
│       └── migrations/
│           ├── migrationRunner.js # Lee .sql ordenados, ejecuta no-ejecutados
│           ├── 001..012.sql       # Migraciones: users → sessions → exercise_results → skill_mastery → gamificación
├── tests/
│   ├── health.test.js             # GET /health → 200
│   ├── auth.test.js               # POST /api/users/register (4 tests)
│   ├── auth-login.test.js         # POST /api/users/login (4 tests)
│   ├── auth-password.test.js      # POST forgot-password + reset-password (8 tests)
│   └── middleware/
│       └── auth.test.js           # authenticate + authorizeAdmin (6 tests)
├── .github/workflows/
│   ├── ci.yml                     # Push main: npm ci + node --check
│   └── test.yml                   # Push/PR main: npm ci + npm run test:coverage
├── jest.config.js                 # Test env: node, coverage thresholds (lines ≥40%)
├── package.json                   # Scripts: dev, start, test, test:coverage
├── tonaris-context.md             # Documento de contexto (fuente de verdad)
└── CODEMAP.md                     # Este archivo
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

### Middleware chain típica

```
Request → cors → helmet → json parser → rateLimiter (auth routes) → 
  authenticate (rutas protegidas) → authorizeAdmin (rutas admin) → 
    controller → pool.query() → response
Error → Sentry (si DSN presente) → errorHandler → JSON error response
```

---

## Flujos principales

**Registro:** `POST /api/users/register` → `rateLimiter` → `users.register` → valida campos + password regex + password≠email → `bcrypt.hash` → `pool.query(INSERT INTO users)` → 201 con usuario o 409 si email duplicado.

**Login:** `POST /api/users/login` → `rateLimiter` → `users.login` → valida email+password → `pool.query(SELECT * FROM users WHERE email=$1)` → `bcrypt.compare` → `jwt.sign({user_id, role})` → 200 con token + user.

**Session con resultados:** `POST /api/sessions` → `authenticate` → `sessions.createSession` → INSERT session + INSERT exercise_results (batch) → por cada interval único: COUNT + accuracy 7d en exercise_results → determina mastery (≥90%+20intentos=mastered, ≥70%=stable, ≥40%=learning) → UPSERT skill_mastery → cuenta mastered → actualiza rank si cambió → si primera sesión del día y racha%7=0: otorga freeze (capped 2).

**Recuperación de contraseña:** `POST /api/users/forgot-password` → `rateLimiter` → genera `crypto.randomBytes(32)` → guarda en DB con expiración 1h → envía email vía Resend → respuesta genérica (no revela si email existe). `POST /api/users/reset-password` → verifica token vigente → bcrypt.hash nueva password → UPDATE.

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
