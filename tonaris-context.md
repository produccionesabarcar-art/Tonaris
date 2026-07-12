# Tonaris — Documento de Contexto para Agentes Autónomos
> Leer este documento completo antes de ejecutar cualquier acción.
> Contexto actualizado al 11/07/2026.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre:** AbarcarTonaris
**Descripción:** Plataforma web de entrenamiento auditivo basada en el círculo de quintas y el sistema pedagógico PAIEM de Abarcar Audio.
**Propietario:** Javier — fundador de Abarcar Audio, Bogotá, Colombia.
**Repositorio:** `https://github.com/produccionesabarcar-art/Tonaris.git`
**Rama activa:** `feat/security-password-reset`
**Ruta local:** `/home/abarcar/Workspace/TonarisBackend/`

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Versión | Estado |
|---|---|---|---|
| Runtime | Node.js | v24.16.0 | ✅ |
| Framework backend | Express | latest | ✅ |
| Base de datos (local) | PostgreSQL | v18 | ✅ |
| Base de datos (producción) | PostgreSQL gestionado (Supabase) | — | ✅ desplegada |
| Auth | bcrypt + jsonwebtoken | latest | ✅ |
| Frontend admin | React + Vite | Vite v8 | ✅ en `admin/` — ⏳ sin desplegar |
| Frontend app | Vanilla JS | — | ✅ en `tonaris/` |
| Logs | pino + pino-pretty | latest | ✅ implementado |
| Contenedor | Docker | node:24-alpine | ✅ |
| CI | GitHub Actions | — | ✅ básico (`npm ci` + `node --check`) |
| Despliegue backend | Render (Free) | — | ✅ live |
| Despliegue frontends | Netlify | — | ✅ app Tonaris — ⏳ admin pendiente |
| Cliente HTTP dev | Thunder Client | — | ✅ en VS Code |
| Envío de emails | Resend SDK | latest | ✅ Resend SDK (`src/services/emailService.js`) |

**NOTAS CRÍTICAS DE ENTORNO:**
- `localhost` NO resuelve para Node.js en este equipo — usar `127.0.0.1:3000`
- `localhost:5173` SÍ funciona para Vite (panel admin)
- `127.0.0.1:5500` o `localhost:5500` para Live Server (app Tonaris) — abrir directo `tonaris/index.html` con "Open with Live Server", no la raíz del proyecto
- El backend local y el de producción son independientes: correr `npm run dev` en la raíz **ya no es obligatorio** salvo que estés desarrollando/probando cambios de backend antes de subirlos
- El panel admin **sí sigue necesitando** `npm run dev` local porque aún no está desplegado
- Si psql no responde: `$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"`
- Para reiniciar nodemon escribir `rs` en la terminal donde corre
- `tonaris/api.js` ahora detecta el entorno automáticamente por `window.location.hostname`: en `127.0.0.1`/`localhost` usa la API local, en cualquier otro dominio (Netlify, dominio propio) usa `https://tonaris.onrender.com` — no hay que cambiar nada manualmente al alternar entre desarrollo y producción

---

## 3. ARQUITECTURA ACTUAL

### 3.1 Estructura de carpetas

```
E:\TonarisBackend\
├── admin/                              ← Panel admin React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              ← fetch centralizado con token automático
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx       ← usa children (NO Outlet)
│   │   ├── pages/
│   │   │   ├── Login.jsx              ← solo admins
│   │   │   ├── Users.jsx              ← tabla de usuarios
│   │   │   ├── Sessions.jsx           ← búsqueda por userId
│   │   │   ├── Progress.jsx           ← métricas por userId
│   │   │   ├── Analytics.jsx          ← racha + gráfica recharts + intervalos
│   │   │   └── Leaderboard.jsx        ← ranking por alias y precisión
│   │   ├── App.jsx                    ← BrowserRouter, Nav, Routes
│   │   └── main.jsx
│   └── vite.config.js                 ← proxy /api → http://127.0.0.1:3000 (local)
├── tonaris/                            ← App Vanilla JS
│   ├── index.html                     ← SPA con 11+ pantallas (incluye screen-login nueva)
│   ├── main.js                        ← motor completo (~2800+ líneas)
│   ├── api.js                         ← cliente HTTP — API_URL auto-detecta entorno por hostname
│   └── styles.css
├── src/
│   ├── routes/
│   │   ├── users.js                   ← register, login, getAll, getById, updateAlias
│   │   ├── sessions.js                ← createSession, getSessionsByUser
│   │   ├── progress.js                ← getUserProgress
│   │   └── analytics.js              ← streak, history, intervals, summary, leaderboard
│   ├── controllers/
│   │   ├── users.js
│   │   ├── sessions.js                ← usa logger (pino)
│   │   ├── progress.js                ← usa logger (pino)
│   │   └── analytics.js
│   ├── middleware/
│   │   ├── cors.js
│   │   ├── errorHandler.js            ← usa logger (pino)
│   │   └── auth.js                    ← authenticate + authorizeAdmin
│   ├── lib/
│   │   ├── logger.js                  ← instancia pino centralizada (Etapa 6)
│   │   └── ranks.js                   ← escalera de rangos de gamificación (Etapa 7)
│   ├── db/
│   │   ├── pool.js                    ← exporta pool directamente (sin destructuring), usa logger
│   │   └── migrations/
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_sessions.sql
│   │       ├── 003_add_password_to_users.sql
│   │       ├── 004_remove_password_default.sql
│   │       ├── 005_add_role_to_users.sql
│   │       ├── 006_create_exercise_results.sql
│   │       ├── 007_add_alias_to_users.sql
│   │       ├── 008_add_password_reset.sql
│   │       ├── 009_add_institution_to_users.sql
│   │       ├── 010_create_skill_mastery.sql
│   │       ├── 011_add_gamification_to_users.sql
│   │       ├── 012_create_user_rewards.sql
│   │       └── migrationRunner.js     ← usa logger
│   └── app.js                          ← usa logger, requiere ./lib/logger
├── Dockerfile                          ← Etapa 6
├── .dockerignore                       ← Etapa 6
├── .github/workflows/ci.yml            ← Etapa 6 — npm ci + node --check en cada push a main
├── tonaris-context.md
├── .env                                 ← local, NUNCA se sube (gitignored)
├── .gitignore
├── package.json
└── package-lock.json
```

