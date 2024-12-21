class Tools {
    getPromptFunctions() {
        return {
            function1: () => {},
        };
    }
    getAiTools() {
        return [
        ];
    }
    getMessageFunctions() {
        return {
            function1: () => {},
        };
    }
    get() {
        return {
            to: {
                ai: this.getAiTools(),
                prompt: this.getPromptFunctions(),
                answer: this.getMessageFunctions(),
            },
        };
    }
}

export default Tools;
