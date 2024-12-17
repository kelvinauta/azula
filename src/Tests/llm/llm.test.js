import { expect, test, describe } from "bun:test";
import LLM from "../../Facades/llm";
import { z } from "zod";
describe("LLM class", () => {
    const llm_engine = {
        model: "gpt-4",
        provider: "openai",
        max_tokens: 256,
        temperature: 1,
        api_key: process.env.OPENAI_API_KEY,
    };
    const messages = [
        {
            role: "user",
            content: "Quiero que sumes 1 + 2 + 3 + 4 y así hasta el numero 10",
        },
    ];
    const tools = [
        {
            name: "sumar",
            description: "lista de arrays de numeros a sumar",
            strict: true,
            parameters: z.object({
                nums: z.array(z.number()),
            }),
            execute: ({ nums }) => nums,
        },
    ];
    test("should initialize with llm_engine", () => {
        expect(() => new LLM(llm_engine)).not.toThrow();
    });
    test(
        "should generate text without tools",
        async () => {
            const llm = new LLM(llm_engine);
            const response = await llm.generate_text(messages);
            expect(response).toBeDefined();
        },
        { timeout: 30000 },
    );
    test(
        "should generate text with tools",
        async () => {
            const llm = new LLM(llm_engine);
            const response = await llm.generate_text(messages, tools);
            expect(response).toBeDefined();
            expect(response.toolResults).toBeDefined();
        },
        { timeout: 30000 },
    );
});
