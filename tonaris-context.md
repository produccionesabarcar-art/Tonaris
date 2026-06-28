# Tonaris — Documento de Contexto para Agentes Autónomos
> Este documento es el contexto completo del proyecto Tonaris para ser leído por agentes como Cline u OpenCode.
> Contiene el estado actual, la arquitectura acordada, las convenciones de código y el plan detallado de lo que falta.
> Leer este documento completo antes de ejecutar cualquier acción.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre:** AbarcarTonaris
**Descripción:** Plataforma web de entrenamiento auditivo basada en el círculo de quintas.
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
| Frontend admin | React + Vite | Vite v8 | ✅ instalado en `admin/` |
| Frontend app | Vanilla JS | — | 🔒 no tocar hasta Etapa 6 |
| Despliegue | Docker + GitHub Actions | — | ⏳ Etapa 6 |
| TypeScript | — | — | ⏳ después de Etapa 6 |
| Cliente HTTP dev | Thunder Client | — | ✅ en VS Code |

**NOTA CRÍTICA DE ENTORNO:**
- `localhost` NO resuelve correctamente en este equipo para Node.js
- Usar siempre `127.0.0.1:3000` para llamadas directas a la API
- `localhost:5173` SÍ funciona para Vite
- Para levantar PostgreSQL en PowerShell si psql no responde: `$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"`
- Siempre se necesitan **DOS terminales** abiertas: una para el backend, una para el admin

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
│   │   │   └── PrivateRoute.jsx       ← redirige a /login si no hay token
│   │   ├── pages/
│   │   │   ├── Login.jsx              ← solo admins pueden entrar
│   │   │   ├── Users.jsx              ← tabla de todos los usuarios
│   │   │   ├── Sessions.jsx           ← búsqueda de sesiones por userId
│   │   │   └── Progress.jsx           ← métricas de progreso por userId
│   │   ├── App.jsx                    ← BrowserRouter, Nav, Routes
│   │   └── main.jsx
│   └── vite.config.js                 ← proxy /api → http://127.0.0.1:3000
├── src/
│   ├── routes/
│   │   ├── users.js                   ← register, login, getAll, getById
│   │   ├── sessions.js                ← createSession, getSessionsByUser
│   │   └── progress.js                ← getUserProgress
│   ├── controllers/
│   │   ├── users.js                   ← lógica de usuarios + auth
│   │   ├── sessions.js                ← lógica de sesiones
│   │   └── progress.js                ← lógica de progreso
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
│   │       └── migrationRunner.js     ← ejecuta migraciones en orden, registra en tabla migrations
│   └── app.js                         ← entrada principal, monta middlewares y rutas
├── .env                               ← PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
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

**Tabla migrations (control interno):**
```sql
CREATE TABLE migrations (
  id         SERIAL      PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP  DEFAULT NOW()
);
```

### 3.4 API — Rutas disponibles

