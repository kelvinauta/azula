importder>f { embed } from "ai";
import { openai } from "@ai-sdk/openai";
class EmbeddingEngine {
    constructor() {
        this.create_embedding = null;
    }
    async set_open_ai({ openai_key, model }) {
        this.create_embedding = async (text) => {
            const { embedding } = await embed({
                model: openai.embedding(model),
                value: text,
                apiKey: openai_key,
            });
            return embedding;
        };
        return this.create_embedding
    }
}

export default EmbeddingEngine;
