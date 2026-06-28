# Tonaris — Documento de Contexto para Agentes Autónomos
> Este documento es el contexto completo del proyecto Tonaris para ser leído por agentes como Cline u OpenCode.
> Contiene el estado actual, la arquitectura acordada, las convenciones de código y el plan detallado de lo que falta.
> Leer este documento completo antes de ejecutar cualquier acción.

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
| Runtime | Node.js | v24.16.0 | ✅ instalado |
| Framework backend | Express | latest | ✅ instalado |
| Base de datos | PostgreSQL | v18 | ✅ instalado y conectado |
| ORM | Prisma | — | ⏳ pendiente (post Etapa 5) |
| Auth | bcrypt + jsonwebtoken | latest | ✅ instalado |
| Frontend admin | React + Vite | Vite v8 | ✅ en `admin/` |
| Frontend app | Vanilla JS | — | ✅ en `tonaris/` |
| Despliegue | Docker + GitHub Actions | — | ⏳ Etapa 6 |
| TypeScript | — | — | ⏳ después de Etapa 6 |
| Cliente HTTP dev | Thunder Client | — | ✅ en VS Code |

**NOTAS CRÍTICAS DE ENTORNO:**
- `localhost` NO resuelve correctamente en este equipo para Node.js
- Usar siempre `127.0.0.1:3000` para llamadas directas a la API
- `localhost:5173` SÍ funciona para Vite
- `localhost:5500` es el puerto de Go Live (VS Code) para el frontend Tonaris
- Para levantar PostgreSQL en PowerShell si psql no responde: `$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"`
- Siempre se necesitan **DOS terminales** abiertas: una para el backend, una para el admin React

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
│   │   │   └── PrivateRoute.jsx       ← redirige a /login si no hay token (usa children)
│   │   ├── pages/
│   │   │   ├── Login.jsx              ← solo admins pueden entrar
│   │   │   ├── Users.jsx              ← tabla de todos los usuarios
│   │   │   ├── Sessions.jsx           ← búsqueda de sesiones por userId
│   │   │   ├── Progress.jsx           ← métricas de progreso por userId
│   │   │   ├── Analytics.jsx          ← racha, gráfica recharts, tabla de intervalos
│   │   │   └── Leaderboard.jsx        ← ranking por alias y precisión promedio
│   │   ├── App.jsx                    ← BrowserRouter, Nav, Routes
│   │   └── main.jsx
│   └── vite.config.js                 ← proxy /api → http://127.0.0.1:3000
├── tonaris/                            ← App Vanilla JS (frontend de entrenamiento)
│   ├── index.html                     ← SPA con 10 pantallas
│   ├── main.js                        ← 2763 líneas — motor completo
│   ├── api.js                         ← cliente HTTP hacia la API (nuevo)
│   ├── styles.css
│   └── Logo.svg / LogoSoloAbarcar.svg / LogoSoloTriangulo.svg
├── src/
│   ├── routes/
│   │   ├── users.js                   ← register, login, getAll, getById, updateAlias
│   │   ├── sessions.js                ← createSession, getSessionsByUser
│   │   ├── progress.js                ← getUserProgress
│   │   └── analytics.js              ← streak, history, intervals, summary, leaderboard
│   ├── controllers/
│   │   ├── users.js                   ← lógica de usuarios + auth + alias
│   │   ├── sessions.js                ← lógica de sesiones
│   │   ├── progress.js                ← lógica de progreso
│   │   └── analytics.js              ← lógica de analítica
│   ├── middleware/
│   │   ├── cors.js                    ← CORS global
│   │   ├── errorHandler.js            ← manejo global de errores
│   │   └── auth.js                    ← authenticate + authorizeAdmin
│   ├── db/
│   │   ├── pool.js                    ← pool de conexiones PostgreSQL (pg)
│   │   └── migrations/
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_sessions.sql
│   │       ├── 003_add_password_to_users.sql
│   │       ├── 004_remove_password_default.sql
│   │       ├── 005_add_role_to_users.sql
│   │       ├── 006_create_exercise_results.sql
│   │       ├── 007_add_alias_to_users.sql
│   │       └── migrationRunner.js     ← ejecuta migraciones en orden, registra en tabla migrations
│   └── app.js                         ← entrada principal
├── tonaris-context.md                 ← este documento
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

