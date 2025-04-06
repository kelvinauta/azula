import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Query from "../../../Facades/data/Rag/query";
import Insert from "../../../Facades/data/Rag/insert";
import Core from "../../../Facades/data/Rag/core";
import mockupData from "./mockup.json";

const DEFAULT_LIMIT = 3;
const AVAILABLE_CATEGORIES = ["comics", "history", "planets", "cats", "health"];

const core = new Core();
await core.init();
const insert = new Insert(core.client);
const query = new Query(core.client);

// Función auxiliar para generar grupos de categorías aleatorias
function generateRandomCategories() {
    const numGroups = Math.floor(Math.random() * 5) + 1; // 1 a 5 grupos
    const usedCategories = new Set();
    const groups = [];

    for (let i = 0; i < numGroups; i++) {
        const numCategories = Math.floor(Math.random() * 3) + 1; // 1 a 3 categorías por grupo
        const group = [];

        while (group.length < numCategories) {
            const randomIndex = Math.floor(
                Math.random() * AVAILABLE_CATEGORIES.length,
            );
            const category = AVAILABLE_CATEGORIES[randomIndex];

            if (!group.includes(category)) {
                group.push(category);
            }
        }

        groups.push(group);
    }

    return groups;
}

// Función auxiliar para verificar si los documentos pertenecen a las categorías especificadas
function verifyDocumentCategories(documents, categories) {
    return documents.every((doc) => categories.includes(doc.category));
}

await insert.many(mockupData.documents);

// Pruebas para preguntas específicas
mockupData.documents.forEach((doc) => {
    test(`should find relevant document for question: ${doc.question}`, async () => {
        const result = await query.one({
            text: doc.question,
            categories: [["*"]],
            limit: DEFAULT_LIMIT,
        });

        // Verificar que obtuvimos resultados
        expect(result.documents).toBeTruthy();
        expect(result.documents[0]).toBeTruthy();

        // Verificar si el documento original está en los resultados
        const foundOriginalDoc = result.documents[0].some(
            (resultDoc) =>
                resultDoc.title === doc.title &&
                resultDoc.content === doc.content,
        );

        expect(foundOriginalDoc).toBe(true);
    });
});

// Pruebas con categorías aleatorias
test("should respect category filters in search", async () => {
    const randomCategories = generateRandomCategories();

    const result = await query.one({
        text: "Tell me something interesting",
        categories: randomCategories,
        limit: mockupData.documents.length, // Usar límite máximo para esta prueba
    });

    // Verificar que tenemos el número correcto de grupos de resultados
    expect(result.documents.length).toBe(randomCategories.length);

    // Verificar que cada grupo de resultados respeta sus categorías
    result.documents.forEach((groupDocs, index) => {
        const expectedCategories = randomCategories[index];
        const hasCorrectCategories = groupDocs.every((doc) =>
            expectedCategories.includes(doc.category),
        );
        expect(hasCorrectCategories).toBe(true);
    });
});
test("should return correct number of documents for multiple queries", async () => {
    const queries = [
        {
            text: "Tell me about planets",
            categories: [["planets"]],
            limit: DEFAULT_LIMIT
        },
        {
            text: "Tell me about cats",
            categories: [["cats"]],
            limit: DEFAULT_LIMIT
        },
        {
            text: "Tell me about health",
            categories: [["health"]],
            limit: DEFAULT_LIMIT
        }
    ];

    const results = await query.many(queries);

    // Verificar que tenemos resultados para cada consulta
    expect(results.length).toBe(queries.length);

    // Verificar que cada resultado tiene la cantidad correcta de grupos y documentos
    results.forEach((result, index) => {
        // Verificar que tiene el número correcto de grupos de categorías
        expect(result.documents.length).toBe(queries[index].categories.length);

        // Verificar que cada grupo tiene como máximo el límite de documentos especificado
        result.documents.forEach(groupDocs => {
            expect(groupDocs.length).toBeLessThanOrEqual(DEFAULT_LIMIT);
        });
    });
});
