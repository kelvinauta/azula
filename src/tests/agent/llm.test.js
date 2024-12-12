import { z } from "zod";
import LLM from "../../Services/modules/llm.js";
describe("LLM class", () => {
    const llm_engine_test = {
        model: "gpt-4o",
        provider: "openai",
        max_tokens: 256,
        temperature: 1,
        api_key: process.env.OPENAI_API_KEY,
    };
    const llm_input_test = {
        llm_engine: llm_engine_test,
        messages: [
            {
                role: "user",
                content:
                    "Quiero que sumes 1 + 2 + 3 + 4 y así hasta el numero 10",
            },
        ],
    };
    const test_tools = [
        {
            name: "sumar",
            description: "lista de arrays de numeros a sumar",
            strict: true,
            parameters: z.object({
                nums: z.array(z.number()),
            }),
            execute: ({ nums }) => {
                return nums;
            },
        },
    ];
    describe("generate provider", () => {
        const llm = new LLM(llm_input_test);
        it(".generate_model", () => {
            expect(() => {
                const model = llm.generate_model();
            }).not.toThrow();
        });
    });
    describe("run", async () => {
        const timeout = 1000 * 30;
        it(
            "Test messages prompt",
            async () => {
                const llm = new LLM(llm_input_test);
                const llm_response = await llm.run();
                expect(llm_response).toHaveProperty("text");
            },
            timeout,
        );
        it(
            "Test messages with tool",
            async () => {
                const llm = new LLM({ ...llm_input_test, tools: test_tools });
                const llm_response = await llm.run();
                expect(llm_response.toolResults[0].args.nums).toEqual([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                ]);
            },
            timeout,
        );
    });
});
