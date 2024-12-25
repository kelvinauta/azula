import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Bulk from "../../../Facades/db/Rag";
test("should perform all operations without errors", async () => {
    const bulk = Bulk();
    const uniqueId = uuidv4();
    try {
        const doc = {
            title: `test-${uniqueId}`,
            content: `content-${uniqueId}`,
            category: `category-${uniqueId}`,
        };
        await bulk.insert.one(doc);
        const docs = [
            {
                title: `test-many-1-${uniqueId}`,
                content: `content-many-1-${uniqueId}`,
                category: `category-${uniqueId}`,
            },
            {
                title: `test-many-2-${uniqueId}`,
                content: `content-many-2-${uniqueId}`,
                category: `category-${uniqueId}`,
            }
        ];
        await bulk.insert.many(docs);
        await bulk.query.one({
            text: uniqueId,
            categories: [["*"]],
            limit: 1
        });
        await bulk.query.many([
            {
                text: "test query 1",
                categories: [["*"]],
                limit: 1
            },
            {
                text: "test query 2",
                categories: [["*"]],
                limit: 1
            }
        ]);
        await bulk.update.one({
            id: 1,
            title: `updated-${uniqueId}`,
        });
        await bulk.update.many([
            { id: 1, title: `updated-1-${uniqueId}` },
            { id: 2, title: `updated-2-${uniqueId}` }
        ]);
        await bulk.update.category({
            old_category: `category-${uniqueId}`,
            new_category: `new-category-${uniqueId}`
        });
        await bulk.delete.one({ id: 1 });
        await bulk.delete.many([2, 3]);
        await bulk.delete.byCategory({ 
            category: `new-category-${uniqueId}` 
        });
        expect(true).toBe(true);
    } catch (error) {
        console.error("Error en operaciones:", error);
        expect(error).toBeFalsy(); // Forzar fallo si hay error
    }
});