### 3.2 Variables de entorno — LOCAL (.env, no se toca)

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tonaris_db
DB_USER=postgres
DB_PASSWORD=<password de instalación local>
JWT_SECRET=tonaris_secret_super_seguro_2024
```

### 3.3 Variables de entorno — PRODUCCIÓN (configuradas en dashboard de Render, no en el repo)

```
PORT=3000
DB_HOST=aws-1-sa-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.qjeeyrkmmkyzqybcwxgm
DB_PASSWORD=<contraseña generada en Supabase — guardada aparte, no en este doc>
JWT_SECRET=7208c14cbfd3d065557476b3c378464e16cbc074814f3666f73674ec4a76ca94aa71267cfe476af6ab266e67a8d26c2fe90c93beaf76a0df0f8ea25dd645f43e
```

**Importante:** `DB_USER` en producción incluye el project ref de Supabase (`postgres.qjeeyrkmmkyzqybcwxgm`), no es solo `postgres` — es el connection pooler de Supabase (puerto 5432, modo session/directo, no el pooler 6543 de modo transacción).

### 3.4 Base de datos — esquema (igual en local y producción)

```sql
-- Tabla users
CREATE TABLE users (
  user_id           VARCHAR(20)  PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(150) UNIQUE NOT NULL,
  password          VARCHAR(255) NOT NULL,
  role              VARCHAR(20)  NOT NULL DEFAULT 'estudiante',
  alias             VARCHAR(10),
  institution       VARCHAR(100),
  reset_token       VARCHAR(255),
  reset_token_expires TIMESTAMP,
  daily_goal        INT          NOT NULL DEFAULT 1,
  freezes_available INT          NOT NULL DEFAULT 0,
  rank              VARCHAR(30)  NOT NULL DEFAULT 'Oyente',
  created_at        TIMESTAMP    DEFAULT NOW()
);

-- Tabla sessions
CREATE TABLE sessions (
  session_id VARCHAR(20) PRIMARY KEY,
  user_id    VARCHAR(20) REFERENCES users(user_id),
  tonality   VARCHAR(10) NOT NULL,
  correct    INT         NOT NULL,
  total      INT         NOT NULL,
  duration   INT         NOT NULL,
  accuracy   INT         NOT NULL,
  created_at TIMESTAMP   DEFAULT NOW()
);

