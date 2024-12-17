class Data {
    async init() {}
    getMessage() {}
    getAgent() {
        return {
            config: {
                prompt: "Eres un agente",
            },
            tools: {},
            bulks: {
                id: "1234",
            },
        };
    }
    getHistory() {
        return [
            {
                role: "user",
                content: "Hola",
            },
        ];
    }
    getDocuments(){

    }
}

export default Data;
