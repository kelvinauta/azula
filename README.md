
# Endpoints
## WorkSpace
Un Workspace es una agrupación de toda la información y configuración de una empresa o espacio de trabajo, todos los endpoint deben tener /:workspace_uid como prefijo, por ejemplo: GET /skypostal/chat
### GET
- /workspace/
    Enlista todos los WorkSpace
- /:workspace_uid
    Obtiene información general de un WorkSpace
### POST
- /workspace/create
    Crea un nuevo WorkSpace
- /workspace/config
    Configura un WorkSpace
- /workspace/duplicate
    Duplica un WorkSpace
## Chat
Chat es un canal donde comunicamos humanos y asistentes (se obviará el prefijo /:workspace_id/*)
### GET
- /chat/
    Enlista todos los chats existentes
- /chat/:chat_id
    Obtienes los messages de un chat en específico además de otros metadatos
- /chat/:chat_id/resume
    Obtienes un resumen de la conversación en base a los messages
### POST
- /chat/
    Crea un nuevo canal de comunicación entre dos o más entidades
- /chat/:chat_id/assistant/:assistant_id
    Un asistente envia un mensaje al chat
- /chat/:chat_id/user/:user_id
    Un usuario envia un mensaje al chat

## Message
En cada mensaje se encuentra no solo el texto del mismo si no también todo el contexto en el momento en el que se generó dicho mensaje
### GET
- /message/:message_id
    Obtienes todo el contexto en el momento que se generó el message específico

## Assistant
Un asistente es una entidad que interactua con el usuario que está principalmente gestionado con un agente de IA pero también puede ser supervisado y contralado por un humano

### GET
- /assistant/
    Enlista a todos los asistentes
- /assistant/:assistant_uid
    Muestra la configuración del asistente

### POST
- /assistant/
    Crea un nuevo assistant
- /assistant/:assistant_uid
    Configura un assistant existente
- /assistant/:assistant_uid/test
    Se hace un diagnostico general del assistant
- /assistant/:assistant_uid/test/chat/
    Se hace un test de conversación con el assistant
- /assistant/:assistant_uid/test/tool
    Se testea todas las tools de un asistente
- /assistant/:assistant_uid/test/tool/:tool_id
    Se testea una Tool en específico

## User
Un usuario es siempre la representación de un Humano
### GET
- /user/
    Se obtiene la lista de usuarios
- /user/:user_id
    Se obtiene la información de un usuario: chats, context_info
### POST
- /user/
    Se crea un nuevo usuario
- /user/:user_id
    Se edita la información de un usuario


# Init Porject
To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000