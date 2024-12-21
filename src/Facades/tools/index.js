import { z } from "zod";
class Tools {
    constructor() {
        this.aiTools = [
            {
                name: "buscar_producto",
                description: "Busca un producto en la base de datos",
                strict: true,
                parameters: z.object({
                    nombre: z.string(),
                    categoria: z.string().optional(),
                }),
                execute: async ({ nombre, categoria }) => {
                    return {
                        nombre,
                        precio: 100,
                        categoria: categoria || "general",
                    };
                },
            },
            {
                name: "verificar_stock",
                description: "Verifica el stock de un producto",
                strict: true,
                parameters: z.object({
                    producto_id: z.string(),
                }),
                execute: async ({ producto_id }) => {
                    return {
                        disponible: true,
                        cantidad: 50,
                    };
                },
            },
        ];
        this.promptFunctions = {
            get_user_name: (args) => args.context.metadata.name,
            get_last_interaction: (args) => {
                const lastMsg = args.history[args.history.length - 1];
                return lastMsg
                    ? lastMsg.content
                    : "No hay interacciones previas";
            },
        };
        this.messageFunctions = {
            format_price: (price) => `$${price.toFixed(2)}`,
            format_date: (date) => new Date(date).toLocaleDateString(),
        };
    }
    get() {
        return {
            to: {
                ai: this.aiTools,
                prompt: this.promptFunctions,
                answer: this.messageFunctions,
            },
        };
    }
}
export default Tools;
