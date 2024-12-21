import { string, array, object, optional } from "superstruct";
import LLM from "../llm";
import Data from "../db";
import Text from "../text";
import Tools from "../tools";
class Builder {
    static input_schema = {
        context: object({
            chat: string(),
            human: string(),
            channel: string(),
            metadata: optional(
                object({
                    name: string(),
                    phone: string(),
                    profile_url: string(),
                }),
            ),
        }),
        message: object({
            texts: array(string()),
        }),
    };
    constructor({ context, message, tools }) {
        this.context = context;
        this.message = message;
        this.Tools = tools || new Tools();
        this.answer = null;
        this.data = new Data({
            context: this.context,
            message: this.message,
        });
    }
    async run() {
        const { messages, llm, tools } = await this.#build();
        const answer = await llm.generate_text(messages, tools.get().to.ai);
        this.answer = answer;
        return {
            text: answer.text,
            toolCalls: answer.toolCalls,
            toolResults: answer.toolResults,
            finishReason: answer.finishReason
        }
    }
    async saveAnswer(answer) {
        return await this.data.pushAnswer(answer)
    }
    async #build() {
        const { message, agent, history } = await this.#getData();
        const tools = this.Tools;
        const llm = new LLM(agent.llm_engine);
        const args = this.#getArgs({
            message,
            history,
            agent,
            context: this.context,
        });
        const messages = await this.#buildMessages({
            system_prompt: agent.config.prompt,
            message,
            history,
            args,
            tools,
        });

        return {
            messages,
            llm,
            tools,
        };
    }
    async #buildMessages({ system_prompt, message, history, args, tools }) {
        const functions = tools.get().to.prompt;
        const system = {
            role: "system",
            content: await Text.processor({
                text: system_prompt,
                functions,
                args,
            }),
        };
        const new_messages = message.texts.map((txt) => ({
            role: "user",
            content: txt,
        }));
        const messages = [system, ...history, ...new_messages];
        return messages;
    }
    async #getData() {
        const [message, agent, history] = await Promise.all([
            this.data.getMessage(),
            this.data.getAgent(),
            this.data.getHistory(),
        ]);
        return {
            message,
            agent,
            history,
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
