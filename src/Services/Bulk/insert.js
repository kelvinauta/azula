// TODO: Si un documento tiene el mismo title y category que uno que ya existe entonces reemplaza el anterior
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

class Insert {
    constructor(client) {
        this.client = client;
    }

    async one({ title, content, category }) {
        try {
            console.log("Iniciando proceso de inserción de documento");

            // Validar campos requeridos
            if (!title || !content) {
                console.error("Campos requeridos faltantes");
                throw new Error("Los campos title y content son requeridos");
            }

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
                      VALUES (?, ?, ?, vector32(?))`,
                args: [title, content, category, JSON.stringify(embedding)],
            });

            console.log("Documento insertado exitosamente");
            return result.toJSON();
        } catch (error) {
            console.error("Error al insertar documento", {
                error: error.message,
            });
            throw error;
        }
    }

    // En la clase Crud
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

            // Generar embeddings para todos los contenidos
            console.log("Generando embeddings para los documentos");
            const { embeddings } = await embedMany({
                model: openai.embedding("text-embedding-3-large"),
                values: documents.map((doc) => doc.content),
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Construir consulta para inserción múltiple
            console.log("Preparando inserción en batch");
            const placeholders = documents
                .map(() => "(?, ?, ?, vector32(?))")
                .join(",");
            const values = documents.flatMap((doc, i) => [
                doc.title,
                doc.content,
                doc.category,
                JSON.stringify(embeddings[i]),
            ]);

            // Insertar todos los documentos
            const result = await this.client.execute({
                sql: `INSERT INTO bulks (title, content, category, embedding) VALUES ${placeholders}`,
                args: values,
            });

            console.log("Documentos insertados exitosamente", {
                count: documents.length,
            });
            return result.toJSON();
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
