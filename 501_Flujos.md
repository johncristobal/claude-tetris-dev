# Flujos de trabajo 

### Comandos iniciales
https://github.com/Klerith/mas-talento/tree/main/claude-code
/ = comandos
@ = archivos
& = tarea en segundi plano
'#' = comentario rapido

* Iniciales
/init
/login
/config - configuraciones de claude
/permissions
/theme - cambiar tema

/doctor - para ver issues - reparar
/mcp...
/hooks...

### Comando flujo diario
/memory
- memoria de usuario - global

/plan
- habilita modo plan

/resume
- para anclar a una conversacion con un id
- claude --resume {id}

/copy
- tal cual para copiar y pega en otro lugar
- mantiene estilos

/export
- pega, pero sin estilo

/recap
- muestra un resumen de lo ultimo

/voice
- con el espacio, se activa
- pueden mandar voz
- solo en ingles

/fast, /effort
- cambiar config de claude

### comandos utiles
/loop
- ejecuta accion cada cierto tiempo durante la sesion
- si sales de claude, se acaba este cron
- tareas sencillas, cron

/schedule
- mas para agentes, un poco mas rudo
- conecta mas cosas

**OJO**
Ppodemos crear skill diciendole a claude
se crea la skill con el nombre
ejecutas skill /clima y listo

### github integraciones
/install-github-app
- abre pagina web, configira para el repo que vayas a utilizar
- regresas a terminal
-- @claude code => para ejecutar comandos git
-- automatico

- crear token con claude
-- abre caude, autorizas y listo
-- abre github, creando un pull request
    - esto lanza un tarea antes de cada merge

- Listop, crea github workflows folder
- LO INTERESANTE...
    - desde gituhb, habilitatmos issues
    - creamos issue y lanzaos @claude revisa este requerimiento

### revisar cambios


