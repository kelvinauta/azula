import { z } from "zod";
export const chatSchema = z.object({
    context: z.object({
        human: z.string().optional(), // es una forma mas corta de human.external_id
        agent: z.string().optional(),
        channel: z.string(),
        metadata: z
            .object({
                name: z.string().optional(),
                phone: z.string().optional(),
                profile_url: z.string().optional(),
            })
            .optional(),
    }),
    config: z
        .object({
            wait: z.boolean().describe("Wait response LLM or not (good in case use webhook)"),
        })
        .default({
            wait: true,
        }),
    message: z.object({
        texts: z.array(z.string()),
    }),
});
