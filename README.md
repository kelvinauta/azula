# Requisitos:
curl git unzip glibc python gcc python-distutils-extra sqlite sqlite3

# Uso Inicial:
TLDR `bun run start --agents`

## Crea tus primeros agentes
Para que la API funcione necesita tener al menos un agente LLM que reponda, necesitas crear un agente manualmente, para ello puedes simplemente usar los Endpoints de creacion de agente o puedes compenzar con un template, al agregar la flag `--agents` al comando entonces le estás pidiendo al software que comience con un template, este template lo tomará de templates/start_template o tambien puedes setear uno personalizado en variables de entorno TEMPLATE_DIR.

Notas:
- Los agentes creados con `--agents` se guardan en DB, si hay conflictos por agents ya existentes en DB simplemente no sobrescribirá los ya existentes
- un "Template Dir" es un directorio donde podras tener un template inicial de agentes, funciones y quiza otras configuraciones, guarda Template Dir en otro repositorio para que puedas clonarlo en el futuro

Recomendacion al iniciar:
- `cp -r templates/start_template /tmp/my/path`
- Modifica env Var `TEMPLATE_DIR=/tmp/my/path`
- Ponle un prompt a tu agente por defecto en $TEMPLATE_DIR/agents/default.md
- Puedes crear los agentes que quieras en la carpeta agents
- `bun run start --start`

## Funciones js
si usas la flag `--functions` entonces los archivos js de $TEMPLATE_DIR/functions podran ser accedido por todos tus agentes, de esa manera podrás usar simple javascript para poder crear Tools para tus AI.

WARN: Ten en cuenta que estas funciones JS se ejecutan en el entorno actual por lo que debes tener cuidado de no permitir que el agente pueda hacer cambios a tu sistema o que los usuarios puedan injectar código malicioso.

Notas:
- Las tools tambien se pueden crear por API (Documentacion del endpoint /tools aun está pendiente)
- `--functions` no guarda las funciones en DB por lo que cuando no uses esta flag esta funcion simplemente no estará disponible


### Tipo de funciones
Si observas el template de que está en la carpeta templates/example_dragon_ball_template verás que la carpeta functions tiene 3 carpetas: ai, messages. prompt, explicare cada uno.
- ai: este es el mas importante y quizá el unico que necesitas, son aquellas tools que la AI es consciente de su existencia y puede usar para ejecutar, mira los comentarios de ai/index.js para mas informacion
- prompt: estas funciones se usan al momento de usar una plantilla como esta: {{/now}} en el prompt de un agente, es decir, el agente LLM no es consciente de que existe este tipo de funciones ya que se reemplazan con el resultado de dicha funcion al momento de construir su prompt, por lo tanto por ejemplo si la funcion {{/now}} está en el prompt del agente el agente solo verá el resultado de dicha funcion o sea la fecha actual. Este tipo de funciones son utiles para tener un prompt dinamico que cambia segun el contexto y el momento de la consulta, tambien esta funcion tiene args especiales que pueden ser utiles, recomiendo mirar prompt/index.js y leer los comentarios
- messages: es lo mismo que `prompt` solo que para los mensajes de usuarios en vez del prompt del agente

# Documentación API Azula

Esta documentación describe el uso de la API de Azula, una plataforma para la gestión de agentes conversacionales.

## Endpoints

### Conversación con Agentes

**POST /v1/chat**

Permite enviar un mensaje para que un agente lo procese.

**Estructura de la solicitud:**
```json
{
  "context": {
    "human": "string", // un id o cualquier identificador para el usuario
    "channel": "string", // el canal de comunicacion
  },
  "message": {
    "texts": ["string"] // Array de mensajes
  }
}
```

**Respuesta:**
La respuesta contiene la salida del agente.

### Gestión de Agentes

**POST /v1/agents**

Crea un nuevo agente en el sistema.

**Estructura de la solicitud:**
```json
{
  "name": "string", // Nombre del agente
  "prompt": "string", // Instrucciones del agente
  "channel": "string", // Canal donde operará
  "llm_engine": {
    "model": "gpt-4o", // Modelo por defecto
    "provider": "openai", // Proveedor (solo openai disponible)
    "max_tokens": 256, // Tokens máximos de respuesta
    "api_key": "string" // Clave API del proveedor
  }
}
```

**GET v1/agents**

Obtiene la lista de todos los agentes disponibles.

## Ejemplos de uso

### Enviar mensaje a un agente

```javascript
fetch('https://api.tudominio.com/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    context: {
      channel: "whatsapp",
      metadata: {
        name: "Juan Pérez"
      }
    },
    message: {
      texts: ["Hola, ¿cómo puedo configurar mi cuenta?"]
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Crear un nuevo agente

```javascript
fetch('https://api.tudominio.com/v1/agents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "AsistenteVentas",
    prompt: "Eres un asistente especializado en ventas...",
    channel: "website",
    llm_engine: {
      model: "gpt-4o",
      provider: "openai",
      max_tokens: 500,
      api_key: "sk-..."
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

# Herramientas (Tools)

## Introducción

Las herramientas permiten a tus agentes interactuar con sistemas externos, consultar APIs y ejecutar operaciones específicas. Cada herramienta debe estar asociada a un agente existente mediante su `agent_id`.

## Endpoints disponibles

### Crear una herramienta

```
POST /v1/tools
```

### Consultar herramientas

```
GET /v1/tools?agent_id=ID_DEL_AGENTE
```

## Creación de herramientas

Para crear una herramienta necesitas proporcionar:

- `agent_id`: ID del agente al que pertenecerá la herramienta (debe existir previamente)
- `name`: Nombre único para identificar la herramienta
- `description`: Descripción que ayude al agente a entender cuándo usar esta herramienta
- `parameters`: Esquema JSON que define los parámetros aceptados por la herramienta
- `mode`: Detalles de configuración según el modo elegido (`http` o `source`)

### Ejemplo: Herramienta para consultar personajes de Dragon Ball

```javascript
POST /v1/tools
Content-Type: application/json

{
  "agent_id": "298887a9-1c8d-4686-b041-1c4fdd62533e",
  "name": "dragon-ball-finder",
  "mode": "http",
  "description": "Herramienta para buscar personajes de Dragon Ball por nombre",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Nombre del personaje de Dragon Ball a buscar"
      }
    },
    "required": ["name"]
  },
  "http": {
    "method": "GET",
    "url": "https://dragonball-api.com/api/characters",
    "data_mode": "params"
  }
}
```

## Modos de operación

### Modo HTTP

Permite conectar con APIs externas definiendo:
- `method`: Método HTTP (GET, POST, etc.)
- `url`: Endpoint de la API
- `data_mode`: Cómo se envían los datos (`body` o `params`) la respuesta del LLM será un objeto basado en el esquema de `parameters` dicho objeto se pasará como `body` o como `params` (params son los parametros de URL `url.com?param1=example&param2=example`)

### Modo Source

Para implementaciones personalizadas en código, especificando:
- `source`: Código fuente de la implementación
- `dependencies`: Dependencias necesarias (opcional)

## Importante

- El agente debe existir antes de crear una herramienta para él
- Cada herramienta debe tener un nombre único para el agente
- Los parámetros deben documentarse claramente para que el agente sepa cómo utilizarlos