| Método | Ruta | Auth requerida | Descripción |
|--------|------|---------------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/users/register` | ❌ | Registra usuario, hashea password con bcrypt |
| POST | `/api/users/login` | ❌ | Login, devuelve JWT (7d) |
| GET | `/api/users/all` | ✅ admin | Lista todos los usuarios |
| GET | `/api/users/:userId` | ✅ | Obtiene usuario por ID |
| POST | `/api/sessions` | ✅ | Guarda resultado de una sesión |
| GET | `/api/sessions/:userId` | ✅ | Sesiones de un usuario |
| GET | `/api/progress/:userId` | ✅ | Progreso agregado de un usuario |

**Autenticación:** JWT en header `Authorization: Bearer <token>`
**Roles:** `estudiante` (default) / `admin`

### 3.5 Migraciones

El `migrationRunner.js` se ejecuta automáticamente al arrancar el servidor.
- Lee todos los `.sql` de `src/db/migrations/` en orden alfabético
- Ejecuta solo los que no estén registrados en la tabla `migrations`
- Registra cada migración ejecutada con timestamp
- Nunca ejecuta la misma migración dos veces

### 3.6 Panel Admin (React)

- Corre en `localhost:5173` con `npm run dev` desde `E:\TonarisBackend\admin`
- El `vite.config.js` tiene proxy: todas las llamadas a `/api/*` se redirigen a `http://127.0.0.1:3000`
- `client.js` centraliza todos los fetch: agrega automáticamente el token del localStorage
- Token guardado en `localStorage` como `tonaris_token`
- Usuario guardado en `localStorage` como `tonaris_user` (JSON)
- `PrivateRoute` redirige a `/login` si no hay token
- Solo usuarios con `role === 'admin'` pueden ingresar al panel

---

## 4. ESTADO DE ETAPAS

| Etapa | Nombre | Estado |
|-------|--------|--------|
| 1 | API base (Express, rutas, middlewares) | ✅ COMPLETADA |
| 2 | Persistencia (PostgreSQL, migraciones) | ✅ COMPLETADA |
| 3 | Auth (bcrypt, JWT, roles, rutas protegidas) | ✅ COMPLETADA |
| 4 | Administración (panel React, vistas CRUD) | ✅ COMPLETADA |
| 5 | Analítica (dashboards, métricas avanzadas) | ⬅️ SIGUIENTE |
| 6 | Producción (Docker, CI/CD, despliegue) | ⏳ PENDIENTE |

---

## 5. PLAN DETALLADO — ETAPA 5: ANALÍTICA

**Objetivo:** Mostrar progreso y rendimiento de cada estudiante con métricas útiles para la educación musical.

### 5.1 Backend — Nuevas rutas y queries

#### 5.1.1 Migración nueva: tabla `exercise_results`

Crear `src/db/migrations/006_create_exercise_results.sql`:

```sql
CREATE TABLE IF NOT EXISTS exercise_results (
  result_id   VARCHAR(30)  PRIMARY KEY,
  session_id  VARCHAR(20)  REFERENCES sessions(session_id),
  user_id     VARCHAR(20)  REFERENCES users(user_id),
  interval    VARCHAR(20)  NOT NULL,
  is_correct  BOOLEAN      NOT NULL,
  response_ms INT,
  created_at  TIMESTAMP    DEFAULT NOW()
);
```

Esta tabla permite métricas por intervalo musical, no solo por sesión.

#### 5.1.2 Nuevas rutas de analítica

Crear `src/routes/analytics.js` con estas rutas:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/analytics/streak/:userId` | ✅ | Racha actual de días consecutivos |
| GET | `/api/analytics/history/:userId` | ✅ | Historial de precisión por sesión (para gráfica) |
| GET | `/api/analytics/intervals/:userId` | ✅ | Precisión por intervalo musical |
| GET | `/api/analytics/summary/:userId` | ✅ | Resumen completo del estudiante |
| GET | `/api/analytics/leaderboard` | ✅ admin | Top usuarios por precisión promedio |

#### 5.1.3 Queries SQL para cada ruta

**Racha (streak):**
```sql
SELECT DATE(created_at) as day
FROM sessions
WHERE user_id = $1
GROUP BY DATE(created_at)
ORDER BY day DESC;
```
Calcular en JS: contar días consecutivos desde hoy hacia atrás.

**Historial para gráfica:**
```sql
SELECT
  session_id,
  accuracy,
  tonality,
  correct,
  total,
  duration,
  created_at
FROM sessions
WHERE user_id = $1
ORDER BY created_at ASC
LIMIT 30;
```

**Precisión por intervalo:**
```sql
SELECT
  interval,
  COUNT(*) as total,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
  ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as accuracy
FROM exercise_results
WHERE user_id = $1
GROUP BY interval
ORDER BY accuracy ASC;
```

**Leaderboard:**
```sql
SELECT
  u.user_id,
  u.name,
  COUNT(s.session_id) as total_sessions,
  ROUND(AVG(s.accuracy)) as avg_accuracy
FROM users u
LEFT JOIN sessions s ON u.user_id = s.user_id
WHERE u.role = 'estudiante'
GROUP BY u.user_id, u.name
ORDER BY avg_accuracy DESC
LIMIT 10;
```

### 5.2 Frontend Admin — Nuevas vistas

#### 5.2.1 Vista `Analytics.jsx`

Reemplazar la vista `Progress.jsx` actual o agregar una nueva ruta `/analytics` con:
- Buscador por userId
- Card de racha actual (ej: "🔥 5 días consecutivos")
- Gráfica de línea: precisión por sesión en el tiempo
- Tabla de precisión por intervalo musical (ordenada de peor a mejor)
- Card resumen: total sesiones, promedio, mejor marca

**Librería de gráficas a usar:** Recharts
```bash
npm install recharts
```
(ejecutar en `E:\TonarisBackend\admin`)

#### 5.2.2 Vista `Leaderboard.jsx`

- Ruta `/leaderboard` en el panel admin
- Tabla con top 10 estudiantes por precisión promedio
- Columnas: posición, nombre, sesiones totales, precisión promedio
- Solo visible para admin (ya protegido por PrivateRoute + authorizeAdmin en backend)

#### 5.2.3 Actualizar `App.jsx`

Agregar al nav: `Analítica` → `/analytics` y `Leaderboard` → `/leaderboard`

### 5.3 Dashboard del estudiante (vista pública)

Esta es la parte más importante de Etapa 5: el estudiante puede ver su propio progreso dentro de la app Tonaris (Vanilla JS), sin acceso al panel admin.

**Flujo:**
1. El estudiante inicia sesión desde la app Tonaris (nuevo formulario en `index.html`)
2. Recibe su JWT y lo guarda en localStorage
3. La app llama a `GET /api/analytics/summary/:userId` con su token
4. Se muestra un widget de progreso en la app

**Archivos a modificar en Tonaris (Vanilla JS):**
- `index.html` — agregar sección de login y widget de progreso
- `main.js` — agregar lógica de auth y fetch de analytics

**IMPORTANTE:** Esta es la única parte de Etapa 5 que toca el frontend Vanilla JS de Tonaris. Hacerlo con cuidado, sin romper la lógica existente del entrenamiento auditivo.

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

Crear `.github/workflows/deploy.yml`:
- Trigger: push a `main`
- Steps: instalar dependencias, correr tests (cuando existan), build, deploy

### 6.3 Logs estructurados

Instalar `pino` o `winston`:
```bash
npm install pino pino-pretty
```
Reemplazar todos los `console.log` / `console.error` con logs estructurados JSON.

### 6.4 Despliegue

Plataforma recomendada: **Railway** (soporta Node + PostgreSQL, deploy desde GitHub en un click)
- Alternativas: Render, Fly.io, VPS propio
- El panel admin (`admin/`) se despliega por separado en **Netlify** o **Vercel**
- Variables de entorno se configuran en el dashboard de Railway, nunca en el repo

### 6.5 Dominio

- API: `api.abarcaraudio.com` o `tonaris-api.abarcaraudio.com`
- Panel admin: `admin.abarcaraudio.com`
- App Tonaris: ya existe en `abarcaraudio.netlify.app`

---

## 7. DEUDA TÉCNICA PENDIENTE

| Item | Prioridad | Cuándo resolver |
|------|-----------|----------------|
| PATH de PostgreSQL no permanente en Windows | Baja | Antes de Etapa 6 |
| JWT_SECRET hardcodeado en .env | Alta | Antes de Etapa 6 |
| Sin tests automatizados | Media | Etapa 6 |
| Prisma no introducido | Baja | Post Etapa 5 |
| `node_modules` del admin no en .gitignore raíz | Baja | Próximo commit |

---

## 8. CONVENCIONES DE CÓDIGO

### 8.1 General

- **Sin TypeScript** hasta que la arquitectura esté completamente estable (post Etapa 6)
- **Sin over-ingeniería:** la solución más simple que funcione es la correcta
- **SQL puro** antes de introducir Prisma
- Archivos siempre **completos** — nunca entregar fragmentos
- Un archivo modificado = un propósito claro

### 8.2 Backend (Node/Express)

- Estructura: `routes/` solo define rutas → `controllers/` contiene toda la lógica
- Middlewares en `middleware/` — nunca inline en `app.js`
- Queries SQL directamente en controllers con `pool.query()`
- Manejo de errores: siempre `try/catch` + `next(err)` para que llegue al `errorHandler`
- Códigos de error PostgreSQL: `23505` = unique violation (email duplicado)
- Nunca exponer `password` en respuestas JSON
- IDs de usuario: strings tipo `user_001`, `user_002` — no UUIDs por ahora
- IDs de sesión: timestamp en ms como string (ej: `"1782185263746"`)

### 8.3 Migraciones SQL

- Nombre: `NNN_descripcion_snake_case.sql` — siempre con prefijo numérico de 3 dígitos
- Siempre usar `IF NOT EXISTS` / `IF EXISTS` para idempotencia
- Una migración = un cambio atómico
- Nunca modificar una migración ya ejecutada — crear una nueva

### 8.4 Auth

- Token JWT: payload `{ user_id, role }`, expiración 7 días
- Header: `Authorization: Bearer <token>`
- Middleware `authenticate`: verifica token, adjunta `req.user`
- Middleware `authorizeAdmin`: verifica `req.user.role === 'admin'`
- Orden en rutas: `authenticate` siempre antes de `authorizeAdmin`

### 8.5 Frontend Admin (React)

- Componentes funcionales con hooks — sin clases
- Estilos inline con objetos JS (sin CSS externo por ahora, sin Tailwind)
- Paleta: fondo `#0f0f0f`, cards `#1a1a1a`, texto `#fff`, secundario `#aaa`, error `#ff4444`
- Sin librerías de UI externas excepto `recharts` para gráficas
- `apiFetch` de `src/api/client.js` para TODAS las llamadas a la API — nunca `fetch` directo
- Token en `localStorage` como `tonaris_user` y `tonaris_token`
- `PrivateRoute` envuelve todas las rutas protegidas

### 8.6 Git — Conventional Commits

```
feat: nueva funcionalidad
fix: bug corregido
refactor: mejora estructural sin cambiar comportamiento
chore: dependencias, configs, limpieza
docs: documentación
```

Hacer commit al final de cada bloque funcional completo — nunca con el servidor caído o código roto.

---

## 9. PROTOCOLO DE TRABAJO PARA EL AGENTE

```
PENSAR → ANALIZAR → PROPONER PLAN → [confirmar si es cambio de alto riesgo] → EJECUTAR → VERIFICAR
```

### Reglas obligatorias

1. **Leer este documento completo** antes de cualquier acción
2. **Nunca escribir código sin un plan claro** del archivo que se va a modificar y por qué
3. **Alcance estricto:** no tocar lo que no se pidió
4. **No romper lo existente:** si un cambio afecta código existente, advertirlo antes
5. **Cambios mínimos:** la mejor solución modifica la menor cantidad de código posible
6. **Archivos completos:** siempre entregar el archivo completo, nunca fragmentos
7. **Verificar después de cada cambio:** confirmar que el servidor arranca y la ruta responde

### Niveles de riesgo

| Nivel | Tipo | Protocolo |
|-------|------|-----------|
| 1 — Bajo | Nuevo archivo sin afectar existentes | Ejecutar directo |
| 2 — Medio | Modificar un controlador o ruta | Mostrar plan + ejecutar |
| 3 — Alto | Refactor, cambio de arquitectura, modificar `app.js` o `pool.js` | Explicar impacto → listar archivos → esperar confirmación |

### Al final de cada bloque

```
## Estado
✅ Completado: ...
⏳ Pendiente: ...
⚠️  Deuda técnica: ...
💾 Git: <mensaje de commit sugerido>
```

---

## 10. COMANDOS DE REFERENCIA

```bash
# Levantar backend
cd E:\TonarisBackend
npm run dev

# Levantar panel admin
cd E:\TonarisBackend\admin
npm run dev

# Instalar dependencia en backend
cd E:\TonarisBackend
npm install <paquete>

# Instalar dependencia en admin
cd E:\TonarisBackend\admin
npm install <paquete>

# Git
git add .
git commit -m "feat: descripción"
git push origin main

# PostgreSQL (si psql no responde)
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
psql -U postgres
```

---

*Documento generado al finalizar Etapa 4. Próxima acción: iniciar Etapa 5 — Analítica.*
