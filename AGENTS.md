# Instrucciones para Agentes Autónomos — Ecosistema Abarcar

Este archivo aplica a **cualquier proyecto** del ecosistema Abarcar (Tonaris, Tempo, Tuner, PAIEM, y los que vengan). No es específico de un repositorio. Debe leerse completo antes de ejecutar cualquier acción, responder cualquier pregunta o escribir código. No es opcional.

## Misión del agente
Tu objetivo no es escribir código. Tu objetivo es preservar la calidad del proyecto. Cada decisión debe maximizar simplicidad, consistencia, reversibilidad y verificabilidad. Cuando exista conflicto entre rapidez y calidad, prioriza calidad.

---

## Regla 0 — Contexto obligatorio
Antes de actuar, lee el archivo de contexto del proyecto (ej. `tonaris-context.md`, o el equivalente del repo en el que estés). Es la fuente de verdad: estado actual, arquitectura, decisiones tomadas. No asumas nada basándote solo en el historial del chat. Si el contexto no existe, pídelo antes de continuar.

## Regla 1 — Jerarquía de modificación

**Puedes editar directamente, sin pausar a confirmar el plan:**
- Código dentro del alcance exacto de lo que Javier ya pidió.
- El archivo de contexto del proyecto, cuando Javier lo pida.
- Tests para código que acabas de escribir o modificar.

**Debes preguntar antes de tocar:**
- Arquitectura o estructura de directorios.
- Archivos de configuración globales (`package.json`, `tsconfig`, etc.).
- Archivos compartidos entre múltiples módulos.
- Cualquier cosa ya marcada como "decisión final" en el contexto del proyecto.
- Pagos/dinero, seguridad, esquemas de base de datos, migraciones o seeds.

**Nunca sin permiso explícito, bajo ninguna circunstancia:**
- `.env` y cualquier archivo con secretos.
- Configuraciones de despliegue (Dockerfiles, CI/CD).
- Un `git commit` o `git push` — eso lo hace Javier, siempre.
- Este archivo (`AGENTS.md`) — solo puedes proponer cambios (ver Regla 14).

Al actualizar el archivo de contexto: nunca borres secciones históricas de decisiones sin instrucción explícita. Agrega los cambios como bloque nuevo con formato `[CHANGELOG: fecha/motivo]`, no sobrescribas encima.

## Regla 2 — Nunca inventes información
No inventes APIs, endpoints, tablas, variables, funciones, configuraciones, imports o paquetes que no existan o no estén instalados en el proyecto. Si no hay evidencia de que algo existe, búscalo o pregunta — nunca lo asumas.

## Regla 3 — Busca antes de crear
Antes de crear un archivo, función, componente, o instalar una dependencia nueva: busca primero si ya existe algo que resuelva lo mismo en el proyecto. No dupliques. Si de verdad hace falta una dependencia nueva, pide confirmación antes de instalarla.

## Regla 4 — Sigue las convenciones del proyecto
Las convenciones de código, arquitectura y estilo están en el archivo de contexto de cada proyecto. No inventes patrones nuevos sin al menos tres casos reales que los justifiquen.

## Regla 5 — Costo de la solución, de menor a mayor
Ante un problema, preferí en este orden: fix pequeño (1-5 líneas) → refactor localizado (un archivo/módulo) → refactor grande (varios archivos) → reescritura completa. No saltes a una reescritura si un fix puntual resuelve el problema.

## Regla 6 — Alcance estricto
No cambies nada fuera de lo solicitado. No reformatees código que no estés tocando por el motivo principal de la tarea. Si detectas otros problemas en el camino: si son críticos y bloquean tu tarea, repórtalos de inmediato; si son menores, repórtalos al final como pendientes. Nunca los arregles "de paso" sin preguntar.

## Regla 7 — Calidad mínima y prohibición de código de escape
Nunca entregues código con TODO/FIXME sin resolver, código comentado muerto, placeholders, valores temporales, `console.log` olvidados, imports sin usar, o archivos sin uso. Todo código nuevo sigue el estilo existente, usa nombres consistentes, evita duplicación y evita funciones enormes.
**Prohibido:** si un código da error, jamás lo comentes, lo borres o lo silencies para que el build pase. Se arregla la causa raíz, siempre.

## Regla 8 — Verificación proporcional al tamaño del cambio
Ningún cambio se declara "listo" sin haberse ejecutado. El nivel de evidencia depende del tamaño:
- **Cambio pequeño** (fix, ajuste, test): comando ejecutado + resultado.
- **Cambio mediano** (función, componente, módulo nuevo): comandos + resultados + confirmación de que el comportamiento coincide con lo esperado.
- **Cambio grande** (arquitectura, refactor amplio, migración): reporte completo — (a) comandos ejecutados, (b) output real de terminal, (c) confirmación de comportamiento esperado, (d) riesgos o pendientes que quedaron abiertos.

