class Delete {
    constructor(client) {
        this.client = client;
    }

    async one({ id }) {
        try {
            console.log("Iniciando eliminación de documento", { id });

            if (!id) {
                console.error("ID requerido para eliminación");
                throw new Error("ID es requerido");
            }

            const result = await this.client.execute({
                sql: "DELETE FROM bulks WHERE id = ?",
                args: [id],
            });

            console.log("Documento eliminado exitosamente");
            return result;

        } catch (error) {
            console.error("Error al eliminar documento", {
                error: error.message,
            });
            throw error;
        }
    }

    async many(ids) {
        try {
            console.log("Iniciando eliminación múltiple", {
                count: ids.length,
            });

            if (!Array.isArray(ids) || ids.length === 0) {
                console.error("Se requiere un array de IDs no vacío");
                throw new Error("Se requiere un array de IDs no vacío");
            }

            const placeholders = ids.map(() => "?").join(",");
            const result = await this.client.execute({
                sql: `DELETE FROM bulks WHERE id IN (${placeholders})`,
                args: ids,
            });

            console.log("Documentos eliminados exitosamente", {
                count: ids.length,
            });
            return result;

        } catch (error) {
            console.error("Error en eliminación múltiple", {
                error: error.message,
            });
            throw error;
        }
    }

    async byCategory({ category }) {
        try {
            console.log("Iniciando eliminación por categoría", { category });

            if (!category) {
                console.error("Categoría requerida");
                throw new Error("Categoría es requerida");
            }

            const result = await this.client.execute({
                sql: "DELETE FROM bulks WHERE category = ?",
                args: [category],
            });

            console.log("Documentos eliminados por categoría exitosamente");
            return result;

        } catch (error) {
            console.error("Error al eliminar por categoría", {
                error: error.message,
            });
            throw error;
        }
    }
}

export default Delete;

