# Tonaris — Documento de Contexto para Agentes Autónomos
> Leer este documento completo antes de ejecutar cualquier acción.
> Contexto actualizado al 29/06/2026.

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
| Base de datos | PostgreSQL | v18 | ✅ |
| ORM | Prisma | — | ⏳ post Etapa 5 |
| Auth | bcrypt + jsonwebtoken | latest | ✅ |
| Frontend admin | React + Vite | Vite v8 | ✅ en `admin/` |
| Frontend app | Vanilla JS | — | ✅ en `tonaris/` |
| Despliegue | Docker + GitHub Actions | — | ⏳ Etapa 6 |
| Cliente HTTP dev | Thunder Client | — | ✅ en VS Code |

**NOTAS CRÍTICAS DE ENTORNO:**
- `localhost` NO resuelve para Node.js en este equipo — usar `127.0.0.1:3000`
- `localhost:5173` SÍ funciona para Vite (panel admin)
- `127.0.0.1:5500` o `localhost:5500` para Go Live (app Tonaris)
- Siempre necesitas **DOS terminales**: una para backend, una para admin React
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
│   └── vite.config.js                 ← proxy /api → http://127.0.0.1:3000
├── tonaris/                            ← App Vanilla JS
│   ├── index.html                     ← SPA con 10+ pantallas
│   ├── main.js                        ← ~2770 líneas — motor completo
│   ├── api.js                         ← cliente HTTP hacia la API
│   └── styles.css
├── src/
│   ├── routes/
│   │   ├── users.js                   ← register, login, getAll, getById, updateAlias
│   │   ├── sessions.js                ← createSession, getSessionsByUser
│   │   ├── progress.js                ← getUserProgress
│   │   └── analytics.js              ← streak, history, intervals, summary, leaderboard
│   ├── controllers/
│   │   ├── users.js
│   │   ├── sessions.js
│   │   ├── progress.js
│   │   └── analytics.js
│   ├── middleware/
│   │   ├── cors.js
│   │   ├── errorHandler.js
│   │   └── auth.js                    ← authenticate + authorizeAdmin
│   ├── db/
│   │   ├── pool.js                    ← exporta pool directamente (sin destructuring)
│   │   └── migrations/
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_sessions.sql
│   │       ├── 003_add_password_to_users.sql
│   │       ├── 004_remove_password_default.sql
│   │       ├── 005_add_role_to_users.sql
│   │       ├── 006_create_exercise_results.sql
│   │       ├── 007_add_alias_to_users.sql
│   │       └── migrationRunner.js
│   └── app.js
├── tonaris-context.md
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

