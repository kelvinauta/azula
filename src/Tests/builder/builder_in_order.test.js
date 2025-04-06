import { test, expect } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Builder from "../../Facades/builder";
import Provider from "../../Facades/data/Channel/db/provider";
import AgentFactory from "../../Facades/data/Channel/db/factory/AgentFactory";
import Agent from "../../Facades/data/Channel/db/tables/Agents";
const MESSAGES = [
    "1 Lorem ipsum dolor sit amet",
    "2 Consectetur adipiscing elit",
    "3 Sed do eiusmod tempor incididunt",
    "4 Ut labore et dolore magna aliqua",
    "5 Ut enim ad minim veniam",
    "6 Quis nostrud exercitation ullamco",
    "7 Laboris nisi ut aliquip ex ea",
    "8 Duis aute irure dolor in reprehenderit",
    "9 Excepteur sint occaecat cupidatat",
    "10 Sunt in culpa qui officia deserunt",
];
test(
    "Los mensajes y respuestas deben mantener el orden correcto",
    async () => {
        await Provider.build();
        const CHANNEL_ID = uuidv4();
        const chat_external_id = uuidv4();
        const agentInstance = await Agent.getInstance();
        const factory = new AgentFactory(agentInstance);
        const agent = await factory.simple({
            name: `echo-agent-${uuidv4()}`,
            description: "Agente que repite mensajes",
            config: {
                prompt: "Repite exactamente lo que el usuario te dice sin agregar ni quitar nada.",
            },
            llm_engine: {
                model: "gpt-3.5-turbo",
                provider: "openai",
                max_tokens: 50,
                temperature: 0,
                api_key: process.env.OPENAI_API_KEY,
            },
            channel: CHANNEL_ID,
        });
        let lastResponse;
        let allResponses = [];
        for (const message of MESSAGES) {
            const builder = new Builder({
                context: {
                    chat: chat_external_id,
                    agent: agent.id,
                    human: "test-humano",
                    channel: CHANNEL_ID,
                },
                message: {
                    texts: [message],
                },
            });
            const answer = await builder.run();
            await builder.saveAnswer(answer);
            allResponses.push(answer);
            lastResponse = answer;
        }
        const messages = lastResponse.input.messages;
        const conversationMessages = messages.slice(1);
        for (let i = 0; i < conversationMessages.length; i++) {
            const msg = conversationMessages[i];
            if (i % 2 === 0) {
                expect(msg.role).toBe("user");
                const messageIndex = Math.floor(i / 2);
                expect(msg.content).toBe(MESSAGES[messageIndex]);
            } else {
                expect(msg.role).toBe("assistant");
                expect(msg.content).toBe(conversationMessages[i - 1].content);
            }
        }
        const lastUserMessage = conversationMessages
            .filter((m) => m.role === "user")
            .pop();
        expect(lastUserMessage.content).toBe(MESSAGES[MESSAGES.length - 1]);
    },
    { timeout: 30000 },
);
