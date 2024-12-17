import { string, array, object, optional } from "superstruct";
import LLM from "../llm";
import Data from "../db";
class builder {
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
        this.context = context
        this.message = message
    }
    async run() {
        const {message, agent, history} = await this.#getData()
        const llm = new LLM(agent.llm_engine)
    }
    async #getData(){
        const data = new Data()
        await data.init({
            context: this.context,
            message: this.message
        })
        const message = data.getMessage()
        const agent = data.getAgent()
        const history = data.getHistory()
        return {
            message,
            agent,
            history
        }
    }
}
