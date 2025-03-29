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
      console.log(`🔍 Buscando información de: ${name}`);
      try {
        const response = await fetch(
          `https://dragonball-api.com/api/characters?name=${name}`,
          {
            method: "GET",
          },
        );
        console.log(`✅ Información encontrada para ${name}`);
        return response.json()
      } catch (error) {
        console.log(`❌ Error buscando ${name}: ${error.message}`);
        return { error: "Personaje no encontrado" };
      }
    },
  },
];
