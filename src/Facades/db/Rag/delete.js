class Delete {
    constructor(client) {
        this.client = client;
    }

    async one({ id }) {
        try {

            if (!id) {
                console.error("ID requerido para eliminación");
                throw new Error("ID es requerido");
            }

            const result = await this.client.execute({
                sql: "DELETE FROM bulks WHERE id = ?",
                args: [id],
            });

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

            if (!Array.isArray(ids) || ids.length === 0) {
                console.error("Se requiere un array de IDs no vacío");
                throw new Error("Se requiere un array de IDs no vacío");
            }

            const placeholders = ids.map(() => "?").join(",");
            const result = await this.client.execute({
                sql: `DELETE FROM bulks WHERE id IN (${placeholders})`,
                args: ids,
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

            if (!category) {
                console.error("Categoría requerida");
                throw new Error("Categoría es requerida");
            }

            const result = await this.client.execute({
                sql: "DELETE FROM bulks WHERE category = ?",
                args: [category],
            });

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