### 3.4 API — Rutas disponibles

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/users/register` | ❌ | Registra usuario con bcrypt |
| POST | `/api/users/login` | ❌ | Login, devuelve JWT 7d |
| GET | `/api/users/all` | ✅ admin | Lista todos los usuarios |
| GET | `/api/users/:userId` | ✅ | Usuario por ID |
| PATCH | `/api/users/:userId/alias` | ✅ | Actualiza alias |
| POST | `/api/sessions` | ✅ | Guarda sesión |
| GET | `/api/sessions/:userId` | ✅ | Sesiones de un usuario |
| GET | `/api/progress/:userId` | ✅ | Progreso agregado |
| GET | `/api/analytics/streak/:userId` | ✅ | Racha de días consecutivos |
| GET | `/api/analytics/history/:userId` | ✅ | Historial por sesión |
| GET | `/api/analytics/intervals/:userId` | ✅ | Precisión por intervalo |
| GET | `/api/analytics/summary/:userId` | ✅ | Resumen del estudiante |
| GET | `/api/analytics/leaderboard` | ❌ | Ranking público (sin auth) |

### 3.5 api.js — funciones disponibles en Tonaris

```javascript
apiLogin(email, password)
apiRegister(userId, name, email, password, alias)
apiSaveSession(session)
apiGetLeaderboard()
apiGetSummary(userId)
apiSetAlias(userId, alias)
apiLogout()
apiGetCurrentUser()  // lee tonaris_api_user de localStorage
```

### 3.6 Estado de integración en main.js

| Función | Estado |
|---------|--------|
| `handleRegister` | ✅ llama apiRegister + apiLogin |
| `renderLeaderboard` | ✅ llama apiGetLeaderboard (pública, sin auth) |
| `renderDashboard` | ✅ llama apiGetSummary si hay usuario logueado |
| Al terminar sesión | ✅ llama apiSaveSession después de sendToSheets |

### 3.7 Pantallas en index.html

- `screen-splash` — inicio
- `screen-register` — registro (nombre, email, password, alias) ✅ conectado
- `screen-tonic` — selección de tónica
- `screen-key` — selección de tonalidad
- `screen-mode` — selección de modo
- `screen-ready` — preparación
- `screen-session` — ejercicios activos
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
| 5 | Analítica + integración Tonaris | 🔄 EN PROGRESO |
| 6 | Producción (Docker, CI/CD) | ⏳ PENDIENTE |

---

## 5. MEJORAS PENDIENTES — ETAPA 5 (PRÓXIMA SESIÓN)

Estas 4 mejoras son el trabajo inmediato. Todas van en `tonaris/main.js` y `tonaris/styles.css`.

**REGLA CRÍTICA:** main.js tiene ~2770 líneas y es nivel 3 de riesgo.
Antes de modificar cualquier función: mostrar líneas exactas y esperar confirmación.

---

### 5.1 Quitar tiempo mínimo de sesión + máximo de 5 minutos

**Problema actual:**
- La función `updateStreak` (línea ~598) requiere 10 minutos acumulados para contar la racha (`if (dailyMins >= 10)`)
- No hay límite máximo de sesión

**Qué cambiar:**
1. En `updateStreak`, eliminar la condición `dailyMins >= 10` — cualquier sesión completada cuenta
2. Agregar un timer de 5 minutos (300 segundos) en la función que inicia la sesión
3. Cuando el timer llega a 0, cerrar la sesión automáticamente y guardar el puntaje parcial
4. El puntaje es proporcional: más tiempo = más ejercicios completados = más puntos

**Funciones a buscar:**
- `updateStreak` (~línea 598) — quitar condición de 10 minutos
- Función que inicia sesión / muestra `screen-session` — agregar timer de 5 min
- Timer visual ya existe en el HTML (`<div class="timer-bar">`) — conectarlo

---

### 5.2 Quitar mensaje post-sesión "vuelve en 1 hora"

**Problema actual:**
- Después de completar una sesión aparece un mensaje recomendando esperar antes de volver a entrenar
- Esto desincentiva la competencia y el re-entrenamiento

**Qué cambiar:**
- Buscar en main.js: "hora", "cooldown", "espera", "vuelve", "recomend" cerca del final de sesión o en `renderDashboard`
- Eliminar o comentar ese bloque
- Reemplazar por mensaje motivacional hacia el leaderboard

---

### 5.3 Auto-avance en respuesta correcta / botón siguiente en incorrecta

**Problema actual:**
- Actualmente siempre aparece un botón para avanzar al siguiente ejercicio

**Comportamiento deseado:**
- ✅ Respuesta correcta → avanzar automáticamente después de ~800ms (dar tiempo para feedback visual)
- ❌ Respuesta incorrecta → mostrar botón "Siguiente" para que el estudiante pueda ver por qué falló

**Funciones a buscar:**
- `handleMelodicAnswer` — maneja respuestas de ejercicios melódicos
- `handleHarmonicAnswer` — maneja respuestas de ejercicios armónicos
- `handleJourneyAnswer` — maneja respuestas de viajes armónicos
- Buscar dónde se llama `nextExercise` o se muestra el botón siguiente
- En respuesta correcta: agregar `setTimeout(() => nextExercise(), 800)`
- En respuesta incorrecta: mostrar botón y esperar click

---

### 5.4 Responsive — todo en una pantalla sin scroll en móvil

**Problema actual:**
- En pantallas pequeñas las opciones de respuesta se salen de la pantalla
- El usuario tiene que hacer scroll para ver todas las opciones
- Esto rompe la experiencia de entrenamiento auditivo

**Qué cambiar en styles.css:**
- Agregar/mejorar media queries para pantallas < 400px y < 600px
- En `screen-session`: usar `max-height: 100dvh` y `overflow: hidden`
- Reducir `font-size`, `padding` y `gap` en móvil
- Las opciones de respuesta deben caber en pantalla sin scroll
- Usar `flex-wrap` o reducir tamaño de botones de opciones en móvil

**Archivos afectados:**
- `tonaris/styles.css` — agregar media queries
- `tonaris/index.html` — posiblemente ajustar clases

---

## 6. PLAN ETAPA 6 — PRODUCCIÓN

### 6.1 Dockerización

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/app.js"]
```

