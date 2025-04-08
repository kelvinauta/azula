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

