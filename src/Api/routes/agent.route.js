import { zValidator } from "@hono/zod-validator";
import Data from "../../Facades/data";
import { agentSchema } from "../schema/agent.schema";

export const agentRoute = (app) => {
    app.post(
        "/v1/agents",
        zValidator("json", agentSchema, () => {}),
        async (c) => {
            try {
                const data = new Data();
                const new_agent = c.req.valid("json");
                const agent = await data.addAgent(new_agent);
                return c.json(agent);
            } catch (error) {
                console.error("erro en /v1/agent post", error);
                return c.json(
                    {
                        error: error.message,
                    },
                    500
                );
            }
        }
    );

    app.get("/v1/agents", async (c) => {
        try {
            const data = new Data();
            const agents = await data.getAllAgents();
            const res = c.json(agents);
            return res;
        } catch (error) {
            console.error("Error GET /v1/agents");
            return c.json({
                error: error.message,
            });
        }
    });
};
