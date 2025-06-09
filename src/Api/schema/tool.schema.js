import { z } from "zod";
export const toolSchema = z.object({
    agent_id: z.string(),
    name: z.string(),
    description: z.string(),
    mode: z.enum(["source", "http"]).default("http"),
    source: z.string().optional(),
    dependencies: z.string().optional(),
    parameters: z.any(),
    http: z
        .object({
            method: z
                .enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
                .default("POST"),
            url: z.string(),
            data_mode: z.enum(["body", "params"]).default("body"),
        })
        .optional(),
});