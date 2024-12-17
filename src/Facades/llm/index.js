import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import {
    assert,
    defaulted,
    number,
    object,
    string,
    enums,
    array,
    boolean,
    func,
    create,
} from "superstruct";

class LLM {
    static schema = {
        input: {
            llm_engine: {
                model: string(),
                provider: enums(["openai", "anthropic"]),
                max_tokens: defaulted(number(), 256),
                temperature: defaulted(number(), 1),
                api_key: string(),
            },
            generate_text: {
                messages: array(
                    object({
                        role: string(),
                        content: string(),
                    }),
                ),
            },
            tool: {
                name: string(),
                description: string(),
                strict: defaulted(boolean()),
                parameters: object(),
                execute: func(),
            },
        },
    };

    constructor(llm_engine) {
        this.llm_engine = this.#generate_llm_engine(llm_engine);
    }
    async generate_text(messages, tools) {
        const _messages = this.#build_message(messages);
        const generateTextConfig = {
            model: this.llm_engine.model,
            messages: _messages
        }
        if(tools) generateTextConfig.tools = this.#build_tools(tools)
        const response = await generateText(generateTextConfig)
        return response
    }
    #build_message(messages) {
        assert(messages, LLM.schema.input.generate_text.messages);
        messages = create(messages, LLM.schema.input.generate_text.messages);
        return messages;
    }
    #build_tools(tools) {
        assert(tools, array(LLM.schema.input.tool));
        tools = create(tools, array(LLM.schema.input.tool));
        if (!tools) return;
        let new_tools = {};
        for (const t of tools) {
            new_tools[t.name] = tool(t);
        }
        return tools;
    }
    #generate_llm_engine(llm_engine) {
        assert(llm_engine, object(LLM.schema.input.llm_engine));
        llm_engine = create(object(LLM.schema.input.llm_engine));
        let model;
        if (this.llm_input.llm_engine.provider == "openai")
            model = createOpenAI({
                apiKey: this.llm_input.llm_engine.api_key,
                compatibility: "strict",
            })(this.llm_input.llm_engine.model);
        llm_engine.model = model;
        return llm_engine;
    }
}

export default LLM;