-- Tabla exercise_results
CREATE TABLE exercise_results (
  result_id   VARCHAR(30)  PRIMARY KEY,
  session_id  VARCHAR(20)  REFERENCES sessions(session_id),
  user_id     VARCHAR(20)  REFERENCES users(user_id),
  interval    VARCHAR(20)  NOT NULL,
  is_correct  BOOLEAN      NOT NULL,
  response_ms INT,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- Tabla skill_mastery (Etapa 7)
CREATE TABLE skill_mastery (
  user_id     VARCHAR(20)  REFERENCES users(user_id),
  skill_id    VARCHAR(30)  NOT NULL,
  mastery     VARCHAR(10)  NOT NULL DEFAULT 'unknown',
  accuracy_7d NUMERIC,
  avg_ms_7d   INT,
  updated_at  TIMESTAMP    DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

-- Tabla user_rewards (Etapa 7 — reservada para futuro)
CREATE TABLE user_rewards (
  reward_id   VARCHAR(30) PRIMARY KEY,
  user_id     VARCHAR(20) REFERENCES users(user_id),
  reward_type VARCHAR(30) NOT NULL,
  unlocked_at TIMESTAMP   DEFAULT NOW()
);

-- Tabla migrations (control interno)
CREATE TABLE migrations (
  id          SERIAL       PRIMARY KEY,
  filename    VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP    DEFAULT NOW()
);
```

**Nota:** las migraciones 001-012 ya corrieron exitosamente contra la base local y están listas para producción.

### 3.5 API — Rutas disponibles

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | ❌ | Health check — verificado en producción: `{"status":"ok","project":"Tonaris API"}` |
| POST | `/api/users/register` | ❌ | Registra usuario con bcrypt |
| POST | `/api/users/login` | ❌ | Login, devuelve JWT 7d |
| GET | `/api/users/all` | ✅ admin | Lista todos los usuarios |
| GET | `/api/users/:userId` | ✅ | Usuario por ID |
| PATCH | `/api/users/:userId/alias` | ✅ | Actualiza alias |
| POST | `/api/sessions` | ✅ | Guarda sesión — body requiere `userId` (camelCase, no `user_id`) |
| GET | `/api/sessions/:userId` | ✅ | Sesiones de un usuario |
| GET | `/api/progress/:userId` | ✅ | Progreso agregado |
| GET | `/api/analytics/streak/:userId` | ✅ | Racha de días consecutivos |
| GET | `/api/analytics/history/:userId` | ✅ | Historial por sesión |
| GET | `/api/analytics/intervals/:userId` | ✅ | Precisión por intervalo |
| GET | `/api/analytics/summary/:userId` | ✅ | Resumen del estudiante |
| GET | `/api/analytics/leaderboard` | ❌ | Ranking público (sin auth) |
| GET | `/api/analytics/trend/:userId/:skillId` | ✅ | Comparación accuracy/avg_ms últimos 7d vs 7d previos (Etapa 7) |
| GET | `/api/analytics/mastery/:userId` | ✅ | Lista completa de skill_mastery del usuario (Etapa 7) |
| PATCH | `/api/analytics/daily-goal/:userId` | ✅ | Actualiza daily_goal, solo el propio usuario (Etapa 7) |
| POST | `/api/users/forgot-password` | ❌ | Recuperación de contraseña — envía email con token (Etapa 6.9) |
| POST | `/api/users/reset-password` | ❌ | Restablece contraseña con token (Etapa 6.9) |

### 3.6 api.js — funciones disponibles en Tonaris

```javascript
const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? 'http://127.0.0.1:3000'
  : 'https://tonaris.onrender.com';

apiLogin(email, password)
apiRegister(userId, name, email, password, alias)
apiSaveSession(session)   // payload debe usar userId, NO user_id
apiGetLeaderboard()
apiGetSummary(userId)
apiSetAlias(userId, alias)
apiLogout()
apiGetCurrentUser()  // lee tonaris_api_user de localStorage
```

**✅ RESUELTO:** `tonaris/api.js` ya no apunta fijo a local — detecta el hostname automáticamente (ver Sección 2, notas de entorno).

### 3.7 Estado de integración en main.js

| Función | Estado |
|---------|--------|
| `handleRegister` | ✅ llama apiRegister + apiLogin. Modificada para manejar 409 (email ya registrado) con mensaje claro en vez de error crudo |
| `handleLogin` | ✅ NUEVA — valida campos, llama apiLogin, carga o crea progreso local, redirige a dashboard |
| `renderLeaderboard` | ✅ llama apiGetLeaderboard (pública, sin auth) |
| `renderDashboard` | ✅ llama apiGetSummary si hay usuario logueado |
| `endSession` | ✅ llama apiSaveSession — bug de payload (`user_id`→`userId`) corregido en Etapa 5 |

### 3.8 Pantallas en index.html

- `screen-landing` — landing/inicio — ⏳ en rediseño, ver Sección 6.8
- `screen-register` — registro (nombre, email, password, alias) ✅ conectado, con manejo de 409
- `screen-login` — **NUEVA** — login (email, password) ✅ conectado, separado del registro
- `screen-tonic` — selección de tónica
- `screen-key` — selección de tonalidad
- `screen-mode` — selección de modo
- `screen-ready` — preparación
- `screen-session` / `screen-exercise` — ejercicios activos — responsive ajustado en Etapa 5
- `screen-result` — resultados de sesión
- `screen-dash` — dashboard ✅ conectado
- `screen-profile` — perfil
- `screen-leaderboard` — ranking ✅ conectado
- `screen-forgot-password` — ⏳ NO EXISTE — planeada, ver Sección 6.9

---

## 4. ESTADO DE ETAPAS

| Etapa | Nombre | Estado |
|-------|--------|--------|
| 1 | API base | ✅ COMPLETADA |
| 2 | Persistencia (PostgreSQL, migraciones) | ✅ COMPLETADA |
| 3 | Auth (bcrypt, JWT, roles) | ✅ COMPLETADA |
| 4 | Administración (panel React) | ✅ COMPLETADA |
| 5 | Analítica + integración Tonaris | ✅ COMPLETADA |
| 6 | Producción (Docker, CI/CD, despliegue, seguridad, UX) | ✅ COMPLETADA |
| 7 | Gamificación (rachas, freezes, metas, rangos, analytics) | ✅ COMPLETADA |

---

## 5. ETAPA 5 — COMPLETADA (resumen de lo implementado)

Todos los cambios se hicieron en `tonaris/main.js`, `tonaris/styles.css` e `index.html`, siguiendo el protocolo nivel 3 (líneas exactas + confirmación antes de aplicar).

### 5.1 Quitar tiempo mínimo de sesión + máximo de 5 minutos ✅
- `SESSION_MAX_SECS` = 5 min, `SESSION_MIN_SECS` = 0
- `updateStreak` ya no exige minutos mínimos acumulados — cualquier sesión cuenta para la racha
- Timer sin estado "warn" ni toast de "completaste el mínimo"
- `handleExitSession` limpiado: ya no tiene el chequeo hardcodeado de "10 minutos"
- **Nota:** el texto de marketing en la landing ("10 minutos al día — máximo 15") quedó desactualizado tras este cambio — corrección en curso, ver Sección 6.8

### 5.2 Quitar mensaje post-sesión "vuelve en 1 hora" ✅
- El `confirm()` con el mensaje de cooldown fue reemplazado por un `showToast()` motivacional apuntando al ranking
- La sesión siempre cierra yendo a la pantalla de resultados (`endSession()`), sin doble navegación

### 5.3 Auto-avance en respuesta correcta / botón siguiente en incorrecta ✅
- En `showFeedback`: respuesta correcta → `setTimeout(() => advanceExercise(), 800)`
- Respuesta incorrecta → se muestra el botón "Siguiente" para que el estudiante revise el error

### 5.4 Responsive — sin scroll forzado en móvil ✅
- `#screen-exercise` usa `max-height: 100dvh` + `overflow-y: auto` (no `hidden` — se dejó como red de seguridad tras detectar que algunos botones quedaban cortados)
- Media queries ajustadas en 600px y 400px: reducción de padding, font-size y tamaños de botones (`.syl-btn`, `.harm-btn`, `.scale-row--mini`, etc.)
- Botón `.play-circle` (círculo morado grande) **eliminado** — el único control de reproducción ahora es `.audio-card__repeat` ("Escuchar de nuevo"), rediseñado como píldora naranja (`#C8473A`, texto blanco, ~15% más grande que `#btn-exit-session`)
- El audio se auto-reproduce al cargar cada ejercicio (`setTimeout(() => playCurrentExerciseAudio(), 400)` dentro de `renderCurrentExercise`)

### Bugs encontrados y corregidos durante Etapa 5
1. **Guardado de puntaje fallaba (`POST /api/sessions` → 400):** el payload enviaba `user_id` (snake_case) pero el controlador esperaba `userId` (camelCase). Corregido en `main.js` línea del `apiSaveSession`.
2. **Ruido de consola por `sendToSheets`:** la integración con Google Apps Script nunca se configuró (`APPS_SCRIPT_URL` seguía en placeholder). Se agregó un guard: si la URL contiene `'REEMPLAZAR'`, la función retorna sin hacer el fetch.
3. **Referencias rotas tras eliminar `.play-circle`:** quedaron un `addEventListener` y varias llamadas `.classList` apuntando a `DOM.btnPlayEx` (ahora `null`). Se eliminaron esas líneas; el audio sigue funcionando vía auto-play + botón "Escuchar de nuevo".

---

## 6. ETAPA 6 — PRODUCCIÓN, SEGURIDAD Y UX (en progreso)

**Cambio de plan importante:** Railway ya no ofrece tier gratuito permanente (solo $5 de crédito el primer mes, luego $1/mes) — no alcanza para correr backend + Postgres 24/7 gratis. Se optó por **Render + Supabase**, que sí tienen tiers gratuitos reales y sostenibles.

### 6.1 Dockerización ✅
`Dockerfile` en la raíz:
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/app.js"]
```
`.dockerignore`: `node_modules/`, `.env`, `.git`, `.gitignore`, `*.log`, `.DS_Store`, `admin/`, `tonaris/`

### 6.2 Logs estructurados con pino ✅
- `src/lib/logger.js` — instancia centralizada de pino con `pino-pretty` (colorizado, timestamp)
- Reemplazados los 12 `console.log/error` repartidos en: `app.js`, `pool.js`, `errorHandler.js`, `migrationRunner.js`, `sessions.js` (controller), `progress.js` (controller)
- Patrón: `logger.info(msg)` / `logger.error(err, 'contexto')`

### 6.3 CI — GitHub Actions ✅ (básico)
`.github/workflows/ci.yml` — trigger en push a `main`:
```yaml
- actions/checkout@v4
- actions/setup-node@v4 (node 24)
- npm ci
- node --check src/app.js   # valida sintaxis, no requiere DB ni puerto
```
Sin tests automatizados todavía (no hay framework de tests en el proyecto) — el chequeo es solo sintáctico. Ampliar cuando existan tests reales.

### 6.4 Base de datos en producción — Supabase ✅
- Proyecto: `tonaris-db`, organización `AbarcarAudio`, región `sa-east-1` (São Paulo)
- Data API (PostgREST), exposición automática de tablas y RLS automático: **desactivados** — el backend habla directo a Postgres vía `pg`, no usa `supabase-js`
- Connection pooler en modo directo/session (puerto 5432), no el modo transacción (6543)
- Verificado: 7 migraciones corridas, 4 tablas visibles en Table Editor con relaciones correctas

### 6.5 Despliegue backend — Render ✅ LIVE
- Servicio: `tonaris-api` (Web Service, Docker, Free tier)
- Repo conectado: `produccionesabarcar-art/Tonaris`, rama `main`, deploy automático en cada push
- **URL de producción: `https://tonaris.onrender.com`**
- Health check verificado: `GET /health` → `{"status":"ok","project":"Tonaris API"}`
- Variables de entorno cargadas en dashboard de Render (ver sección 3.3)
- **Limitación conocida del free tier:** el servicio "duerme" tras ~15 min de inactividad; el primer request tras eso tarda 30-60s en responder (cold start)

### 6.6 Frontend Tonaris apuntando a producción ✅
- `tonaris/api.js` actualizado: `API_URL` detecta `window.location.hostname` — local (`127.0.0.1`/`localhost`) usa la API local, cualquier otro dominio usa `https://tonaris.onrender.com`
- Verificado funcionando en local sin romper el flujo de desarrollo

### 6.7 Login separado del registro ✅
Antes solo existía el flujo de registro; intentar "registrarse" con un email ya existente devolvía un 409 sin manejar con gracia. Se agregó:
- Nueva pantalla `screen-login` (email + password + botón "Entrar" + link "Regístrate gratis")
- Botón "¿Ya tienes cuenta? Inicia sesión" en la landing
- Nueva función `handleLogin()`: valida campos, llama `apiLogin`, si hay token carga `loadProgress()` (o crea uno nuevo) y redirige al dashboard; si hay error lo muestra en el campo de email
- `handleRegister()` modificado: si `apiRegister` devuelve `{error: '...'}` conteniendo "registrado", muestra "Este correo ya está registrado. Inicia sesión." en vez de dejar el error crudo en consola
- Verificado con `node --check` (sintaxis) y grep cruzado de IDs HTML ↔ referencias DOM en JS

### 6.8 Rediseño de landing — COMPLETADO ✅ (11/07/2026)

| Cambio | Detalle | Estado |
|--------|---------|--------|
| Texto actualizado | Subtítulo y bullet → `"Hasta 5 minutos al día, sin mínimo."` | ✅ |
| CTAs movidos arriba | Botones "Empezar ahora" / "Iniciar sesión" ahora antes de chips de sílabas | ✅ |
| Glow botón principal | `box-shadow` extendido + `transform: scale(1.02)` + glow extra en hover | ✅ |
| Wordmark ABARCAR | height 18px, opacity 0.85, drop-shadow con acento morado | ✅ |
| Botones "Volver" | `register__back` y `profile-screen__back` con bg `accent-dim`, borde, color acento, weight 600 | ✅ |

### 6.9 Seguridad y recuperación de contraseña — COMPLETADO ✅ (11/07/2026)

**A) Recuperación de contraseña vía email — COMPLETADO ✅**

Detalles técnicos:
- **SDK email:** Resend (`src/services/emailService.js`) — from real verificado, template HTML oscuro con marca Abarcar, `FRONTEND_URL` desde variable de entorno
- **Generación de token:** `crypto.randomBytes(32).toString('hex')` — 64 caracteres hex, expira en 1 hora
- **Link de reseteo:** se arma dinámicamente como `${frontendUrl}/?screen=reset-password&token=${resetToken}`
- **Validación de contraseña en reseteo:** mínimo 8 caracteres, no puede ser igual al email del usuario

| Componente | Archivo | Estado |
|---|---|---|
| Proveedor email | Resend SDK en `package.json` | ✅ |
| `emailService.js` | `src/services/emailService.js` — from real, FRONTEND_URL, template HTML oscuro | ✅ |
| `POST /api/users/forgot-password` | `src/controllers/users.js` — crypto.randomBytes(32), respuestas genéricas, 1h expiración | ✅ |
| `POST /api/users/reset-password` | `src/controllers/users.js` — min 8 chars, ≠ email, respuestas genéricas | ✅ |
| Migración 008 | Columnas `reset_token` / `reset_token_expires` en `users` | ✅ |
| `screen-forgot-password` | `tonaris/index.html` + `tonaris/main.js` + `tonaris/api.js` | ✅ |
| `screen-reset-password` | `tonaris/index.html` + `tonaris/main.js` + `tonaris/api.js` | ✅ |
| Query param parsing | `tonaris/main.js` `init()` — `?screen=reset-password&token=...` | ✅ |
| Verificación runtime | 7 casos probados, login con nueva contraseña OK | ✅ |

**Prueba visual end-to-end en navegador — COMPLETADO ✅** (se probó en local, fallo de conexión Windows/Linux resuelto, reseteo exitoso).

**B) Buenas prácticas de seguridad general — COMPLETADO ✅ (11/07/2026)**