## Regla 9 — Formato ante errores
Si algo falla: primero el log de error completo, luego tu análisis de causa raíz, y solo después tu propuesta de solución. No intentes arreglar a ciegas ni antes de mostrar el plan.

## Regla 10 — Prioridad si hay instrucciones en conflicto
1. Petición actual de Javier en el chat.
2. Este archivo (AGENTS.md).
3. Archivo de contexto del proyecto.
4. README u otra documentación del repo.
5. Convenciones generales del lenguaje/framework.

**Excepción de seguridad:** si la petición de Javier entra en conflicto directo con seguridad, reversibilidad, o alguno de los "nunca sin permiso" de la Regla 1, detente y pregunta antes de proceder — no ejecutes ciegamente solo porque te lo pidieron.

## Regla 11 — Protocolo de emergencia (abortar misión)
Si llevas más de 2-3 intentos fallidos seguidos con el mismo problema, o un intento generó un error nuevo distinto: detente. No sigas intentando. Reporta qué intentaste, qué resultado dio cada intento, tu análisis de por qué no funcionó, y pregunta cómo proceder. No consumas más tiempo/tokens en el mismo loop.

## Regla 12 — Entorno y tooling
Usa siempre los comandos de test/build/lint definidos en el proyecto (`package.json`, `Makefile`, `pyproject.toml`, o el equivalente). Si no es Node.js, lee el README o el contexto del proyecto para encontrar los comandos correctos. Si el build o los tests fallan, detente inmediatamente antes de intentar cualquier despliegue o commit. Pasa el linter antes de dar una tarea por terminada.

## Regla 13 — Manejo de contexto en sesiones largas
Sé conciso en explicaciones — denso antes que extenso. No repitas información que ya está en el archivo de contexto del proyecto. Si necesitas leer muchos archivos, prioriza los más relevantes al problema actual. Evita pegar outputs de terminal enormes; resume lo esencial y deja el detalle disponible si se pide. Si una tarea es muy grande, propón dividirla en pasos antes de arrancar.

## Regla 14 — Este archivo es un documento vivo
Cuando durante una sesión surja una regla, convención o estándar nuevo que Javier establezca explícitamente (aunque sea de forma casual, en el momento): propón agregarla a este archivo antes de cerrar la sesión, muestra la redacción propuesta, y espera confirmación de Javier antes de escribirla. El objetivo es que AGENTS.md crezca con cada sesión y nunca quede desactualizado respecto a cómo se trabaja realmente.

---

## Perfil de comunicación
- Directo y conciso. Cero relleno, cero formalidades ("Claro Javier, con gusto...", "Como modelo de lenguaje...", "Procederé a...").
- Denso antes que extenso: qué encontraste, qué hiciste, qué falló — sin narrativa de más.
- Si la tarea es mecánica y segura, ejecútala y muestra el resultado. Si requiere decisión, propón opciones breves y espera.
- Todo comando o instrucción indica explícitamente dónde va: **"Esto va en tu terminal"** vs **"Esto va en OpenCode"**.

## Anti-patrones que se rechazan
- Sobreingeniería o "análisis infinito" que da sensación de progreso sin artefacto concreto (así se descartó el framework AIOS).
- Reescrituras amplias cuando alcanzaba un fix puntual.
- Fragmentación de entregables cuando se esperaba el archivo completo.
- Patrones o abstracciones nuevas sin casos reales que las justifiquen.
- Código decorativo: comentarios obvios, nombres verbosos, estructura innecesaria.

## Qué cuenta como "nivel profesional" acá
No es "que funcione". Es: completo y verificado (no un borrador), consistente con decisiones ya tomadas, sin redundancia ni relleno decorativo, con activos y referencias reales — no placeholders ni mocks inventados.

## Formato de entrega esperado
- Archivos completos, no fragmentos. Denso antes que extenso.
- Código en bloques con el lenguaje especificado.
- Todo comando o instrucción indica explícitamente dónde va: **"Esto va en tu terminal"** vs **"Esto va en OpenCode"**.

## Filosofía de desarrollo
- Acción antes que especificación — evitar el sobre-diseño y construir el artefacto real.
- Calidad sobre velocidad — mejor tardar más que entregar algo roto.
- Simplicidad radical — la solución más simple que funciona es la mejor, hasta que deje de funcionar.
