import { expect, test, beforeAll } from "bun:test";
import { Bulk } from "../../Services/Bulk/bulk";
import { createClient } from "@libsql/client";

const bulk = new Bulk();
await bulk.init();

test("database should be created", async () => {
  const client = createClient({
    url:bulk.url,
  });
  expect(client).toBeTruthy();
});

test("bulks table should exist", async () => {
  const result = await bulk.client.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='bulks';
  `);
  expect(result.rows.length).toBe(1);
});

test("bulks table should have required columns", async () => {
  const result = await bulk.client.execute(`
    PRAGMA table_info(bulks);
  `);
  
  const columnNames = result.rows.map(row => row.name);
  expect(columnNames).toContain("title");
  expect(columnNames).toContain("content"); 
  expect(columnNames).toContain("category");
  expect(columnNames).toContain("embedding");
});