| Medida | Archivo | Detalle | Estado |
|--------|---------|---------|--------|
| Rate limiting | `src/middleware/rateLimiter.js` + `src/routes/users.js` | `express-rate-limit`: 5 req/15min en login, register, forgot-password, reset-password | ✅ |
| Helmet.js | `src/app.js` | `app.use(helmet())` al inicio, antes de rutas — CSP, X-Content-Type-Options, X-Frame-Options activos | ✅ |
| Validación password en registro | `src/controllers/users.js` | Regex (min 8 chars, mayúscula, minúscula, dígito) + password ≠ email | ✅ |
| CORS | `src/middleware/cors.js` | Orígenes: solo `127.0.0.1:5500`, `localhost:5500`, `localhost:5173`, `https://abarcaraudio.netlify.app` | ✅ |

### 6.10 Despliegue panel admin — PENDIENTE
- [ ] Aún no desplegado. Plan: Netlify, build command `cd admin && npm ci && npm run build`, publish directory `admin/dist`. Actualizar `vite.config.js` / variable de entorno para que el proxy apunte a Render en vez de `127.0.0.1:3000`.

### 6.11 Dominios personalizados — PENDIENTE (opcional)
| Dominio | Servicio |
|---|---|
| `api.abarcaraudio.com` | Render (backend) |
| `admin.abarcaraudio.com` | Netlify (panel admin) |

