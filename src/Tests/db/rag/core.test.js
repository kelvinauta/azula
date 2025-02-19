import { expect, test, beforeAll } from "bun:test";
import Core from "../../../Facades/db/Rag/core";
import { createClient } from "@libsql/client";

const core = new Core();
await core.init();

test("database should be created", async () => {
  const client = createClient({
    url:core.url,
  });
  expect(client).toBeTruthy();
});

test("bulks table should exist", async () => {
const result = await core.client.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='bulks';
  `);
  expect(result.rows.length).toBe(1);
});

test("bulks table should have required columns", async () => {
  const result = await core.client.execute(`
    PRAGMA table_info(bulks);
  `);
  
  const columnNames = result.rows.map(row => row.name);
  expect(columnNames).toContain("title");
  expect(columnNames).toContain("content"); 
  expect(columnNames).toContain("category");
  expect(columnNames).toContain("embedding");
});
