import { string, array, object, optional, assert, define } from "superstruct";
import LLM from "../llm";
import Data from "../data";
import Text from "../text";
import Tools from "./tools.js";
const { agent_tools, system_tools, message_tools } = Tools;
class Builder {
    static input_schema = {
        context: object({
            chat: string(),
            human: optional(string()),
            agent: optional(string()),
            channel: string(),
            metadata: optional(
                object({
                    name: optional(string()),
                    phone: optional(string()),
                    profile_url: optional(string()),
                })
            ),
        }),
        message: object({
            texts: array(string()),
        }),
    };
    constructor({ context, message }) {
        this.context = context;
        this.message = message;
        if (!this.context.chat) {
            this.context.chat = `${this.context.channel}-${this.context.human}`;
        }
        this.answer = null;
        this.Data = new Data();
        this.Data.setContext(this.context);
    }
    async run() {
        assert(this.context, Builder.input_schema.context);
        assert(this.message, Builder.input_schema.message);
        assert(
            this.context,
            define("Human or Agent required", (context) => {
                return Boolean(context.agent) || Boolean(context.human);
            })
        );
        const { messages, llm, tools } = await this.#build();
        const answer = await llm.generate_text(messages, tools);
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
