import ai from "./ai";
import prompt from "./prompt";
import messages from "./messages";
import get_functions from "../../Start/get_functions";
const custom_functions = await get_functions();
class Tools {
    constructor(messageFunctions = {}, promptFunctions = {}, aiTools = []) {
        this.aiTools = [...ai, ...aiTools];
        this.promptFunctions = {
            ...prompt,
            ...promptFunctions,
        };
        this.messageFunctions = {
            ...messages,
            ...messageFunctions,
        };
        if(Boolean(custom_functions)){
            Boolean(custom_functions.ai) && this.setAiTools(custom_functions.ai)
            Boolean(custom_functions.prompt) && this.setPromptFunctions(custom_functions.prompt)
            Boolean(custom_functions.messages) && this.setMessageFunctions(custom_functions.messages)
        }
    }
    setAiTools(aiTools) {
        this.aiTools = [
            ...this.aiTools,
            ...aiTools,
        ];
    }
    setPromptFunctions(promptFunctions) {
        this.promptFunctions = {
            ...this.promptFunctions,
            ...promptFunctions,
        };
    }
    setMessageFunctions(messageFunctions) {
        this.messageFunctions = {
            ...this.messageFunctions,
            ...messageFunctions,
        };
    }
    get() {
        return {
            to: {
                ai: this.aiTools,
                prompt: this.promptFunctions,
                message: this.messageFunctions,
            },
        };
    }
}
export default Tools;
