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
};