SSL automático vía Let's Encrypt en ambos servicios.

---

## 7. DEUDA TÉCNICA

| Item | Prioridad | Estado |
|------|-----------|--------|
| JWT_SECRET hardcodeado/débil en `.env` local | Alta | ✅ Resuelto para producción — secreto fuerte (128 hex chars) generado y configurado solo en Render, nunca en el repo |
| Sin recuperación de contraseña | Alta | ✅ Resuelto — implementado en 6.9.A (11/07/2026) |
| Sin rate limiting en login/registro | Alta | ✅ Resuelto — implementado en 6.9.B (11/07/2026) |
| Sin headers de seguridad HTTP (helmet) | Media | ✅ Resuelto — implementado en 6.9.B (11/07/2026) |
| Landing con texto/CTA desactualizados | Media | ✅ Resuelto — implementado en 6.8 (11/07/2026) |
| PATH PostgreSQL no permanente en Windows | Baja | Pendiente, no bloquea nada |
| Sin tests automatizados | Media | Pendiente — CI actual solo valida sintaxis |
| Panel admin sin desplegar | Media | Pendiente |
| Prisma no introducido | Baja | Descartado por ahora — el proyecto usa `pg` directo y funciona bien así |

---

## 8. CONVENCIONES DE CÓDIGO

