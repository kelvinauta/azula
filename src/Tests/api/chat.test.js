import { describe, test, expect, beforeAll } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Provider from "../../Facades/db/Channel/db/provider";
import AgentFactory from "../../Facades/db/Channel/db/factory/AgentFactory";
import Agent from "../../Facades/db/Channel/db/tables/Agents";

describe("Chat API Tests", () => {
    let testAgent;
    const CHANNEL_ID = uuidv4();
    const API_URL = "http://localhost:3333";

    beforeAll(async () => {
        // Configurar base de datos
        await Provider.build();

        // Crear agente de prueba
        const agentInstance = await Agent.getInstance();
        const factory = new AgentFactory(agentInstance);

        testAgent = await factory.simple({
            name: `memory-test-agent-${uuidv4()}`,
            description: "Agente para pruebas de memoria conversacional",
            config: {
                prompt: "Eres un asistente amigable. Tu trabajo es recordar la información personal que los usuarios te comparten y usarla cuando sea relevante en la conversación. Debes ser preciso al recordar nombres y detalles.",
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
    });

    test(
        "Debe recordar el nombre completo del usuario",
        async () => {
            const chat_id = uuidv4();
            const nombre_completo = "Rogelio Alberto Flores";

            // Primera solicitud - Presentación
            console.log("\n🤖 Iniciando primera solicitud...");
            const start1 = performance.now();

            const res1 = await fetch(`${API_URL}/v1/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    context: {
                        human: "test_human_remeber_my_name",
                        chat: chat_id,
                        channel: CHANNEL_ID,
                        metadata: {
                            name: "Test User",
                        },
                    },
                    message: {
                        texts: [`Hola, me llamo ${nombre_completo}`],
                    },
                }),
            });

            const end1 = performance.now();
            console.log(
                `⏱️ Primera solicitud completada en ${((end1 - start1) / 1000).toFixed(2)}s (${(end1 - start1).toFixed(2)}ms)`,
            );

            expect(res1.status).toBe(200);

            // Segunda solicitud - Pregunta por el nombre
            console.log("\n🤖 Iniciando segunda solicitud...");
            const start2 = performance.now();

            const res2 = await fetch(`${API_URL}/v1/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    context: {
                        human: "test_human_remeber_my_name",
                        chat: chat_id,
                        channel: CHANNEL_ID,
                        metadata: {
                            name: "Test User",
                        },
                    },
                    message: {
                        texts: ["¿Cuál es mi nombre completo?"],
                    },
                }),
            });

            const end2 = performance.now();
            console.log(
                `⏱️ Segunda solicitud completada en ${((end2 - start2) / 1000).toFixed(2)}s (${(end2 - start2).toFixed(2)}ms)`,
            );

            expect(res2.status).toBe(200);

            const response2 = await res2.json();
            const respuesta_texto = response2.output.text.toLowerCase();

            // Verificar que la respuesta contenga el nombre completo
            expect(
                respuesta_texto.includes(nombre_completo.toLowerCase()),
            ).toBe(true);

            console.log("\n📝 Respuesta del agente:", response2.output.text);
            console.log(
                `⏱️ Tiempo total: ${((end2 - start1) / 1000).toFixed(2)}s (${(end2 - start1).toFixed(2)}ms)`,
            );
        },
        { timeout: 30000 },
    );
});
