import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Insert from "../../Services/Bulk/insert";
import Bulk from "../../Services/Bulk/bulk";

const bulk = new Bulk();
await bulk.init();
const insert = new Insert(bulk.client);

test("should insert a new document with embedding", async () => {
    const uniqueId = uuidv4();
    const testDoc = {
        title: `title-${uniqueId}`,
        content: `content-${uniqueId}`,
        category: `category-${uniqueId}`,
    };

    const insertResult = await insert.one(testDoc);
    expect(insertResult).toBeTruthy();

    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks",
        args: [],
    });

    const foundDoc = result.rows.find(
        (row) =>
            row.title === testDoc.title &&
            row.content === testDoc.content &&
            row.category === testDoc.category,
    );

    expect(foundDoc).toBeTruthy();
    expect(foundDoc.embedding).toBeTruthy();
});

test("should insert multiple documents with embeddings", async () => {
    const testDocs = Array.from({ length: 3 }, () => {
        const uniqueId = uuidv4();
        return {
            title: `title-${uniqueId}`,
            content: `content-${uniqueId}`,
            category: `category-${uniqueId}`,
        };
    });

    const insertResult = await insert.many(testDocs);
    expect(insertResult).toBeTruthy();

    const result = await bulk.client.execute({
        sql: "SELECT * FROM bulks",
        args: [],
    });

    testDocs.forEach((doc) => {
        const foundDoc = result.rows.find(
            (row) =>
                row.title === doc.title &&
                row.content === doc.content &&
                row.category === doc.category,
        );
        expect(foundDoc).toBeTruthy();
        expect(foundDoc.embedding).toBeTruthy();
    });
});
