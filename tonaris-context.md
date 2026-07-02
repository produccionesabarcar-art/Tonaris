# Tonaris — Documento de Contexto para Agentes Autónomos
> Leer este documento completo antes de ejecutar cualquier acción.
> Contexto actualizado al 01/07/2026.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre:** AbarcarTonaris
**Descripción:** Plataforma web de entrenamiento auditivo basada en el círculo de quintas y el sistema pedagógico PAIEM de Abarcar Audio.
**Propietario:** Javier — fundador de Abarcar Audio, Bogotá, Colombia.
**Repositorio:** `https://github.com/produccionesabarcar-art/Tonaris.git`
**Rama activa:** `main`
**Ruta local:** `E:\TonarisBackend\`

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

**NOTAS CRÍTICAS DE ENTORNO:**
- `localhost` NO resuelve para Node.js en este equipo — usar `127.0.0.1:3000`
- `localhost:5173` SÍ funciona para Vite (panel admin)
- `127.0.0.1:5500` o `localhost:5500` para Go Live (app Tonaris) — abrir directo `tonaris/index.html`, no la raíz del proyecto
- El backend local y el de producción son independientes: correr `npm run dev` en la raíz **ya no es obligatorio** salvo que estés desarrollando/probando cambios de backend antes de subirlos
- El panel admin **sí sigue necesitando** `npm run dev` local porque aún no está desplegado
- Si psql no responde: `$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"`
- Para reiniciar nodemon escribir `rs` en la terminal donde corre

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
│   ├── index.html                     ← SPA con 10+ pantallas
│   ├── main.js                        ← motor completo (~2760 líneas tras Etapa 5)
│   ├── api.js                         ← cliente HTTP hacia la API (URL aún apunta a local — pendiente actualizar a Render)
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
│   │   └── logger.js                  ← instancia pino centralizada (NUEVO Etapa 6)
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
│   │       └── migrationRunner.js     ← usa logger
│   └── app.js                          ← usa logger, requiere ./lib/logger
├── Dockerfile                          ← NUEVO Etapa 6
├── .dockerignore                       ← NUEVO Etapa 6
├── .github/workflows/ci.yml            ← NUEVO Etapa 6 — npm ci + node --check en cada push a main
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
  user_id    VARCHAR(20)  PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'estudiante',
  alias      VARCHAR(10),
  created_at TIMESTAMP    DEFAULT NOW()
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

-- Tabla migrations (control interno)
CREATE TABLE migrations (
  id          SERIAL       PRIMARY KEY,
  filename    VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP    DEFAULT NOW()
);
```

**Nota:** las 7 migraciones ya corrieron exitosamente contra la base de producción en Supabase — verificado en Table Editor (`migrations`, `sessions`, `exercise_results`, `users` con relaciones correctas).

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

### 3.6 api.js — funciones disponibles en Tonaris

```javascript
apiLogin(email, password)
apiRegister(userId, name, email, password, alias)
apiSaveSession(session)   // payload debe usar userId, NO user_id
apiGetLeaderboard()
apiGetSummary(userId)
apiSetAlias(userId, alias)
apiLogout()
apiGetCurrentUser()  // lee tonaris_api_user de localStorage
```

**⏳ PENDIENTE:** `tonaris/api.js` sigue apuntando a la API local (`127.0.0.1:3000`). Falta actualizar la URL base para que apunte a `https://tonaris.onrender.com` en producción (ver Sección 6, Paso 4).

### 3.7 Estado de integración en main.js

| Función | Estado |
|---------|--------|
| `handleRegister` | ✅ llama apiRegister + apiLogin |
| `renderLeaderboard` | ✅ llama apiGetLeaderboard (pública, sin auth) |
| `renderDashboard` | ✅ llama apiGetSummary si hay usuario logueado |
| `endSession` | ✅ llama apiSaveSession — bug de payload (`user_id`→`userId`) corregido en Etapa 5 |

### 3.8 Pantallas en index.html

- `screen-splash` — inicio
- `screen-register` — registro (nombre, email, password, alias) ✅ conectado
- `screen-tonic` — selección de tónica
- `screen-key` — selección de tonalidad
- `screen-mode` — selección de modo
- `screen-ready` — preparación
- `screen-session` / `screen-exercise` — ejercicios activos — responsive ajustado en Etapa 5 (ver 5.4)
- `screen-result` — resultados de sesión
- `screen-dash` — dashboard ✅ conectado
- `screen-profile` — perfil
- `screen-leaderboard` — ranking ✅ conectado

---

## 4. ESTADO DE ETAPAS

| Etapa | Nombre | Estado |
|-------|--------|--------|
| 1 | API base | ✅ COMPLETADA |
| 2 | Persistencia (PostgreSQL, migraciones) | ✅ COMPLETADA |
| 3 | Auth (bcrypt, JWT, roles) | ✅ COMPLETADA |
| 4 | Administración (panel React) | ✅ COMPLETADA |
| 5 | Analítica + integración Tonaris | ✅ COMPLETADA |
| 6 | Producción (Docker, CI/CD, despliegue) | 🔄 EN PROGRESO — backend live, faltan frontends |

---

## 5. ETAPA 5 — COMPLETADA (resumen de lo implementado)

