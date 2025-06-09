import Data from "../../Facades/data";
import { zValidator } from "@hono/zod-validator";
import { toolSchema } from "../schema/tool.schema";

export const toolRouter = (app) => {
    app.post(
        "/v1/tools",
        zValidator("json", toolSchema, () => {}),
        async (c) => {
            try {
                const data = new Data();
                let tool_data = c.req.valid("json");
                tool_data = toolSchema.parse(tool_data);
                let http_data;
                if (tool_data.http) http_data = tool_data.http;
                const tool = await data.addTool(tool_data, http_data);
                return c.json(tool);
            } catch (error) {
                console.error(error);
                return c.json({ error: error.message });
            }
        }
    );

    app.get("/v1/tools", async (c) => {
        try {
            const { agent_id } = c.req.query();
            const data = new Data();
            const tools = await data.getTools(agent_id);
            return c.json(tools);
        } catch (error) {
            console.error("Error GET /v1/tools");
            return c.json({
                error: error.message,
            });
        }
    });
};
