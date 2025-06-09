import Data from "../../Facades/data";
import { zValidator } from "@hono/zod-validator";
import { webhookSchema } from "../schema/webhook.schema";

export const webhookRouter = (app) => {
    app.post(
        "/v1/webhooks",
        zValidator("json", webhookSchema, () => {}),
        async (c) => {
            try {
                const data = new Data();
                let webhook_data = c.req.valid("json");
                webhook_data = webhookSchema.parse(webhook_data);
                const webhook = await data.addWebhook(webhook_data);
                return c.json(webhook);
            } catch (error) {
                console.error(error);
                return c.json({ error: error.message });
            }
        }
    );

    app.get("/v1/webhooks", async (c) => {
        try {
            const { agent_id } = c.req.query();
            const data = new Data();
            const webhooks = await data.getWebhooks(agent_id);
            return c.json(webhooks);
        } catch (error) {
            console.error("Error GET /v1/webhooks");
            return c.json({
                error: error.message,
            });
        }
    });
};
