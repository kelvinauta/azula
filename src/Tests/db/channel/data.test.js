
import { test, beforeAll } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Data from "../../../Facades/db";
import AgentFactory from "../../../Facades/db/Channel/db/factory/AgentFactory";
import Agent from "../../../Facades/db/Channel/db/tables/Agents";
import Provider from "../../../Facades/db/Channel/db/provider";

let testAgent;
let dataInstance;

beforeAll(async () => {
  // Inicializar Provider
  await Provider.build();
  
  // Crear agente de prueba
  const agentInstance = await Agent.getInstance();
  const factory = new AgentFactory(agentInstance);
  
  testAgent = await factory.simple({
    name: `test-agent-${uuidv4()}`,
    description: "Agente de prueba",
    config: {
      prompt: "Prompt de prueba"
    },
    llm_engine: {
      model: "gpt-3.5-turbo",
      provider: "openai",
      max_tokens: 256,
      temperature: 1,
      api_key: "test-key"
    },
    channel: "test-channel"
  });

  // Crear instancia de Data con datos de prueba
  const testData = {
    context: {
      chat: uuidv4(),
      human: uuidv4(),
      channel: "test-channel",
      metadata: {
        name: "Usuario Test",
        phone: "123456789",
        profile_url: "https://test.com/profile"
      }
    },
    message: {
      texts: ["Hola", "Este es un mensaje de prueba"]
    }
  };

  dataInstance = new Data(testData);
});

test("getMessage debe crear y retornar un mensaje", async () => {
  const result = await dataInstance.getMessage();
});

test("getAgent debe obtener el agente del canal", async () => {
  const result = await dataInstance.getAgent();
});

test("getHistory debe obtener el historial de mensajes", async () => {
  const result = await dataInstance.getHistory();
});
