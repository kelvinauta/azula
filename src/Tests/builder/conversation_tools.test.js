import { test, expect } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Builder from "../../Facades/builder";
import Provider from "../../Facades/data/Channel/db/provider";
import AgentFactory from "../../Facades/data/Channel/db/factory/AgentFactory";
import Agent from "../../Facades/data/Channel/db/tables/Agents";
import Message from "../../Facades/data/Channel/db/tables/Messages";
import Chat from "../../Facades/data/Channel/db/tables/Chats";
import Tools from "../../Facades/tools";
import axios from "axios";
import { z } from "zod";
const LIMIT = 3;
const DBZ_CHARACTERS = [
    "Goku",
    "Vegeta",
    "Gohan",
    "Piccolo",
    "Trunks",
    "Cell",
    "Frieza",
];
const CHANNEL_ID = uuidv4();
const createServerTools = () => {
    const tools = new Tools();
    tools.setAiTools([
        {
            name: "buscar_personaje",
            description: "Busca un personaje de Dragon Ball Z en la API",
            strict: true,
            parameters: z.object({
                name: z.string(),
            }),
            execute: async ({ name }) => {
                try {
                    const response = await axios.get(
                        `https://dragonball-api.com/api/characters?name=${name}`,
                    );
                    return response.data;
                } catch (error) {
                    return { error: "Personaje no encontrado" };
                }
            },
        },
    ]);
    tools.setPromptFunctions({
        hora_actual: () => {
            const hora = new Date().toLocaleTimeString();
            return hora;
        },
    });
    return tools;
};
const createClientTools = () => {
    const tools = new Tools();
    const functions = {
        hora_actual: () => {
            const hora = new Date().toLocaleTimeString();
            return hora;
        },
        randomCharacter: () => {
            const character =
                DBZ_CHARACTERS[
                    Math.floor(Math.random() * DBZ_CHARACTERS.length)
                ];
            return character;
        },
    };
    tools.setPromptFunctions(functions);
    tools.setMessageFunctions(functions);
    return tools;
};
test(
    "Debe mantener una conversación coherente sobre Dragon Ball Z",
    async () => {
        await Provider.build();
        const chat_external_id = uuidv4();
        const agentInstance = await Agent.getInstance();
        const factory = new AgentFactory(agentInstance);
        const serverAgent = await factory.simple({
            name: `dbz-agent-${uuidv4()}`,
            description: "Agente experto en Dragon Ball Z",
            config: {
                prompt: "Eres un experto en Dragon Ball Z. Son las {{/hora_actual}}. Usa la herramienta buscar_personaje para proporcionar información precisa.",
            },
            llm_engine: {
                model: "gpt-3.5-turbo",
                provider: "openai",
                max_tokens: 256,
                temperature: 0.7,
                api_key: process.env.OPENAI_API_KEY,
            },
            channel: CHANNEL_ID,
        });
        let previousResponse = null;
        for (let i = 0; i < LIMIT; i++) {
            const clientBuilder = new Builder({
                context: {
                    chat: chat_external_id,
                    human: "client-" + uuidv4(),
                    channel: CHANNEL_ID,
                    metadata: { name: "AI Client" },
                },
                message: {
                    texts: previousResponse
                        ? [
                              `Cuéntame más sobre la respuesta que me diste de ${previousResponse.output.text}`,
                          ]
                        : ["Cuéntame sobre {{/randomCharacter}}"],
                },
                tools: createClientTools(),
            });
            const clientResponse = await clientBuilder.run();
            const serverBuilder = new Builder({
                context: {
                    chat: chat_external_id,
                    agent: serverAgent.id,
                    channel: CHANNEL_ID,
                    metadata: { name: "AI Server" },
                },
                message: {
                    texts: [clientResponse.output.text],
                },
                tools: createServerTools(),
            });
            const serverResponse = await serverBuilder.run();
            previousResponse = serverResponse;
        }
        const chatInstance = await Chat.getInstance();
        const chat = await chatInstance.model.findOne({
            where: {
                external_id: chat_external_id,
            },
        });
        const messageInstance = await Message.getInstance();
        const messages = await messageInstance.model.findAll({
            where: {
                _chat: chat.dataValues.id,
            },
        });
        const clientMessages = messages.filter((m) => m._human);
        const serverMessages = messages.filter((m) => m._agent);
        expect(messages.length).toBe(LIMIT * 2);
        expect(clientMessages.length).toBe(LIMIT);
        expect(serverMessages.length).toBe(LIMIT);
    },
    { timeout: 60000 },
);
