class ProxyTool {
    static openai_schema = {
        name: this.name,
        description: "Este es un ProxyTool",
        strict: true,
        parameters: {
            // Json Schema
            // https://platform.openai.com/docs/api-reference/chat/create
            // https://json-schema.org/understanding-json-schema
        },
    };
    async run(parameters) {
        // Consulta a la API
        // Parsing de Datos

        // * Validate Result #validate_result
    }
    #validate_result(result) {
        const max_length = 4500;
        if (!result) throw new Error("Result is required");
        if (typeof result !== "string")
            throw new Error("Result must be a string");
        if (result.length > 4500) throw new Error("Result is very long text");
        return true;
    }
}

export default ProxyTool
