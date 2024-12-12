import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

class Query {
    constructor(client, ai) {
        this.client = client;
        this.ai = ai;
    }

    async one(queryInput) {
        try {
            console.log("Iniciando búsqueda vectorial", { input: queryInput });

            const { text, categories, limit = 10 } = queryInput;

            if (!text) {
                console.error("Text es requerido para la búsqueda");
                throw new Error("Text es requerido");
            }

            // Generar embedding para el texto de búsqueda
            console.log("Generando embedding para la búsqueda");
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-large"),
                value: text,
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Procesar cada grupo de categorías
            const results = await Promise.all(
                categories.map(async (group) => {
                    const sql = `
                        SELECT 
                            b.*, 
                            vector_distance_cos(embedding, vector32(:embedding)) as similarity
                        FROM vector_top_k('bulks_embedding_idx', :search_vector, ${limit}) t
                        JOIN bulks b ON b.rowid = t.id
                        WHERE (:use_categories = 0) OR (category = :category)
                        ORDER BY similarity ASC
                        LIMIT :result_limit
                    `;

                    const result = await this.client.execute({
                        sql,
                        args: {
                            embedding: JSON.stringify(embedding),
                            search_vector: JSON.stringify(embedding),
                            result_limit: limit,
                            use_categories: group.includes("*") ? 0 : 1,
                            category: group.includes("*") ? "" : group[0],
                        },
                    });

                    return result.rows;
                }),
            );

            return {
                text,
                categories,
                limit,
                documents: results,
            };
        } catch (error) {
            console.error("Error en búsqueda vectorial", {
                error: error.message,
            });
            throw error;
        }
    }
    async many(queryInputs) {
        try {
            console.log("Iniciando búsquedas vectoriales múltiples", {
                count: queryInputs.length,
            });

            if (!Array.isArray(queryInputs) || queryInputs.length === 0) {
                console.error("Se requiere un array de búsquedas no vacío");
                throw new Error("Se requiere un array de búsquedas no vacío");
            }

            const results = await Promise.all(
                queryInputs.map((queryInput) => this.one(queryInput)),
            );

            return results;
        } catch (error) {
            console.error("Error en búsquedas vectoriales múltiples", {
                error: error.message,
            });
            throw error;
        }
    }
    j;
}

export default Query;
