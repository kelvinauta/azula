class Tools {
    constructor(messageFunctions, promptFunctions, aiTools) {
        this.aiTools = aiTools
        this.promptFunctions = promptFunctions
        this.messageFunctions = messageFunctions
    }
    setAiTools(aiTools) {
        this.aiTools = aiTools;
    }
    setPromptFunctions(promptFunctions) {
        this.promptFunctions = promptFunctions;
    }
    setMessageFunctions(messageFunctions) {
        this.messageFunctions = messageFunctions;
    }
    get() {
        return {
            to: {
                ai: this.aiTools,
                prompt: this.promptFunctions,
                answer: this.messageFunctions,
            },
        };
    }
}
export default Tools;
