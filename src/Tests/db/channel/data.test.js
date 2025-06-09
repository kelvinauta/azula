import { test, beforeAll, expect } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Data from "../../../Facades/data";
import AgentFactory from "../../../Facades/data/Channel/db/factory/AgentFactory";
import Agent from "../../../Facades/data/Channel/db/tables/Agents";
import Provider from "../../../Facades/data/Channel/db/provider";
let testAgent;
let dataInstance;
let testData;
beforeAll(async () => {
    await Provider.build();
    const agentInstance = await Agent.getInstance();
    const factory = new AgentFactory(agentInstance);
    testAgent = await factory.simple({
        name: `test-agent-${uuidv4()}`,
        description: "Agente de prueba",
        config: {
            prompt: "Prompt de prueba",
        },
        llm_engine: {
            model: "gpt-3.5-turbo",
            provider: "openai",
            max_tokens: 256,
            temperature: 1,
            api_key: "test-key",
        },
        channel: uuidv4(),
    });
    testData = {
        context: {
            chat: uuidv4(),
            human: uuidv4(),
            channel: testAgent.channel,
            metadata: {
                name: "Usuario Test",
                phone: "123456789",
                profile_url: "https://test.com/profile",
            },
        },
        message: {
            texts: ["2 Hola", "Este es un mensaje de prueba"],
        },
    };
    dataInstance = new Data();
    dataInstance.setMessage(testData.message)
    dataInstance.setContext(testData.context)
});
test("getMessage debe crear y retornar un mensaje con estructura correcta", async () => {
    const result = await dataInstance.getMessage();
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(result.texts).toEqual(testData.message.texts);
    expect(result._human).toBeDefined();
    expect(result._chat).toBeDefined();
});
test("getAgent debe obtener el agente creado", async () => {
    const result = await dataInstance.getAgent();
    expect(result.id).toBe(testAgent.id);
    expect(result.name).toBe(testAgent.name);
    expect(result.description).toBe(testAgent.description);
    expect(result.config).toEqual(testAgent.config);
    expect(result.channel).toBe(testAgent.channel);
});
test("getHistory debe obtener el historial de mensajes", async () => {
    const result = await dataInstance.getHistory();
});
