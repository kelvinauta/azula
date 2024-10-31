import LLM from "./composers/llm.js"
import Rules from "../helpers/Rules.js"
import _openai from "openai"
import LOGGER from "tuki_logger"
class OpenAI extends LLM {
    constructor() {
        super()
        this.rules = new Rules({
            strict: true,
            prefix: 'openai',
            concatPrefix: true
        })
        this.logger = new LOGGER({
            title: 'OpenAI Logger',
            save: true
        })


        this.config = {}
        this.client;
    }

    info(){
        console.log('OpenAI info')
        return "OpenAI"
    }
    set_config({
        api_key,
        model="gpt-4o",
        temperature= 2,
        max_tokens= 1024,
        top_p= 1,
        frequency_penalty= 0,
        presence_penalty= 0,
    }){
        const rules = this.rules.add_prefix('.config')
        this._validate_config({
            api_key,
            model,
            temperature,
            max_tokens,
            top_p,
            frequency_penalty,
            presence_penalty
        }, rules)
        this.client = new _openai({
            apiKey: api_key
        })
    }
    async check(){
        const rules = this.rules.add_prefix('.check')
        this._validate_config(this.config, rules)
        rules(
            ['client is required', !this.client],
            ['client must be an instance of OpenAI'], !(this.client instanceof _openai)
        )
        const list = await _openai.models.list();
        this.logger.info(list)


    }
    run(){
        console.log('OpenAI run')
    }


    _validate_config(config, rules){
        if(!rules instanceof Rules) throw new Error('Rules is required')
        rules(
            ['config is required', !config],
            ['api_key is required', !config.api_key],
            ['model is required', !config.model],
            ['temperature is required', !config.temperature],
            ['max_tokens is required', !config.max_tokens],
            ['top_p is required', !config.top_p],
            ['frequency_penalty is required', !config.frequency_penalty],
            ['presence_penalty is required', !config.presence_penalty],
            ['api_key must be a string', typeof config.api_key !== 'string'],
            ['model must be a string', typeof config.model !== 'string'],
            ['temperature must be a number', typeof config.temperature !== 'number'],
            ['max_tokens must be a number', typeof config.max_tokens !== 'number'],
            ['top_p must be a number', typeof config.top_p !== 'number'],
            ['frequency_penalty must be a number', typeof config.frequency_penalty !== 'number'],
            ['presence_penalty must be a number', typeof config.presence_penalty !== 'number']
        )
      
    }
}

export default OpenAI