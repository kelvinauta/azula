import { z } from "zod";
export default [
    {
        name: "search_character",
        description: "Search a character of Dragon Ball Z API",
        strict: true,
        parameters: z.object({
            name: z.string(),
        }),
        execute: async ({ name }) => {
            log(`🔍 Buscando información de: ${name}`);
            try {
                const response = await axios.get(
                    `https://dragonball-api.com/api/characters?name=${name}`,
                );
                log(`✅ Información encontrada para ${name}`);
                return response.data;
            } catch (error) {
                log(`❌ Error buscando ${name}: ${error.message}`);
                return { error: "Personaje no encontrado" };
            }
        },
    },
];