### 3.2 Variables de entorno (.env)

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tonaris_db
DB_USER=postgres
DB_PASSWORD=<password de instalación>
JWT_SECRET=tonaris_secret_super_seguro_2024
```

### 3.3 Base de datos — tonaris_db

**Tabla users:**
```sql
CREATE TABLE users (
  user_id   VARCHAR(20)  PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(20)  NOT NULL DEFAULT 'estudiante',
  alias     VARCHAR(10),
  created_at TIMESTAMP   DEFAULT NOW()
);
```

**Tabla sessions:**
```sql
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
```

**Tabla exercise_results:**
```sql
CREATE TABLE exercise_results (
  result_id   VARCHAR(30)  PRIMARY KEY,
  session_id  VARCHAR(20)  REFERENCES sessions(session_id),
  user_id     VARCHAR(20)  REFERENCES users(user_id),
  interval    VARCHAR(20)  NOT NULL,
  is_correct  BOOLEAN      NOT NULL,
  response_ms INT,
  created_at  TIMESTAMP    DEFAULT NOW()
);
```

**Tabla migrations (control interno):**
```sql
CREATE TABLE migrations (
  id         SERIAL      PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP  DEFAULT NOW()
);
```

### 3.4 API — Rutas disponibles

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/users/register` | ❌ | Registra usuario con bcrypt |
| POST | `/api/users/login` | ❌ | Login, devuelve JWT (7d) |
| GET | `/api/users/all` | ✅ admin | Lista todos los usuarios |
| GET | `/api/users/:userId` | ✅ | Obtiene usuario por ID |
| PATCH | `/api/users/:userId/alias` | ✅ | Actualiza alias del usuario |
| POST | `/api/sessions` | ✅ | Guarda resultado de una sesión |
| GET | `/api/sessions/:userId` | ✅ | Sesiones de un usuario |
| GET | `/api/progress/:userId` | ✅ | Progreso agregado de un usuario |
| GET | `/api/analytics/streak/:userId` | ✅ | Racha actual de días consecutivos |
| GET | `/api/analytics/history/:userId` | ✅ | Historial de precisión por sesión |
| GET | `/api/analytics/intervals/:userId` | ✅ | Precisión por intervalo musical |
| GET | `/api/analytics/summary/:userId` | ✅ | Resumen completo del estudiante |
| GET | `/api/analytics/leaderboard` | ✅ admin | Top usuarios por precisión |

**Autenticación:** JWT en header `Authorization: Bearer <token>`
**Roles:** `estudiante` (default) / `admin`

### 3.5 Frontend Tonaris (Vanilla JS)

**Pantallas en index.html:**
- `screen-splash` — inicio
- `screen-register` — registro (nombre, email, password, alias) ← conectado a API
- `screen-tonic` — selección de tónica
- `screen-key` — selección de tonalidad
- `screen-mode` — selección de modo
- `screen-ready` — preparación
- `screen-session` — ejercicios
- `screen-result` — resultados
- `screen-dash` — dashboard principal
- `screen-profile` — perfil
- `screen-leaderboard` — leaderboard ← pendiente conectar a API

**api.js — funciones disponibles:**
```javascript
apiLogin(email, password)         // POST /api/users/login
apiRegister(userId, name, email, password, alias)  // POST /api/users/register
apiSaveSession(session)           // POST /api/sessions
apiGetLeaderboard()               // GET /api/analytics/leaderboard
apiGetSummary(userId)             // GET /api/analytics/summary/:userId
apiSetAlias(userId, alias)        // PATCH /api/users/:userId/alias
apiLogout()                       // limpia localStorage
apiGetCurrentUser()               // lee tonaris_api_user de localStorage
```

