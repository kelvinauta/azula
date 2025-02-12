/*der>f TODO: Si un documento tiene el mismo title  que uno que ya existe entonces reemplaza el anterior */
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
class Insert {
    constructor(client, ai) {
        this.client = client;
        this.ai = ai;
    }
    async one({ title, content, category }) {
        try {
            if (!title || !content) {
                console.error("Campos requeridos faltantes");
                throw new Error("Los campos title y content son requeridos");
            }
            await this.client.execute({
                sql: "DELETE FROM bulks WHERE title = :title",
                args: { title },
            });
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-large"),
                value: content,
                apiKey: process.env.OPENAI_API_KEY,
            });
            const result = await this.client.execute({
                sql: `INSERT INTO bulks (title, content, category, embedding) 
                  VALUES (:title, :content, :category, vector32(:embedding))`,
                args: {
                    title,
                    content,
                    category,
                    embedding: JSON.stringify(embedding),
                },
            });
            return result;
        } catch (error) {
            console.error("Error al insertar documento", {
                error: error.message,
            });
            throw error;
        }
    }
    async many(documents) {
        try {
            if (!Array.isArray(documents) || documents.length === 0) {
                console.error("Se requiere un array de documentos no vacío");
                throw new Error("Se requiere un array de documentos no vacío");
            }
            documents.forEach((doc, index) => {
                if (!doc.title || !doc.content) {
                    console.error("Documento inválido", { index, doc });
                    throw new Error(
                        `Documento ${index} inválido: title y content son requeridos`,
                    );
                }
            });
            const titles = documents.map((doc) => doc.title);
            const placeholders = titles.map((_, i) => `:title${i}`).join(",");
            await this.client.execute({
                sql: `DELETE FROM bulks WHERE title IN (${placeholders})`,
                args: titles.reduce((acc, title, i) => {
                    acc[`title${i}`] = title;
                    return acc;
                }, {}),
            });
            const { embeddings } = await embedMany({
                model: openai.embedding("text-embedding-3-large"),
                values: documents.map((doc) => doc.content),
                apiKey: process.env.OPENAI_API_KEY,
            });
            const insertPlaceholders = documents
                .map(
                    (_, i) =>
                        `(:title${i}, :content${i}, :category${i}, vector32(:embedding${i}))`,
                )
                .join(",");
            const insertArgs = documents.reduce((acc, doc, i) => {
                acc[`title${i}`] = doc.title;
                acc[`content${i}`] = doc.content;
                acc[`category${i}`] = doc.category;
                acc[`embedding${i}`] = JSON.stringify(embeddings[i]);
                return acc;
            }, {});
            const result = await this.client.execute({
                sql: `INSERT INTO bulks (title, content, category, embedding) VALUES ${insertPlaceholders}`,
                args: insertArgs,
            });
            return result;
        } catch (error) {
            console.error("Error en inserción múltiple", {
                error: error.message,
            });
            throw error;
        }
    }
}
export default Insert;
