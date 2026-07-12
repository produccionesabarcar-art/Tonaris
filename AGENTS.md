cat > AGENTS.md << 'EOF'
# Instrucciones para Agentes Autónomos

## Regla 0 — Contexto obligatorio
Antes de ejecutar CUALQUIER acción, responder cualquier pregunta o escribir código, DEBES leer `tonaris-context.md` completo. Ese archivo es la fuente de verdad del proyecto. No asumas nada basándote en el historial del chat.

## Regla 1 — No modifiques sin confirmar
- Nunca edites archivos sin preguntarme primero.
- Si tienes dudas sobre una decisión de diseño, pregunta antes de actuar.

## Regla 2 — Sigue las convenciones del proyecto
- Todas las convenciones de código, arquitectura y estilo están en `tonaris-context.md`.
- No inventes patrones nuevos sin justificación.

## Regla 3 — Explica los cambios
- Después de cada modificación, lista qué archivos cambiaste y por qué.
- Si algo falló, explica qué intentaste y qué error obtuviste.

## Regla 4 — Archivos de referencia
- `tonaris-context.md` → Estado actual, arquitectura, decisiones
- `package.json` → Dependencias y scripts
- `README.md` → Descripción general (si existe)

## Regla 5 — No toques estos archivos sin permiso explícito
- `.env` y cualquier archivo con secretos
- Configuraciones de despliegue
- `tonaris-context.md` (solo si te lo pido explícitamente)
EOF