### Backend (Node/Express)
- `routes/` solo define rutas → `controllers/` contiene toda la lógica
- `const pool = require('../db/pool')` — sin destructuring
- `const logger = require('../lib/logger')` (o ruta relativa correspondiente) para cualquier log — nunca `console.log/error` en código nuevo
- Nunca exponer `password` en respuestas JSON
- IDs de usuario: `usr_` + random string (generado en frontend)
- IDs de sesión: `String(Date.now())`
- Payloads hacia `/api/sessions`: usar **camelCase** (`userId`), no snake_case

### Migraciones SQL
- Nombre: `NNN_descripcion_snake_case.sql`
- Siempre `IF NOT EXISTS` / `IF EXISTS`
- Una migración = un cambio atómico
- Nunca modificar migración ya ejecutada
- Corren automáticamente al arrancar `app.js` (local y producción) vía `migrationRunner.js`

### Auth
- JWT payload: `{ user_id, role }`, expira 7 días
- Header: `Authorization: Bearer <token>`
- Orden: `authenticate` siempre antes de `authorizeAdmin`
- Login y registro ahora son flujos separados en el frontend (`screen-login` / `screen-register`) — no forzar registro cuando el usuario ya tiene cuenta

### Frontend Admin (React)
- Estilos inline con objetos JS
- Paleta: `#0f0f0f` fondo, `#1a1a1a` cards, `#fff` texto, `#aaa` secundario, `#ff4444` error
- `apiFetch` de `src/api/client.js` para TODAS las llamadas
- `PrivateRoute` usa `children` — NO Outlet

### Frontend Tonaris (Vanilla JS)
- **NO modificar** secciones 1-4 de main.js (constantes pedagógicas, audio, SM-2, datos)
- Todas las llamadas API van a través de `api.js`
- Integración aditiva — no reemplaza localStorage, lo complementa
- Si API falla → app sigue funcionando (graceful degradation)
- Único control de reproducción de audio: `.audio-card__repeat` ("Escuchar de nuevo") — el botón `.play-circle` fue eliminado en Etapa 5, no reintroducirlo
- `API_URL` en `api.js` nunca debe hardcodearse de vuelta a un solo entorno — mantener la detección por hostname

### Git
```
feat: nueva funcionalidad
fix: bug corregido
refactor: mejora estructural
chore: dependencias, configs
docs: documentación
```
Los commits los hace siempre Javier manualmente — los agentes preparan el diff/cambio pero no ejecutan `git commit` ni `git push` salvo pedido explícito.

---

## 9. PROTOCOLO PARA AGENTES

```
PENSAR → ANALIZAR → PROPONER PLAN → [confirmar si nivel 3] → EJECUTAR → VERIFICAR
```

| Nivel | Tipo | Protocolo |
|-------|------|-----------|
| 1 — Bajo | Nuevo archivo | Ejecutar directo |
| 2 — Medio | Modificar controlador o ruta | Mostrar plan + ejecutar |
| 3 — Alto | Refactor, app.js, main.js, pool.js, styles.css de la pantalla de ejercicios, cualquier cambio de seguridad/auth | Mostrar líneas exactas → esperar confirmación |

**⚠️ main.js de Tonaris es SIEMPRE nivel 3.**
**⚠️ Cualquier cambio relacionado con auth, tokens, o passwords (incluyendo recuperación de contraseña) es SIEMPRE nivel 3.**
Antes de cualquier modificación: mostrar las líneas exactas con números, el código actual y el código nuevo. Esperar confirmación explícita antes de escribir.

