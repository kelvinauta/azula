import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Update from "../../../Facades/data/Rag/update";
import Insert from "../../../Facades/data/Rag/insert";
import Core from "../../../Facades/data/Rag/core";
const core = new Core();
await core.init();
const insert = new Insert(core.client);
const update = new Update(core.client);
test("should update a single document", async () => {
    const uniqueId = uuidv4();
    const testDoc = {
        title: `title-${uniqueId}`,
        content: `content-${uniqueId}`,
        category: `category-${uniqueId}`,
    };
    const insertResult = await insert.one(testDoc);
    const docId = insertResult.toJSON().lastInsertRowid;
    const updateData = {
        id: docId,
        title: `updated-title-${uniqueId}`,
        content: `updated-content-${uniqueId}`,
    };
    await update.one(updateData);
    const result = await core.client.execute({
        sql: "SELECT * FROM bulks WHERE id = ?",
        args: [docId],
    });
    expect(result.rows[0].title).toBe(updateData.title);
    expect(result.rows[0].content).toBe(updateData.content);
    expect(result.rows[0].embedding).toBeTruthy();
});
test("should update multiple documents", async () => {
    const testDocs = Array.from({ length: 3 }, () => ({
        title: `title-${uuidv4()}`,
        content: `content-${uuidv4()}`,
        category: `category-${uuidv4()}`,
    }));
    const insertResults = await insert.many(testDocs);
    const updates = testDocs.map((_, index) => ({
        id: insertResults.toJSON().lastInsertRowid - (2 - index),
        title: `updated-title-${uuidv4()}`,
        content: `updated-content-${uuidv4()}`,
    }));
    await update.many(updates);
    for (const doc of updates) {
        const result = await core.client.execute({
            sql: "SELECT * FROM bulks WHERE id = ?",
            args: [doc.id],
        });
        expect(result.rows[0].title).toBe(doc.title);
        expect(result.rows[0].content).toBe(doc.content);
        expect(result.rows[0].embedding).toBeTruthy();
    }
});
test("should update category for multiple documents", async () => {
    const categoryId = uuidv4();
    const testDocs = Array.from({ length: 3 }, () => ({
        title: `title-${uuidv4()}`,
        content: `content-${uuidv4()}`,
        category: `category-${categoryId}`,
    }));
    await insert.many(testDocs);
    const newCategory = `new-category-${uuidv4()}`;
    await update.category({
        old_category: `category-${categoryId}`,
        new_category: newCategory,
    });
    const result = await core.client.execute({
        sql: "SELECT * FROM bulks WHERE category = ?",
        args: [newCategory],
    });
    expect(result.rows.length).toBeGreaterThanOrEqual(3);
    result.rows.forEach(row => {
        expect(row.category).toBe(newCategory);
    });
});
