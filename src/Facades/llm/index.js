import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import {
    assert,
    optional,
    defaulted,
    number,
    object,
    string,
    enums,
    array,
    boolean,
    func,
    create,
    any
} from 'superstruct';
class LLM {
    static schema = {
        input: {
            llm_engine: {
                model: string(),
                provider: enums(['openai', 'anthropic']),
                max_tokens: defaulted(number(), 256),
                temperature: defaulted(number(), 1),
                api_key: string(),
            },
            generate_text: {
                messages: array(
                    object({
                        role: string(),
                        content: any()
                    })
                ),
            },
            tool: {
                name: string(),
                description: string(),
                strict: defaulted(boolean(), false),
                parameters: object(),
                execute: func(),
            },
        },
    };
    constructor(llm_engine) {
        this.llm_engine = this.#generate_llm_engine(llm_engine);
    }
    async generate_text(messages, tools, { maxSteps = 5 } = {}) {
        const _messages = this.#build_message(messages);
        const generateTextConfig = {
            model: this.llm_engine.model,
            messages: _messages,
            maxTokens: this.llm_engine.max_tokens,
        };
        if (tools) generateTextConfig.tools = this.#build_tools(tools);
        if (maxSteps) generateTextConfig.maxSteps = maxSteps;
        const response = await generateText(generateTextConfig);
        return response;
    }
    #build_message(messages) {
        assert(messages, LLM.schema.input.generate_text.messages);
        return create(messages, LLM.schema.input.generate_text.messages);
    }
    #build_tools(tools) {
        assert(tools, array(object(LLM.schema.input.tool)));
        tools = create(tools, array(object(LLM.schema.input.tool)));
        let new_tools = {};
        for (const t of tools) {
            new_tools[t.name] = tool(t);
        }
        return new_tools;
    }
    #generate_llm_engine(llm_engine) {
        assert(llm_engine, object(LLM.schema.input.llm_engine));
        const engine = create(llm_engine, object(LLM.schema.input.llm_engine));
        if (engine.provider === 'openai') {
            engine.model = createOpenAI({
                apiKey: engine.api_key,
                compatibility: 'strict',
            })(engine.model);
        }
        return engine;
    }
}
export default LLM;
