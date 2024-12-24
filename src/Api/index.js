import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import Builder from "../Facades/builder";
const app = new Hono();
const chatSchema = z.object({
    context: z.object({
        chat: z.string(),
        human: z.string().optional(),
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
    message: z.object({
        texts: z.array(z.string()),
    }),
});
app.post("/v1/chat", zValidator("json", chatSchema), async (c) => {
    try {
        const body = c.req.valid("json");
        const builder = new Builder({
            context: body.context,
            message: body.message,
        });
        const answer = await builder.run();
        builder.saveAnswer(answer).catch(console.error);
        return c.json(answer);
    } catch (error) {
        console.error("Error en /v1/chat:", error);
        return c.json(
            {
                error: "Error interno del servidor",
            },
            500,
        );
    }
});
export default {
    port: 3333,
    fetch: app.fetch,
};
