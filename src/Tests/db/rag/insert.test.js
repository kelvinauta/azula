import { expect, test } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Insert from "../../../Facades/data/Rag/insert";
import Core from "../../../Facades/data/Rag/core";

const core = new Core();
await core.init();
const insert = new Insert(core.client);

test("should insert a new document with embedding", async () => {
    const uniqueId = uuidv4();
    const testDoc = {
        title: `title-${uniqueId}`,
        content: `content-${uniqueId}`,
        category: `category-${uniqueId}`,
    };

    const insertResult = await insert.one(testDoc);
    expect(insertResult).toBeTruthy();

    const result = await core.client.execute({
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

    const result = await core.client.execute({
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

test("should replace document when title already exists", async () => {
    // Crear documento inicial
    const uniqueId = uuidv4();
    const initialDoc = {
        title: `title-${uniqueId}`,
        content: "contenido inicial",
        category: "categoria inicial",
    };

    // Crear documento con el mismo título pero diferente contenido
    const updatedDoc = {
        title: `title-${uniqueId}`, // Mismo título
        content: "contenido actualizado",
        category: "categoria actualizada",
    };

    // Insertar documento inicial
    await insert.one(initialDoc);

    // Insertar documento actualizado
    await insert.one(updatedDoc);

    // Verificar que solo existe el documento actualizado
    const result = await core.client.execute({
        sql: "SELECT * FROM bulks WHERE title = :title",
        args: { title: `title-${uniqueId}` },
    });

    // Verificar que solo hay un documento
    expect(result.rows.length).toBe(1);

    // Verificar que es el documento actualizado
    expect(result.rows[0].content).toBe(updatedDoc.content);
    expect(result.rows[0].category).toBe(updatedDoc.category);
});

test("should replace multiple documents with duplicate titles", async () => {
    // Crear documentos iniciales
    const uniqueIds = [uuidv4(), uuidv4()];
    const initialDocs = uniqueIds.map((id) => ({
        title: `title-${id}`,
        content: "contenido inicial",
        category: "categoria inicial",
    }));

    // Crear documentos actualizados con los mismos títulos
    const updatedDocs = uniqueIds.map((id) => ({
        title: `title-${id}`,
        content: "contenido actualizado",
        category: "categoria actualizada",
    }));

    // Insertar documentos iniciales
    await insert.many(initialDocs);

    // Insertar documentos actualizados
    await insert.many(updatedDocs);

    // Verificar cada documento
    for (const id of uniqueIds) {
        const result = await core.client.execute({
            sql: "SELECT * FROM bulks WHERE title = :title",
            args: { title: `title-${id}` },
        });

        // Verificar que solo hay un documento por título
        expect(result.rows.length).toBe(1);

        // Verificar que es el documento actualizado
        expect(result.rows[0].content).toBe("contenido actualizado");
        expect(result.rows[0].category).toBe("categoria actualizada");
    }
});
