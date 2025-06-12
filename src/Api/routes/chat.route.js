import Builder from "../../Facades/builder";
import { zValidator } from "@hono/zod-validator";
import { chatSchema } from "../schema/chat.schema";

export const chatRoute = (app) => {
    app.post("/v1/chat", zValidator("json", chatSchema), async (c, next) => {
        try {
            const body = c.req.valid("json");
            const config = body.config;
            const builder = new Builder({
                context: body.context,
                message: body.message,
            });
            if (config.wait) {
                const answer = await builder.run();
                builder.saveAnswer(answer).catch(console.error);
                builder.execute_webhooks();
                return c.json(answer.output);
            } else {
                void builder
                    .run()
                    .then((answer) => builder.saveAnswer(answer))
                    .catch(console.error)
                    .finally(() => builder.execute_webhooks());
                c.status(200);
                return c.json({
                    sucess: "Your request is being processed",
                });
            }
        } catch (error) {
            console.error("Error en /v1/chat:", error);
            return c.json(
                {
                    error: error.message,
                },
                500
            );
        }
    });
};
