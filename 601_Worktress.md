# Batch y Worktrees 

Cómo preparar el proyecto base antes de usar batch o worktrees.
Uso básico y avanzado del comando /batch para lanzar múltiples agentes.
Cómo unir y consolidar el trabajo generado por batch.
Qué son los Git Worktrees y cómo crearlos manualmente.
Ejecución de agentes en paralelo de forma manual con worktrees.
Cómo unir los worktrees al branch principal al finalizar.
Creación de un comando personalizado /worktree para automatizar el flujo.
Definición y uso de comandos personalizados propios en Claude Code.
Unión de worktrees y commits al cerrar el trabajo paralelo.

https://gist.githubusercontent.com/Klerith/f0d487f27130e62177e890d0584d5c5e/raw/edabea076c872fa3fd31106b6d4fa3b8d4344080/worktrees-batch.md

### preparacion y lanzar /batch

/batch = cambios masivos en paralelo
- cuidado con sobreescribir
worktrees - ramas independientes, trabajar aislado

/batch "listado de instrucciones"
empieza a leer y mandara prompt
worktress:
    - crea agent-id con loas fucniones que se mandan
    - se crean pull request para cada feature
    - cada uno tiene un index.html, pffff cada uno con su funcion

### unir trabajo 
tal cual le decimos a claide qie una el trabajo en la rama main-2
- OJO - habra conflictos, pero claide los ira resolviendo
- por ulitmo, remueve los worktress, listo

=========================
### worktress manual

Creamos carpeta .tress y dentro los worktress
git worktree add .tress/pause
git worktree add .tress/records
git worktree add .tress/skins

Crea las carpetas y dentro una copia del proyecto

### agentes paralelo
Abres consola por cada worktrees
Lanzas claude
pones la implentacion en cada termianl
LISTO

### unir worktrees
Aqui no es tan facil como con claude...
como hicimos los worktrees manual, unir tmb es manual

creamos commit por cada consola
cuando termine listamos worktrees:
/Users/johncris/Documents/ClaudeCodeDev/03-claude-tetris-dev/.tress/pause    42f0329 [pause]
/Users/johncris/Documents/ClaudeCodeDev/03-claude-tetris-dev/.tress/records  69e919b [records]
/Users/johncris/Documents/ClaudeCodeDev/03-claude-tetris-dev/.tress/skins    28a253a [skins]

le decimos a claiude que combine las ramas a main-3 y resuelva los conflictos que puedan salir

listo, al terminar le decimos qie borre los worktress
AMONOSO!!!!

=========================
### worktress personalizado

Necesito que crees un comando personalizado con el nombre de: /worktree.
Ese comando debe crear un worktree: git worktree add .tress/[nombre]
Donde el nombre tu lo vas a determinar basado en el requerimiento
Al invocar el comando de /worktree, tu recibes las instrucciones que deben de empezar a ejecutarse en ese worktree de manera independiente y asilada del codigo principal

Claude genera el comando en .claude/commands
Listo para usar en claude

/worktree <instrucciones>

verificamos, hacemos commit 
worktree list

@claude une las ramas
/Users/johncris/Documents/ClaudeCodeDev/03-claude-tetris-dev/.tress/local-leaderboard  804018e [local-leaderboard]
/Users/johncris/Documents/ClaudeCodeDev/03-claude-tetris-dev/.tress/pause-menu         c6c5cf8 [pause-menu]
y dejalos en main-4
resuelve los conflictos