import { string, array, object, optional, assert } from "superstruct";
import LLM from "../llm";
import Data from "../db";
import Text from "../text";
import Tools from "../tools";
class Builder {
    static input_schema = {
        context: object({
            chat: string(),
            human: optional( string() ),
            agent: optional( string() ),
            channel: string(),
            metadata: optional(
                object({
                    name: optional( string() ),
                    phone: optional( string() ),
                    profile_url: optional( string() ),
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
        this.answer = null;
        this.Tools = tools || new Tools();
        this.Data = new Data();
        this.Data.setContext(this.context);
    }
    async run() {
        assert(this.context, Builder.input_schema.context)
        assert(this.message, Builder.input_schema.message)
        const { messages, llm, tools } = await this.#build();
        const answer = await llm.generate_text(messages, tools.get().to.ai);
        this.answer = answer;
        console.log("_______");
        console.log(`De: ${this.context.agent ? "Agente" : "Humano"}`);
        console.log(`Para: ${this.context.agent ? "Humano" : "Agente"}`);
        console.log(messages);
        console.log(answer.text);
        console.log("_______");
        return {
            text: answer.text,
            toolCalls: answer.toolCalls,
            toolResults: answer.toolResults,
            finishReason: answer.finishReason,
        };
    }
    async saveAnswer(answer) {
        return await this.Data.pushAnswer(answer);
    }
    async #build() {
        const tools = this.Tools;
        const [agent, history] = await Promise.all([
            this.Data.getAgent(),
            this.Data.getHistory(),
        ]);
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
            tools,
        });
        this.Data.setMessage({
            texts: new_messages
        });
        const message = await this.Data.getMessage();
        const llm = new LLM(agent.llm_engine);
        const messages = this.#parseMessagesToLLM(
            system,
            message.texts,
            history,
        );
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

    async #buildMessages({ system_prompt, message, args, tools }) {
        const functionsPrompt = tools.get().to.prompt;
        const functionsMessage = tools.get().to.message;
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
            }),
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
