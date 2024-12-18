import { string, array, object, optional } from "superstruct";
import LLM from "../llm";
import Data from "../db";
import Text from "../text";
import Tools from "../tools";
class Builder {
    static input_schema = {
        context: object({
            human: string(),
            origin: string(),
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
        const { message, agent, history } = await this.#getData();
        const llm = new LLM(agent.llm_engine);
        const messages = await this.#buildMessages()
        
    }
    async #getData() {
        const data = new Data();
        await data.init({
            context: this.context,
            message: this.message,
        });
        const message = data.getMessage();
        const agent = data.getAgent();
        const history = data.getHistory();
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
    async #getArgs({ message, history, agent, context }){
        return {
            message,
            history,
            agent,
            context
        }
    }
}
export default Builder
