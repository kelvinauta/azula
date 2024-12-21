import { test, beforeAll, expect, spyOn } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import Builder from "../../Facades/builder";
import Provider from "../../Facades/db/Channel/db/provider";
import AgentFactory from "../../Facades/db/Channel/db/factory/AgentFactory";
import Agent from "../../Facades/db/Channel/db/tables/Agents";
import Human from "../../Facades/db/Channel/db/tables/Humans";
import Chat from "../../Facades/db/Channel/db/tables/Chats";
import Message from "../../Facades/db/Channel/db/tables/Messages";
import Tools from "../../Facades/tools";
let testAgent;
let testHuman;
let testChat;
let builderInstance;
let testData;
const test_tools = new Tools();
test_tools.setAiTools([
    {
        name: "buscar_producto",
        description: "Busca un producto en la base de datos",
        strict: true,
        parameters: z.object({
            nombre: z.string(),
            categoria: z.string().optional(),
        }),
        execute: async ({ nombre, categoria }) => {
            return {
                nombre,
                precio: 100,
                categoria: categoria || "general",
            };
        },
    },
    {
        name: "verificar_stock",
        description: "Verifica el stock de un producto",
        strict: true,
        parameters: z.object({
            producto_id: z.string(),
        }),
        execute: async ({ producto_id }) => {
            return {
                disponible: true,
                cantidad: 50,
            };
        },
    },
]);
test_tools.setPromptFunctions({
    get_user_name: (args) => args.context.metadata.name,
    get_last_interaction: (args) => {
        const lastMsg = args.history[args.history.length - 1];
        return lastMsg ? lastMsg.content : "No hay interacciones previas";
    },
});
test_tools.setMessageFunctions({
    format_price: (price) => `$${price.toFixed(2)}`,
    format_date: (date) => new Date(date).toLocaleDateString(),
});
beforeAll(async () => {
    await Provider.build();
    const agentInstance = await Agent.getInstance();
    const factory = new AgentFactory(agentInstance);
    testAgent = await factory.simple({
        name: `test-agent-${uuidv4()}`,
        description: "Agente de prueba",
        config: {
            prompt: "Eres un asistente de ventas. El cliente se llama {{/get_user_name}}. Su última interacción fue: {{/get_last_interaction}}",
        },
        llm_engine: {
            model: "gpt-3.5-turbo",
            provider: "openai",
            max_tokens: 256,
            temperature: 1,
            api_key: process.env.OPENAI_API_KEY,
        },
        channel: uuidv4(),
    });
    const humanInstance = await Human.getInstance();
    testHuman = await humanInstance.model.create({
        external_id: uuidv4(),
    });
    const chatInstance = await Chat.getInstance();
    testChat = await chatInstance.model.create({
        external_id: uuidv4(),
        channel: testAgent.channel,
    });
    const messageInstance = await Message.getInstance();
    await messageInstance.model.create({
        texts: ["¿Tienen laptops disponibles?"],
        _human: testHuman.id,
        _chat: testChat.id,
    });
    await messageInstance.model.create({
        texts: ["Sí, tenemos varios modelos. ¿Qué características busca?"],
        _agent: testAgent.id,
        _chat: testChat.id,
    });
    testData = {
        context: {
            chat: testChat.external_id,
            human: testHuman.external_id,
            channel: testAgent.channel,
            metadata: {
                name: "Usuario Test",
                phone: "123456789",
                profile_url: "https://test.com/profile",
            },
        },
        message: {
            texts: ["Busco una laptop para programación"],
        },
        tools: test_tools
    };
    builderInstance = new Builder(testData);
});
test(
    "Builder.run() debe procesar el mensaje usando tools y crear un nuevo registro",
    async () => {
        const response = await builderInstance.run();
        const messageInstance = await Message.getInstance();
        const lastMessage = await messageInstance.model.findOne({
            where: {
                _chat: testChat.id,
                _human: testHuman.id,
            },
            order: [["createdAt", "DESC"]],
        });
        expect(lastMessage).toBeDefined();
        expect(lastMessage.texts).toEqual(testData.message.texts);
        expect(response).toBeDefined();
        expect(response.toolResults).toBeDefined();
    },
    { timeout: 30000 },
);
test("Builder.saveAnswer() debe guardar la respuesta del agente incluyendo resultados de tools", async () => {
    const response = await builderInstance.run();
    await builderInstance.saveAnswer(response);
    
    const messageInstance = await Message.getInstance();
    const lastAgentMessage = await messageInstance.model.findOne({
        where: {
            _chat: testChat.id,
            _agent: testAgent.id,
        },
        order: [['createdAt', 'DESC']],
    });

    expect(lastAgentMessage).toBeDefined();
    expect(lastAgentMessage._agent).toEqual(testAgent.id);
    expect(lastAgentMessage._chat).toEqual(testChat.id);
    expect(typeof lastAgentMessage.texts[0]).toBe('string');
}, { timeout: 30000 });
