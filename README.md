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