**Estado de integración API en main.js:**
- ✅ `handleRegister` llama `apiRegister` + `apiLogin` tras registro
- ⏳ `screen-leaderboard` — pendiente conectar a `apiGetLeaderboard`
- ⏳ `screen-dash` — pendiente conectar a `apiGetSummary`
- ⏳ Al terminar sesión — pendiente llamar `apiSaveSession`

---

## 4. ESTADO DE ETAPAS

| Etapa | Nombre | Estado |
|-------|--------|--------|
| 1 | API base (Express, rutas, middlewares) | ✅ COMPLETADA |
| 2 | Persistencia (PostgreSQL, migraciones) | ✅ COMPLETADA |
| 3 | Auth (bcrypt, JWT, roles, rutas protegidas) | ✅ COMPLETADA |
| 4 | Administración (panel React, vistas CRUD) | ✅ COMPLETADA |
| 5 | Analítica (dashboards, métricas, integración Tonaris) | 🔄 EN PROGRESO |
| 6 | Producción (Docker, CI/CD, despliegue) | ⏳ PENDIENTE |

---

## 5. PLAN DETALLADO — LO QUE FALTA EN ETAPA 5

### 5.1 Conectar screen-leaderboard de Tonaris a la API

En `tonaris/main.js` buscar la función que renderiza `screen-leaderboard` y reemplazar la lectura de `localStorage.getItem('tonaris_leaderboard')` por una llamada a `apiGetLeaderboard()`.

El leaderboard de la API devuelve:
```json
[{ "user_id": "...", "name": "...", "alias": "JAV", "total_sessions": "1", "avg_accuracy": "80" }]
```

Mostrar `alias || name` en el ranking estilo arcade.

### 5.2 Conectar screen-dash a la API

En `tonaris/main.js` buscar la función `renderDashboard` y agregar una llamada a `apiGetSummary(userId)` para mostrar métricas reales del backend además del progreso local.

### 5.3 Guardar sesiones en PostgreSQL al terminar ejercicio

En `tonaris/main.js` buscar dónde se llama `sendToSheets` al terminar una sesión (alrededor de líneas 1341-1342 y 1562-1563) y agregar en paralelo una llamada a `apiSaveSession`:

```javascript
await apiSaveSession({
  session_id: String(Date.now()),
  user_id: State.progress.userId,
  tonality: State.session.tonality,
  correct: State.session.correct,
  total: State.session.total,
  duration: Math.round(State.session.duration),
  accuracy: Math.round((State.session.correct / State.session.total) * 100)
}).catch(() => {});
```

---

## 6. PLAN DETALLADO — ETAPA 6: PRODUCCIÓN

### 6.1 Dockerización

Crear `Dockerfile` en `E:\TonarisBackend\`:

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/app.js"]
```

Crear `docker-compose.yml`:

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: tonaris_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

### 6.2 CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml` con trigger en push a `main`.

### 6.3 Logs estructurados

Instalar `pino`: `npm install pino pino-pretty`
Reemplazar todos los `console.log` / `console.error` con logs estructurados.

### 6.4 Despliegue

- **API:** Railway (Node + PostgreSQL, deploy desde GitHub)
- **Panel admin:** Netlify o Vercel (build de `admin/`)
- **App Tonaris:** ya existe en `abarcaraudio.netlify.app`
- Variables de entorno en dashboard de Railway — nunca en el repo

### 6.5 Dominio

- API: `api.abarcaraudio.com`
- Panel admin: `admin.abarcaraudio.com`

---

## 7. DEUDA TÉCNICA

| Item | Prioridad | Cuándo resolver |
|------|-----------|----------------|
| JWT_SECRET hardcodeado en .env | Alta | Antes de Etapa 6 |
| PATH de PostgreSQL no permanente en Windows | Baja | Antes de Etapa 6 |
| Sin tests automatizados | Media | Etapa 6 |
| Prisma no introducido | Baja | Post Etapa 5 |

---

## 8. CONVENCIONES DE CÓDIGO

### 8.1 General

- **Sin TypeScript** hasta que la arquitectura esté completamente estable
- **Sin over-ingeniería:** la solución más simple que funcione
- **SQL puro** antes de Prisma
- Archivos siempre **completos** — nunca fragmentos