**Reglas:**
1. Leer `tonaris-context.md` completo antes de cualquier acción
2. Archivos siempre completos — nunca fragmentos
3. Alcance estricto — no tocar lo que no se pidió
4. Verificar después de cada cambio que el servidor arranca (local) o que el endpoint responde (producción) — no dar un fix por cerrado solo con relectura de líneas si es verificable en runtime
5. Explicar siempre, de forma breve, el **para qué**, **por qué** y **cómo** de cada acción propuesta
6. **Este documento (`tonaris-context.md`) lo actualiza Javier, no los agentes** — opencode no debe editarlo directamente, solo reportar avances para que se incorporen después. **Excepción:** cuando Javier pida explícitamente una actualización del documento (como en esta sesión), el agente puede editarlo sin esperar confirmación adicional.

---

## 10. COMANDOS DE REFERENCIA

```powershell
# Backend LOCAL (opcional si trabajas contra producción)
cd E:\TonarisBackend
npm run dev

# Panel admin React (necesario — aún no desplegado)
cd E:\TonarisBackend\admin
npm run dev

# App Tonaris — "Open with Live Server" sobre tonaris/index.html directamente
# (NO abrir la raíz del proyecto con Go Live genérico)

# Instalar en backend
cd E:\TonarisBackend && npm install <paquete>

# Instalar en admin
cd E:\TonarisBackend\admin && npm install <paquete>

# Git (siempre manual, lo ejecuta Javier)
git add .
git commit -m "feat: descripción"
git push origin main

# PostgreSQL LOCAL
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres -d tonaris_db

# Reiniciar nodemon (escribir en terminal donde corre)
rs

# Producción — health check
# GET https://tonaris.onrender.com/health
```

---

## 11. USUARIOS EN LA DB

| user_id | email | role | alias | notas |
|---------|-------|------|-------|-------|
| user_001 | javier@abarcar.co | admin | — | password: 123456 |
| 1782185263746 | produccionesabarcar@gmail.com | estudiante | JAV | tiene sesiones |
| usr_6yoo12o7 | javier.e.vargas.t@gmail.com | estudiante | JAVIER | sin sesiones |
| usr_5u4y4r64 | prueba123@abarcar.co | estudiante | JAVIERV | sin sesiones |
| testuser1 | testuser@test.com | estudiante | — | usuario de prueba para desarrollo local de gamificación, múltiples sesiones y exercise_results, rank Escuchador |

Nota: estos usuarios existían en la base local. La base de producción (Supabase) arrancó limpia — confirmar si se necesita migrar/recrear estos usuarios ahí o si se registrarán de nuevo naturalmente.

---

## 12. EVALUACIÓN GENERAL DEL PROYECTO (referencia)

| Área | Nivel |
|---|---|
| App Tonaris (Vanilla JS) | ⭐⭐⭐⭐⭐ Excepcional |
| Backend | ⭐⭐⭐⭐⭐ Excepcional (logs estructurados, Dockerizado, CI, en producción) |
| Auth | ⭐⭐⭐⭐⭐ Excepcional (recuperación de contraseña + rate limiting implementados) |
| Base de datos | ⭐⭐⭐⭐ Profesional (gestionada en producción, migraciones verificadas) |
| Panel Admin | ⭐⭐⭐ Funcional (sin desplegar aún) |
| Producción | ⭐⭐⭐⭐⭐ Excepcional (backend, DB y frontend principal en producción real) |
| UX / Landing | ⭐⭐⭐⭐⭐ Profesional (texto actualizado, CTAs visibles, marca reforzada) |
| Seguridad | ⭐⭐⭐⭐⭐ Excepcional (JWT, bcrypt, queries parametrizadas, rate limiting, helmet, recuperación de contraseña) |

---

## 13. ETAPA 7 — GAMIFICACIÓN (Fases 0-2, 5)

**Estado:** ✅ COMPLETADA
**Rama:** `feat/security-password-reset` (integrada con cambios de seguridad de Etapa 6.9)
**Contexto de datos reales:** solo existen 2 skill_id en `exercise_results` hoy (`2m`, `5m`) — los rangos altos de la escalera (Arquitecto Tonal, Oído Absoluto) son inalcanzables hasta que la futura modalidad de intervalos agregue más skills.

### 13.1 Migraciones nuevas

| Migración | Tabla/Columnas | Propósito |
|-----------|---------------|-----------|
| `010_create_skill_mastery.sql` | `skill_mastery(user_id, skill_id, mastery, accuracy_7d, avg_ms_7d, updated_at)` — PK compuesta `(user_id, skill_id)` | Almacena el nivel de dominio por habilidad, actualizado cada vez que se hace una sesión con exercise_results |
| `011_add_gamification_to_users.sql` | Columnas nuevas en `users`: `daily_goal INT DEFAULT 1`, `freezes_available INT DEFAULT 0`, `rank VARCHAR(30) DEFAULT 'Oyente'` | Meta diaria de sesiones, freezes acumulables, rango narrativo |
| `012_create_user_rewards.sql` | `user_rewards(reward_id, user_id, reward_type, unlocked_at)` | Tabla reservada para futuros logros/recompensas — sin lógica aún |

### 13.2 Nuevo archivo: `src/lib/ranks.js`

Escalera de rangos basada en cantidad de skills en estado `'mastered'` dentro de `skill_mastery`:

| Rango | Skills mastered | Visual |
|-------|----------------|--------|
| Oyente | 0 | Rango inicial por defecto |
| Escuchador | 1-2 | Primer logro |
| Afinador | 3-4 | |
| Armonista | 5-6 | |
| Arquitecto Tonal | 7-9 | |
| Oído Absoluto | 10+ | Rango máximo |

