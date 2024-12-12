import { createOpenAI } from "@ai-sdk/openai"
import { generateText, tool } from "ai"
import { assert, optional, defaulted, number, object, string, enums, array, boolean, func } from "superstruct"

class LLM {
    static llm_engine_schema = {
        model: string(),
        provider: enums(["openai", "anthropic"]),
        max_tokens: defaulted(number(), 256),
        temperature: defaulted(number(), 1), // TODO: coercion min an max values
        api_key: string()
    }
    static llm_input_schema = {
        llm_engine: object(LLM.llm_engine_schema),
        messages: array(), // TODO: validation of message schema
        tools: optional(array(object(LLM.llm_tool))), // TODO: validation of tools schema

    }
    static llm_tool = {
        name: string(),
        description: string(),
        strict: defaulted(boolean()),
        parameters: object(),
        execute: func()
    }

    generate_tools() {
        if (!this.llm_input.tools) return null
        let tools = {}
        for (const t of this.llm_input.tools) {
            tools[t.name] = tool(t)
        }
        return tools
    }
    generate_model() {
        assert(this.llm_input.llm_engine, object(LLM.llm_engine_schema))
        let model
        if (this.llm_input.llm_engine.provider == "openai") model = createOpenAI({
            apiKey: this.llm_input.llm_engine.api_key,
            compatibility: "strict"
        })(this.llm_input.llm_engine.model)
        return model
    }
    constructor(llm_input) {
        assert(llm_input, object(LLM.llm_input_schema))
        this.llm_input = llm_input
    }
    async run() {
        const model = this.generate_model()
        const tools = this.generate_tools()
        const generateTextConfig = {
            model,
            messages: this.llm_input.messages
        }
        if (tools) generateTextConfig.tools = tools
        const llm_response = await generateText(generateTextConfig)
        return llm_response
    }
}

export default LLM
