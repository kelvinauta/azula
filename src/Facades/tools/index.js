class Tools {
    getPromptFunctions() {
        return {
            function1: () => {},
        };
    }
    getAiTools() {
        return {
            function1: () => {},
        };
    }
    getMessageFunctions() {
        return {
            function1: () => {},
        };
    }
    get() {
        return {
            to: {
                prompt: this.getPromptFunctions(),
                ai: this.getAiTools(),
                answer: this.getMessageFunctions(),
            },
        };
    }
}

export default Tools;
