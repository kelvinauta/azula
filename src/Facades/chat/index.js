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
    constructor({ context, message }) {
        this.context = context;
        this.message = message;
    }
    async run() {
        const llm = new LLM(agent.llm_engine);
        const messages = await this.#buildMessages()
        const tools = new Tools().get().to.ai
        const answer = llm.generate_text(messages, tools)
    }
    async #buildMessages(){
        const { message, agent, history } = await this.#getData();
        const args = this.#getArgs({
            message,
            history,
            agent,
            context: this.context
        })
        const messages = await this.#buildMessages({
            system_prompt: agent.config.prompt,
            message,
            history,
            args
        })

        return messages
    }
    async #getData() {
        const data = new Data({
            context: this.context,
            message: this.message,
        });
        const [message, agent, history] = await Promise.all([
            data.getMessage(),
            data.getAgent(),
            data.getHistory(),
        ])
        return {
            message,
            agent,
            history,
        };
    }
    async #buildMessages({ system_prompt, message, history, args }) {
        const tools = new Tools();
        const functions = tools.getPromptFunctions()
        const system = {
            role: "system",
            content: await Text.processor({ system_prompt, functions, args }),
        };
        const new_messages = message.texts((txt)=>({
            role: "user",
            content: txt
        }))
        const messages = [
            system,
            ...history,
            ...new_messages
        ]
        return messages
    }
    #getArgs({ message, history, agent, context }){
        return {
            message,
            history,
            agent,
            context
        }
    }
}
export default Builder
