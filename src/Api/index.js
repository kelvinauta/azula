import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import Builder from '../Facades/builder';
import Data from '../Facades/data';
import Start from '../Start';

const app = new Hono();
await Start();
const chatSchema = z.object({
    context: z.object({
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
const agentSchema = z.object({
    name: z.string(),
    prompt: z.string(),
    channel: z.string(),
    llm_engine: z.object({
        model: z.string().default('gpt-4o'),
        provider: z.enum(['openai']).default('openai'),
        max_tokens: z.number().min(0).default(256),
        api_key: z.string(),
    }),
});
app.post(
    '/v1/chat',
    zValidator('json', chatSchema, () => {}),
    async (c) => {
        try {
            const body = c.req.valid('json');
            const builder = new Builder({
                context: body.context,
                message: body.message,
            });
            const answer = await builder.run();
            builder.saveAnswer(answer).catch(console.error);
            return c.json(answer.output);
        } catch (error) {
            console.error('Error en /v1/chat:', error);
            return c.json(
                {
                    error,
                },
                500
            );
        }
    }
);
app.post(
    '/v1/agents',
    zValidator('json', agentSchema, () => {}),
    async (c) => {
        try {
            const data = new Data();
            const new_agent = c.req.valid('json');
            const agent = await data.addAgent(new_agent);
            return c.json(agent);
        } catch (error) {
            console.error('erro en /v1/agent post', error);
            return c.json(
                {
                    error,
                },
                500
            );
        }
    }
);
app.get('v1/agents', async (c) => {
    try {
        const data = new Data();
        const agents = await data.getAllAgents();
        return c.json(agents)
    } catch (error) {
        console.error('Error GET /v1/agents');
        return c.json({
            error,
        });
    }
});
export default {
    port: process.env.APP_PORT,
    fetch: app.fetch,
};