Todos los cambios se hicieron en `tonaris/main.js`, `tonaris/styles.css` e `index.html`, siguiendo el protocolo nivel 3 (líneas exactas + confirmación antes de aplicar).

### 5.1 Quitar tiempo mínimo de sesión + máximo de 5 minutos ✅
- `SESSION_MAX_SECS` = 5 min, `SESSION_MIN_SECS` = 0
- `updateStreak` ya no exige minutos mínimos acumulados — cualquier sesión cuenta para la racha
- Timer sin estado "warn" ni toast de "completaste el mínimo"
- `handleExitSession` limpiado: ya no tiene el chequeo hardcodeado de "10 minutos"

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

## 6. ETAPA 6 — PRODUCCIÓN (en progreso)

**Cambio de plan importante respecto a la versión anterior de este documento:** Railway ya no ofrece tier gratuito permanente (solo $5 de crédito el primer mes, luego $1/mes) — no alcanza para correr backend + Postgres 24/7 gratis. Se optó por **Render + Supabase**, que sí tienen tiers gratuitos reales y sostenibles.

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

### 6.6 Despliegue frontends — PENDIENTE
- [ ] **App Tonaris:** actualizar `tonaris/api.js` para que la URL base apunte a `https://tonaris.onrender.com` en vez de `127.0.0.1:3000`. Ya está desplegada en `abarcaraudio.netlify.app`, solo falta este cambio + redeploy.
- [ ] **Panel admin:** aún no desplegado. Plan: Netlify, build command `cd admin && npm ci && npm run build`, publish directory `admin/dist`. Actualizar `vite.config.js` / variable de entorno para que el proxy apunte a Render en vez de `127.0.0.1:3000`.

### 6.7 Dominios personalizados — PENDIENTE (opcional)
| Dominio | Servicio |
|---|---|
| `api.abarcaraudio.com` | Render (backend) |
| `admin.abarcaraudio.com` | Netlify (panel admin) |

SSL automático vía Let's Encrypt en ambos servicios.

---

## 7. DEUDA TÉCNICA

| Item | Prioridad | Estado |
|------|-----------|--------|
| JWT_SECRET hardcodeado/débil en `.env` local | Alta | ✅ Resuelto para producción — secreto fuerte (128 hex chars) generado y configurado solo en Render, nunca en el repo. El `.env` local puede quedarse como está (no se sube a git) |
| PATH PostgreSQL no permanente en Windows | Baja | Pendiente, no bloquea nada |
| Sin tests automatizados | Media | Pendiente — CI actual solo valida sintaxis |
| Frontends sin apuntar a la API de producción | Alta | Pendiente — próxima tarea inmediata |
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
| 3 — Alto | Refactor, app.js, main.js, pool.js, styles.css de la pantalla de ejercicios | Mostrar líneas exactas → esperar confirmación |

**⚠️ main.js de Tonaris es SIEMPRE nivel 3.**
Antes de cualquier modificación: mostrar las líneas exactas con números, el código actual y el código nuevo. Esperar confirmación explícita antes de escribir.

**Reglas:**
1. Leer `tonaris-context.md` completo antes de cualquier acción
2. Archivos siempre completos — nunca fragmentos
3. Alcance estricto — no tocar lo que no se pidió
4. Verificar después de cada cambio que el servidor arranca (local) o que el endpoint responde (producción) — no dar un fix por cerrado solo con relectura de líneas si es verificable en runtime
5. Explicar siempre, de forma breve, el **para qué**, **por qué** y **cómo** de cada acción propuesta

---

## 10. COMANDOS DE REFERENCIA

```powershell
# Backend LOCAL (opcional si trabajas contra producción)
cd E:\TonarisBackend
npm run dev

# Panel admin React (necesario — aún no desplegado)
cd E:\TonarisBackend\admin
npm run dev

# App Tonaris — abrir con Go Live en VS Code (puerto 5500)
# IMPORTANTE: abrir directo tonaris/index.html, no la raíz del proyecto

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

Nota: estos usuarios existían en la base local. La base de producción (Supabase) arrancó limpia — confirmar si se necesita migrar/recrear estos usuarios ahí o si se registrarán de nuevo naturalmente.

---

## 12. EVALUACIÓN GENERAL DEL PROYECTO (referencia)

| Área | Nivel |
|---|---|
| App Tonaris (Vanilla JS) | ⭐⭐⭐⭐⭐ Excepcional |
| Backend | ⭐⭐⭐⭐⭐ Excepcional (logs estructurados, Dockerizado, CI, en producción) |
| Auth | ⭐⭐⭐⭐ Profesional |
| Base de datos | ⭐⭐⭐⭐ Profesional (gestionada en producción, migraciones verificadas) |
| Panel Admin | ⭐⭐⭐ Funcional (sin desplegar aún) |
| Producción | ⭐⭐⭐⭐ (backend + DB reales y públicos; falta admin desplegado y frontends apuntando a la API real para llegar a 5) |

---

*Documento actualizado al 01/07/2026.*
*Próxima acción: actualizar `tonaris/api.js` con la URL de Render, desplegar el panel admin en Netlify, y opcionalmente configurar dominios personalizados.*