### 6.2 CI/CD — GitHub Actions
Trigger en push a `main`. Steps: install, test, build, deploy.

### 6.3 Logs estructurados
```bash
npm install pino pino-pretty
```
Reemplazar todos los `console.log/error` con logs JSON.

### 6.4 Despliegue
- **API:** Railway (Node + PostgreSQL desde GitHub)
- **Panel admin:** Netlify o Vercel (build de `admin/`)
- **App Tonaris:** ya en `abarcaraudio.netlify.app`
- Variables de entorno en dashboard de Railway — nunca en repo

### 6.5 Dominio
- API: `api.abarcaraudio.com`
- Panel admin: `admin.abarcaraudio.com`

---

## 7. DEUDA TÉCNICA

| Item | Prioridad | Cuándo |
|------|-----------|--------|
| JWT_SECRET hardcodeado en .env | Alta | Antes de Etapa 6 |
| PATH PostgreSQL no permanente en Windows | Baja | Antes de Etapa 6 |
| Sin tests automatizados | Media | Etapa 6 |
| Prisma no introducido | Baja | Post Etapa 5 |

---

## 8. CONVENCIONES DE CÓDIGO

### Backend (Node/Express)
- `routes/` solo define rutas → `controllers/` contiene toda la lógica
- `const pool = require('../db/pool')` — sin destructuring
- Nunca exponer `password` en respuestas JSON
- IDs de usuario: `usr_` + random string (generado en frontend)
- IDs de sesión: `String(Date.now())`

### Migraciones SQL
- Nombre: `NNN_descripcion_snake_case.sql`
- Siempre `IF NOT EXISTS` / `IF EXISTS`
- Una migración = un cambio atómico
- Nunca modificar migración ya ejecutada

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

### Git
```
feat: nueva funcionalidad
fix: bug corregido
refactor: mejora estructural
chore: dependencias, configs
docs: documentación
```

---

## 9. PROTOCOLO PARA AGENTES

```
PENSAR → ANALIZAR → PROPONER PLAN → [confirmar si nivel 3] → EJECUTAR → VERIFICAR
```

| Nivel | Tipo | Protocolo |
|-------|------|-----------|
| 1 — Bajo | Nuevo archivo | Ejecutar directo |
| 2 — Medio | Modificar controlador o ruta | Mostrar plan + ejecutar |
| 3 — Alto | Refactor, app.js, main.js, pool.js | Mostrar líneas exactas → esperar confirmación |

**⚠️ main.js de Tonaris es SIEMPRE nivel 3.**
Antes de cualquier modificación: mostrar las líneas exactas con números, el código actual y el código nuevo. Esperar confirmación explícita antes de escribir.

**Reglas:**
1. Leer tonaris-context.md completo antes de cualquier acción
2. Archivos siempre completos — nunca fragmentos
3. Alcance estricto — no tocar lo que no se pidió
4. Verificar después de cada cambio que el servidor arranca

---

## 10. COMANDOS DE REFERENCIA

```powershell
# Backend
cd E:\TonarisBackend
npm run dev

# Panel admin React
cd E:\TonarisBackend\admin
npm run dev

# App Tonaris — abrir con Go Live en VS Code (puerto 5500)

# Instalar en backend
cd E:\TonarisBackend && npm install <paquete>

# Instalar en admin
cd E:\TonarisBackend\admin && npm install <paquete>

# Git
git add .
git commit -m "feat: descripción"
git push origin main

# PostgreSQL
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres -d tonaris_db

# Reiniciar nodemon (escribir en terminal donde corre)
rs
```

---

## 11. USUARIOS EN LA DB

| user_id | email | role | alias | notas |
|---------|-------|------|-------|-------|
| user_001 | javier@abarcar.co | admin | — | password: 123456 |
| 1782185263746 | produccionesabarcar@gmail.com | estudiante | JAV | tiene 1 sesión |
| usr_6yoo12o7 | javier.e.vargas.t@gmail.com | estudiante | JAVIER | sin sesiones |
| usr_5u4y4r64 | prueba123@abarcar.co | estudiante | JAVIERV | sin sesiones |

---

*Documento actualizado al 29/06/2026.*
*Próxima acción: implementar las 4 mejoras de la sección 5 en tonaris/main.js y tonaris/styles.css.*
