
// delete.test.js
import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Delete from "../../Services/Bulk/delete";
import Insert from "../../Services/Bulk/insert";
import Bulk from "../../Services/Bulk/bulk";

const bulk = new Bulk();
await bulk.init();
const insert = new Insert(bulk.client);
const deleteOp = new Delete(bulk.client);

test("should delete a single document", async () => {
    // Primero insertamos un documento
    const uniqueId = uuidv4();
    const testDoc = {
        title: `title-${uniqueId}`,
        content: `content-${uniqueId}`,
        category: `category-${uniqueId}`,
    };

    const insertResult = await insert.one(testDoc);
    const docId = insertResult.lastInsertRowid;

    // Eliminamos el documento
    await deleteOp.one({ id: docId });

    // Verificamos que fue eliminado
    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks WHERE id = ?",
        args: [docId],
    });

    expect(result.rows.length).toBe(0);
});

test("should delete multiple documents", async () => {
    // Insertamos varios documentos
    const testDocs = Array.from({ length: 3 }, () => ({
        title: `title-${uuidv4()}`,
        content: `content-${uuidv4()}`,
        category: `category-${uuidv4()}`,
    }));

    const insertResult = await insert.many(testDocs);
    const baseId = insertResult.lastInsertRowid - 2;
    const ids = [baseId, baseId + 1, baseId + 2];

    // Eliminamos los documentos
    await deleteOp.many(ids);

    // Verificamos que fueron eliminados
    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks WHERE id IN (?, ?, ?)",
        args: ids,
    });

    expect(result.rows.length).toBe(0);
});

test("should delete documents by category", async () => {
    // Insertamos documentos con la misma categoría
    const categoryId = uuidv4();
    const testDocs = Array.from({ length: 3 }, () => ({
        title: `title-${uuidv4()}`,
        content: `content-${uuidv4()}`,
        category: `category-${categoryId}`,
    }));

    await insert.many(testDocs);

    // Eliminamos por categoría
    await deleteOp.byCategory({
        category: `category-${categoryId}`,
    });

    // Verificamos que fueron eliminados
    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks WHERE category = ?",
        args: [`category-${categoryId}`],
    });

    expect(result.rows.length).toBe(0);
});
