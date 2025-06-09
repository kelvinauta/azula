import { z } from "zod";
export const agentSchema = z.object({
    name: z.string(),
    prompt: z.string(),
    channel: z.string(),
    llm_engine: z.object({
        model: z.string().default("gpt-4o"),
        provider: z.enum(["openai"]).default("openai"),
        max_tokens: z.number().min(0).default(256),
        api_key: z.string(),
    }),
});