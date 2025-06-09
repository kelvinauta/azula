import { expect, test, describe } from "bun:test";
import LLM from "../../Facades/llm";
import { z } from "zod";
describe("LLM class", () => {
    const llm_engine = {
        model: "gpt-4.1",
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
            execute: ({ nums }) => {
                let total = 0;
                for (const n of nums) {
                    total += n;
                }
                return total;
            },
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
            const response = await llm.generate_text(messages, tools, {
                maxSteps: null,
            });
            expect(response).toBeDefined();
            expect(response.toolCalls).toBeDefined();
            expect(response.toolCalls[0].args.nums).toEqual([
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            ]);
        },
        { timeout: 30000 },
    );
    test(
        "should call steps and retriave a text response, minimum steps: 2 (tool calling simultaneus and response); max steps: 4 (each tool calling and response)",
        async () => {
            const llm = new LLM(llm_engine);
            const MAX_STEPS = 4;
            const MIN_STEPS = 2
            const messages_many = [
                {
                    role: "user",
                    content:
                        "Quiero que sumes 1 + 2 + 3 + 4 y así hasta el numero 10. Luego quiero que hagas lo mismo pero del 20 al 30. Por ultimo hazlo de nuevo del 30 al 37",
                },
            ];

            const { text, steps } = await llm.generate_text(
                messages_many,
                tools,
                {
                    maxSteps: MAX_STEPS,
                },
            );
            expect(steps.length).toBeGreaterThanOrEqual(MIN_STEPS)
            expect(steps.length).toBeLessThanOrEqual(MAX_STEPS)
            if (steps.length === MIN_STEPS) {
                expect(steps[0].toolCalls[0].args.nums).toEqual([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                ]);
                expect(steps[0].toolCalls[1].args.nums).toEqual([
                    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                ]);
                expect(steps[0].toolCalls[2].args.nums).toEqual([
                    30, 31, 32, 33, 34, 35, 36, 37,
                ]);
            }
            expect(text.length).toBeGreaterThan(0);
        },
        { timeout: 30000 },
    );
});
