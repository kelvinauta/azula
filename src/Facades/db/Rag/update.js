import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
class update {
    constructor(client, ai) {
        this.client = client;
        this.ai = ai;
    }
    async one({ id, title, content, category }) {
        try {
            if (!id) {
                console.error("id requerido para actualización");
                throw new Error("id es requerido");
            }
            let embedding = null;
            if (content) {
                const { embedding: newembedding } = await embed({
                    model: openai.embedding("text-embedding-3-large"),
                    value: content,
                    apikey: process.env.OPENAI_API_KEY,
                });
                embedding = newembedding;
            }
            const updates = [];
            const values = [];
            if (title) {
                updates.push("title = ?");
                values.push(title);
            }
            if (content) {
                updates.push("content = ?");
                values.push(content);
            }
            if (category) {
                updates.push("category = ?");
                values.push(category);
            }
            if (embedding) {
                updates.push("embedding = vector32(?)");
                values.push(JSON.stringify(embedding));
            }
            updates.push("updated_at = current_timestamp");
            values.push(id);
            const result = await this.client.execute({
                sql: `update bulks set ${updates.join(", ")} where id = ?`,
                args: values,
            });
            return result;
        } catch (error) {
            console.error("error al actualizar documento", {
                error: error.message,
            });
            throw error;
        }
    }
    async many(documents) {
        try {
            if (!Array.isArray(documents) || documents.length === 0) {
                console.error("se requiere un array de documentos no vacío");
                throw new Error("se requiere un array de documentos no vacío");
            }
            documents.forEach((doc, index) => {
                if (!doc.id) {
                    console.error("documento sin id", { index });
                    throw new Error(
                        `documento ${index} inválido: id es requerido`,
                    );
                }
            });
            const results = await Promise.all(
                documents.map((doc) => this.one(doc)),
            );
            return results;
        } catch (error) {
            console.error("error en actualización múltiple", {
                error: error.message,
            });
            throw error;
        }
    }
    async category({ old_category, new_category }) {
        try {
            if (!old_category || !new_category) {
                console.error("se requieren ambas categorías");
                throw new Error("old_category y new_category son requeridos");
            }
            const result = await this.client.execute({
                sql: `update bulks set category = ?, updated_at = current_timestamp where category = ?`,
                args: [new_category, old_category],
            });
            return result;
        } catch (error) {
            console.error("error al actualizar categorías", {
                error: error.message,
            });
            throw error;
        }
    }
}
export default update;
