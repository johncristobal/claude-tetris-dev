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

