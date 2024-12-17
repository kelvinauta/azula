import { string, array, object, optional } from "superstruct";
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
    run() {

        const message = { texts: ["hola"] };
        const llm = {
            model: "gpt-4o",
        };
        const agent = {
            config: {
                prompt: "Eres un agente",
            },
            tools: {},
            bulks: {
                id: "1234",
            },
        };
        const history = [
            {
                role: "user",
                content: "Hola",
            },
        ];
    }
}
