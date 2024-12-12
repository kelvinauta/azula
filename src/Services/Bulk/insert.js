// TODO: Si un documento tiene el mismo title  que uno que ya existe entonces reemplaza el anterior
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

class Insert {
    constructor(client, ai) {
        this.client = client;
        this.ai = ai;
    }
    async one({ title, content, category }) {
        try {
            console.log("Iniciando proceso de inserción de documento");

            // Validar campos requeridos
            if (!title || !content) {
                console.error("Campos requeridos faltantes");
                throw new Error("Los campos title y content son requeridos");
            }

            // Eliminar documento existente con el mismo título
            console.log("Verificando documento existente con el mismo título");
            await this.client.execute({
                sql: "DELETE FROM bulks WHERE title = :title",
                args: { title },
            });

            // Generar embedding
            console.log("Generando embedding para el contenido");
            const { embedding } = await embed({
                model: openai.embedding("text-embedding-3-large"),
                value: content,
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Insertar documento
            console.log("Insertando documento en la base de datos");
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

            console.log("Documento insertado exitosamente");
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
            console.log("Iniciando proceso de inserción múltiple", {
                count: documents.length,
            });

            // Validar documentos
            if (!Array.isArray(documents) || documents.length === 0) {
                console.error("Se requiere un array de documentos no vacío");
                throw new Error("Se requiere un array de documentos no vacío");
            }

            // Validar campos requeridos
            documents.forEach((doc, index) => {
                if (!doc.title || !doc.content) {
                    console.error("Documento inválido", { index, doc });
                    throw new Error(
                        `Documento ${index} inválido: title y content son requeridos`,
                    );
                }
            });

            // Eliminar documentos existentes con los mismos títulos
            console.log(
                "Eliminando documentos existentes con títulos duplicados",
            );
            const titles = documents.map((doc) => doc.title);
            const placeholders = titles.map((_, i) => `:title${i}`).join(",");

            await this.client.execute({
                sql: `DELETE FROM bulks WHERE title IN (${placeholders})`,
                args: titles.reduce((acc, title, i) => {
                    acc[`title${i}`] = title;
                    return acc;
                }, {}),
            });

            // Generar embeddings para todos los contenidos
            console.log("Generando embeddings para los documentos");
            const { embeddings } = await embedMany({
                model: openai.embedding("text-embedding-3-large"),
                values: documents.map((doc) => doc.content),
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Construir consulta para inserción múltiple
            console.log("Preparando inserción en batch");
            const insertPlaceholders = documents
                .map(
                    (_, i) =>
                        `(:title${i}, :content${i}, :category${i}, vector32(:embedding${i}))`,
                )
                .join(",");

            // Preparar argumentos para la inserción
            const insertArgs = documents.reduce((acc, doc, i) => {
                acc[`title${i}`] = doc.title;
                acc[`content${i}`] = doc.content;
                acc[`category${i}`] = doc.category;
                acc[`embedding${i}`] = JSON.stringify(embeddings[i]);
                return acc;
            }, {});

            // Insertar todos los documentos
            const result = await this.client.execute({
                sql: `INSERT INTO bulks (title, content, category, embedding) VALUES ${insertPlaceholders}`,
                args: insertArgs,
            });

            console.log("Documentos insertados exitosamente", {
                count: documents.length,
            });
            return result;
        } catch (error) {
            console.error("Error en inserción múltiple", {
                error: error.message,
            });
            throw error;
        }
    }
    // TODO: Implementar métodos read, update, delete y query
}
export default Insert;
