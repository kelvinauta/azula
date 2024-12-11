import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Update from "../../Services/Bulk/update";
import Insert from "../../Services/Bulk/insert";
import Bulk from "../../Services/Bulk/bulk";

const bulk = new Bulk();
await bulk.init();
const insert = new Insert(bulk.client);
const update = new Update(bulk.client);

test("should update a single document", async () => {
    // Primero insertamos un documento
    const uniqueId = uuidv4();
    const testDoc = {
        title: `title-${uniqueId}`,
        content: `content-${uniqueId}`,
        category: `category-${uniqueId}`,
    };

    const insertResult = await insert.one(testDoc);
    const docId = insertResult.lastInsertRowid;

    // Actualizamos el documento
    const updateData = {
        id: docId,
        title: `updated-title-${uniqueId}`,
        content: `updated-content-${uniqueId}`,
    };

    await update.one(updateData);

    // Verificamos la actualización
    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks WHERE id = ?",
        args: [docId],
    });

    expect(result.rows[0].title).toBe(updateData.title);
    expect(result.rows[0].content).toBe(updateData.content);
    expect(result.rows[0].embedding).toBeTruthy();
});

test("should update multiple documents", async () => {
    // Insertamos varios documentos
    const testDocs = Array.from({ length: 3 }, () => ({
        title: `title-${uuidv4()}`,
        content: `content-${uuidv4()}`,
        category: `category-${uuidv4()}`,
    }));

    const insertResults = await insert.many(testDocs);
    
    // Preparamos las actualizaciones
    const updates = testDocs.map((_, index) => ({
        id: insertResults.lastInsertRowid - (2 - index),
        title: `updated-title-${uuidv4()}`,
        content: `updated-content-${uuidv4()}`,
    }));

    await update.many(updates);

    // Verificamos las actualizaciones
    for (const doc of updates) {
        const result = await bulk.client.execute({
            sql: "SELECT * FROM bulks WHERE id = ?",
            args: [doc.id],
        });
        expect(result.rows[0].title).toBe(doc.title);
        expect(result.rows[0].content).toBe(doc.content);
        expect(result.rows[0].embedding).toBeTruthy();
    }
});

test("should update category for multiple documents", async () => {
    // Insertamos documentos con la misma categoría
    const categoryId = uuidv4();
    const testDocs = Array.from({ length: 3 }, () => ({
        title: `title-${uuidv4()}`,
        content: `content-${uuidv4()}`,
        category: `category-${categoryId}`,
    }));

    await insert.many(testDocs);

    // Actualizamos la categoría
    const newCategory = `new-category-${uuidv4()}`;
    await update.category({
        old_category: `category-${categoryId}`,
        new_category: newCategory,
    });

    // Verificamos que se actualizaron todas las categorías
    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks WHERE category = ?",
        args: [newCategory],
    });

    expect(result.rows.length).toBeGreaterThanOrEqual(3);
    result.rows.forEach(row => {
        expect(row.category).toBe(newCategory);
    });
});
