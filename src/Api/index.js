
import Start from "../Start";

import { chatRoute } from "./routes/chat.route";
import { agentRoute } from "./routes/agent.route";
import { toolRouter } from "./routes/tool.route";
import { webhookRouter } from "./routes/webhook.route";
import config from "./config/contants";
import app from "./lib/hono";

await Start();

chatRoute(app);
agentRoute(app);
toolRouter(app);
webhookRouter(app);

export default {
    port: config.PORT,
    fetch: app.fetch,
};
