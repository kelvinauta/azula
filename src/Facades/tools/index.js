import ai from "./ai";
import prompt from "./prompt";
import messages from "./messages";
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
    }
    setAiTools(aiTools) {
        this.aiTools = {
            ...this.aiTools,
            aiTools,
        };
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