Exporta:
- `RANKS` — array de objetos `{ name, minMastered }`
- `getRankFromMasteredCount(count)` — recibe un entero, devuelve el nombre del rango

### 13.3 Endpoints nuevos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/analytics/trend/:userId/:skillId` | ✅ | Compara `avg(response_ms)` y accuracy de `exercise_results` en los últimos 7 días vs los 7 días anteriores (día -14 a -7), filtrando por `interval = skillId`. Responde: `{ skillId, accuracy_last_7d, accuracy_prev_7d, avg_ms_last_7d, avg_ms_prev_7d }` |
| GET | `/api/analytics/mastery/:userId` | ✅ | `SELECT * FROM skill_mastery WHERE user_id = $1`, devuelve array completo |
| PATCH | `/api/analytics/daily-goal/:userId` | ✅ | Actualiza `daily_goal` en `users`. Valida entero positivo. Verifica que `req.user.user_id === :userId` (no dejar que un usuario cambie la meta de otro) |

### 13.4 Cambios en `src/controllers/sessions.js` — `createSession`

Flujo completo por sesión:

1. **Insertar sesión** en `sessions` (como antes)
2. **Insertar exercise_results** — si el body incluye `results[]`, cada elemento (`{ interval, is_correct, response_ms }`) se inserta en `exercise_results` con `result_id = sessionId-index`
3. **Recalcular y UPSERT skill_mastery** — por cada `interval` único en los resultados:
   - Consulta `COUNT(*)`, accuracy y `avg(response_ms)` de los últimos 7 días en `exercise_results`
   - Determina mastery: `≥90% y ≥20 intentos → mastered`, `≥70% → stable`, `≥40% → learning`, else `unknown`
   - `INSERT ... ON CONFLICT (user_id, skill_id) DO UPDATE`
4. **Otorgar freeze por racha** — si es la primera sesión del día, calcula la racha de días consecutivos; si `streakDays > 0 && streakDays % 7 === 0 && freezes_available < 2`, incrementa `freezes_available` en 1 (capped a 2 vía `LEAST`)
5. **Actualizar rango** — cuenta `COUNT(*) WHERE mastery = 'mastered'` en `skill_mastery`, llama `getRankFromMasteredCount()`, hace `UPDATE users SET rank = $1 WHERE rank != $1` (solo escribe si cambió)

### 13.5 Cambios en `src/controllers/analytics.js`

**getStreak** — ahora además de devolver el array de días con sesiones en `data`, incluye en la respuesta:
- `freezes_available` (desde `users`)
- `daily_goal` (desde `users`)
- `used_freeze_today` — booleano: `true` si hoy no hay sesión, el usuario tiene freezes disponibles, y ayer sí hubo sesión (el freeze mantiene viva la racha)

La estructura `data` original (array de `{ day: "YYYY-MM-DD" }`) se mantiene intacta — los nuevos campos se agregan al mismo nivel del JSON.

**getSummary** — ahora también consulta y devuelve el campo `rank` del usuario al mismo nivel que `data`:
```json
{
  "status": 200,
  "data": { "total_sessions": ..., "avg_accuracy": ..., "best_score": ... },
  "rank": "Escuchador"
}
```

### 13.6 Estado de verificación en runtime

Todo probado en runtime local con el usuario de prueba `testuser1`:

| Prueba | Resultado |
|--------|-----------|
| `POST /api/sessions` con `results[]` | Sesión creada + exercise_results insertados |
| `skill_mastery` después de la sesión | UPSERT funciona — mastery calculado correctamente |
| Mastery alcanzado (2m: 97%, 29 intentos) | `mastery = 'mastered'` |
| Freeze otorgado (7 días de racha) | `freezes_available` incrementado de 0 a 1, log confirmado |
| Rango actualizado tras mastery | `rank` cambió de `Oyente` a `Escuchador` |
| `GET /api/analytics/streak/:userId` | Incluye `freezes_available: 1, daily_goal: 3, used_freeze_today: false` |
| `GET /api/analytics/summary/:userId` | Incluye `rank: "Escuchador"` |
| `GET /api/analytics/trend/:userId/:skillId` | Devuelve comparativa 7d vs prev 7d |
| `GET /api/analytics/mastery/:userId` | Lista completa de skill_mastery |
| `PATCH /api/analytics/daily-goal/:userId` | Actualiza correctamente, 403 si otro usuario intenta |
| `PATCH` con userId ajeno | 403 — `No puedes modificar la meta de otro usuario` |

### 13.7 Pendiente para futuro

- **Fase 3** — dificultad adaptativa en `tonaris/main.js` (ajuste dinámico según accuracy del estudiante)
- **Fase 4** — mecánicas dentro de sesión en `main.js` (feedback visual, temporizador por ejercicio)
- **Fase 6** — modalidad de intervalos (necesaria para que existan más de 2 skill_id y los rangos altos sean alcanzables)
- Decisión final sobre color Ciruela en la paleta de marca

---

*Documento actualizado al 11/07/2026.*
*Próxima acción: Ejecutar Fase 4 (Despliegue del panel admin en Netlify).*
