import LLM from "../llm";
import Data from "../data";
import Text from "../text";
import Tools from "./tools.js";
import Webhooks from "./webhooks.js";
import { z } from "zod";
const { agent_tools, system_tools, message_tools } = Tools;
const { builder_webhooks } = Webhooks;
class Builder {
    static input_schema = z.object({
        context: z
            .object({
                chat: z.string(),
                human: z.string(),
                agent: z.string().optional(),
                channel: z.string(),
                metadata: z
                    .object({
                        name: z.string().optional(),
                        phone: z.string().optional(),
                        profile_url: z.string().optional(),
                    })
                    .optional(),
            })
            .refine((context) => Boolean(context.agent) || Boolean(context.human), {
                message: "Human or Agent required",
            }),
        message: z.object({
            texts: z.array(z.string()),
        }),
    });
    constructor({ context, message }) {
        this.context = context;
        this.message = message;
        if (!this.context.chat) {
            this.context.chat = `${this.context.channel}-${this.context.human}`;
        }
        Builder.input_schema.parse({ context: this.context, message: this.message });

        this.answer = null;
        this.Data = new Data();
        this.Data.setContext(this.context);
    }
    async run() {
        const { messages, llm, tools, agent } = await this.#build();
        const answer = await llm.generate_text(messages, tools);
        this.#build_data_template(agent, answer, this.context);

        this.answer = answer;
        return {
            output: {
                text: answer.text,
                finishReason: answer.finishReason,
                llm_messages: answer.response.messages,
            },
            input: {
                messages,
                tools,
                llm_engine: llm.llm_engine,
            },
        };
    }
    async saveAnswer(answer) {
        return await this.Data.pushAnswer(answer);
    }
    async #build() {
        const [agent, history] = await Promise.all([this.Data.getAgent(), this.Data.getHistory()]);
        if (!agent)
            throw new Error(
                "There is no LLM agent that can answer this request; try creating one with channel=default."
            );
        const tools_of_agent = await this.Data.getTools(agent.id);
        const tools = agent_tools(tools_of_agent);
        const args = this.#getArgs({
            message: this.message,
            history,
            agent,
            context: this.context,
        });
        const { new_messages, system } = await this.#buildMessages({
            system_prompt: agent.config.prompt,
            message: this.message,
            args,
        });
        this.Data.setMessage({
            texts: new_messages,
        });
        const message = await this.Data.getMessage();
        const llm = new LLM(agent.llm_engine);
        const messages = this.#parseMessagesToLLM(system, message.texts, history);
        return {
            messages,
            llm,
            tools,
            agent,
        };
    }
    #parseMessagesToLLM(system, new_messages, history) {
        const system_llm = {
            role: "system",
            content: system,
        };
        const user_messages = new_messages.map((txt) => ({
            role: "user",
            content: txt,
        }));
        return [system_llm, ...history, ...user_messages];
    }

    async #buildMessages({ system_prompt, message, args }) {
        const functionsPrompt = system_tools;
        const functionsMessage = message_tools;
        const system = await Text.processor({
            text: system_prompt,
            functions: functionsPrompt,
            args,
        });
        const promises = message.texts.map((txt) =>
            Text.processor({
                text: txt,
                functions: functionsMessage,
                args,
            })
        );
        const new_messages = await Promise.all(promises);
        return {
            system,
            new_messages,
        };
    }
    #build_data_template(agent, answer, context) {
        const webhookData = agent.Webhooks[0]?.dataValues;

        const templateData = {
            human: context.human,
            channel: agent.channel,
            answer: answer.text,
        };

        if (webhookData) {
            builder_webhooks(webhookData, templateData);
        }
    }
    #getArgs({ message, history, agent, context }) {
        return {
            message,
            history,
            agent,
            context,
        };
    }
}
export default Builder;
