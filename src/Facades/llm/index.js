import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool, jsonSchema } from "ai";
import { z } from "zod";

class LLM {
    static schema = {
        input: {
            llm_engine: {
                model: z.string(),
                provider: z.enum(["openai", "anthropic"]),
                max_tokens: z.number().default(256).optional(),
                temperature: z.number().default(1).optional(),
                api_key: z.string(),
            },
            generate_text: {
                messages: z.array(
                    z.object({
                        role: z.string(),
                        content: z.any(),
                    })
                ),
            },
            tool: {
                name: z.string(),
                description: z.string(),
                strict: z.boolean().default(false).optional(),
                parameters: z.custom((val)=>{
                    return val instanceof z.Schema
                }),
                execute: z.function(),
            },
        },
    };

    constructor(llm_engine) {
        this.llm_engine = this.#generate_llm_engine(llm_engine);
    }

    async generate_text(messages, tools, { maxSteps = 5 } = {}) {
        const _messages = this.#build_message(messages);
        const generateTextConfig = {
            model: this.llm_engine.model,
            messages: _messages,
            maxTokens: this.llm_engine.max_tokens,
        };
        if (tools) generateTextConfig.tools = this.#build_tools(tools);
        if (maxSteps) generateTextConfig.maxSteps = maxSteps;
        const response = await generateText(generateTextConfig);
        return response;
    }

    #build_message(messages) {
        return LLM.schema.input.generate_text.messages.parse(messages);
    }

    #build_tools(tools) {
        tools = z.array(z.object(LLM.schema.input.tool)).parse(tools)
        let new_tools = {};
        for (const t of tools) {
            new_tools[t.name] = tool(t);
        }
        return new_tools;
    }

    #generate_llm_engine(llm_engine) {
        const engineSchema = z.object(LLM.schema.input.llm_engine);
        const engine = engineSchema.parse(llm_engine);
        if (engine.provider === "openai") {
            engine.model = createOpenAI({
                apiKey: engine.api_key,
                compatibility: "strict",
            })(engine.model);
        }
        return engine;
    }
}

export default LLM;