### 8.2 Backend (Node/Express)

- `routes/` solo define rutas → `controllers/` contiene toda la lógica
- Queries SQL con `pool.query()` — importar como `const pool = require('../db/pool')` (sin destructuring)
- Nunca exponer `password` en respuestas JSON
- IDs de usuario generados por el frontend: `usr_` + random string
- IDs de sesión: `String(Date.now())`

### 8.3 Migraciones SQL

- Nombre: `NNN_descripcion_snake_case.sql`
- Siempre usar `IF NOT EXISTS` / `IF EXISTS`
- Una migración = un cambio atómico
- Nunca modificar una migración ya ejecutada

### 8.4 Auth

- Token JWT: payload `{ user_id, role }`, expiración 7 días
- Header: `Authorization: Bearer <token>`
- `authenticate` siempre antes de `authorizeAdmin`

### 8.5 Frontend Admin (React)

- Estilos inline con objetos JS
- Paleta: fondo `#0f0f0f`, cards `#1a1a1a`, texto `#fff`, secundario `#aaa`, error `#ff4444`
- `apiFetch` de `src/api/client.js` para TODAS las llamadas
- `PrivateRoute` usa `children` (no Outlet)

### 8.6 Frontend Tonaris (Vanilla JS)

- **NO modificar** las secciones 1-4 de main.js (constantes pedagógicas, audio, SM-2)
- Todas las llamadas a la API van a través de `api.js`
- La integración con la API es **aditiva** — no reemplaza el localStorage existente
- Si la API falla, la app sigue funcionando con localStorage (graceful degradation)

### 8.7 Git — Conventional Commits

```
feat: nueva funcionalidad
fix: bug corregido
refactor: mejora estructural
chore: dependencias, configs
docs: documentación
```

---

## 9. PROTOCOLO DE TRABAJO PARA EL AGENTE

```
PENSAR → ANALIZAR → PROPONER PLAN → [confirmar si es cambio de alto riesgo] → EJECUTAR → VERIFICAR
```

### Reglas obligatorias

1. Leer este documento completo antes de cualquier acción
2. Nunca escribir código sin un plan claro
3. Alcance estricto: no tocar lo que no se pidió
4. Archivos completos: nunca fragmentos
5. Verificar después de cada cambio

### Niveles de riesgo

| Nivel | Tipo | Protocolo |
|-------|------|-----------|
| 1 — Bajo | Nuevo archivo | Ejecutar directo |
| 2 — Medio | Modificar controlador o ruta | Mostrar plan + ejecutar |
| 3 — Alto | Refactor, app.js, main.js, pool.js | Explicar impacto → esperar confirmación |

**ATENCIÓN con main.js de Tonaris:** Es un archivo de 2763 líneas crítico. Cualquier modificación es nivel 3. Siempre mostrar las líneas exactas a modificar antes de ejecutar.

---

## 10. COMANDOS DE REFERENCIA

```bash
# Levantar backend
cd E:\TonarisBackend
npm run dev

# Levantar panel admin
cd E:\TonarisBackend\admin
npm run dev

# Frontend Tonaris — abrir con Go Live en VS Code (puerto 5500)

# Instalar dependencia en backend
cd E:\TonarisBackend && npm install <paquete>

# Instalar dependencia en admin
cd E:\TonarisBackend\admin && npm install <paquete>

# Git
git add .
git commit -m "feat: descripción"
git push origin main

# PostgreSQL (si psql no responde)
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres

# Reiniciar nodemon
rs  (escribir en la terminal donde corre nodemon)
```

---

## 11. USUARIOS DE PRUEBA EN LA DB

| user_id | email | role | alias |
|---------|-------|------|-------|
| user_001 | javier@abarcar.co | admin | — |
| 1782185263746 | produccionesabarcar@gmail.com | estudiante | JAV |

Admin password: `123456`

---

*Documento actualizado al finalizar sesión del 28/06/2026.*
*Próxima acción: continuar Etapa 5 — conectar screen-leaderboard y screen-dash de Tonaris a la API, y guardar sesiones en PostgreSQL.*
