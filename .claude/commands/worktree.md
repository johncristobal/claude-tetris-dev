---
description: Crea git worktree aislado en .tress/[nombre] y ejecuta ahi las instrucciones dadas
argument-hint: <instrucciones del requerimiento>
---

Requerimiento del usuario: $ARGUMENTS

Pasos a ejecutar:

1. Deriva un `nombre` corto en kebab-case que resuma el requerimiento anterior (ej: "fix-scoring-bug", "add-hold-piece").
2. Corre: `git worktree add .tress/<nombre>` desde la raiz del repo (crea rama nueva `<nombre>` si no existe: `git worktree add -b <nombre> .tress/<nombre>`). Si `.tress/` no existe, se crea automaticamente.
3. Cambia tu contexto de trabajo a esa carpeta (`.tress/<nombre>`) y ejecuta ahi TODAS las instrucciones del requerimiento, de forma aislada del codigo principal — no toques archivos fuera de `.tress/<nombre>`.
4. No hagas commit/push ni borres el worktree salvo que el usuario lo pida explicitamente.
5. Al terminar, resume: ruta del worktree, rama creada, y que cambio.
