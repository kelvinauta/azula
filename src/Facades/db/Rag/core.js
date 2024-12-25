import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs-extra";
class Core {
    #PATH = process.env.SQLITE_PATH;
    #NAME = process.env.SQLITE_EMBEDDING_NAME
    constructor() {
        this.path = path.join(process.cwd(), this.#PATH);
        this.name = this.#NAME;
        this.client = null;
        this.url = `file:${this.path}/${this.name}`;
    }
    async init() {
        fs.ensureDir(this.path);
        this.client = createClient({
            url: this.url,
        });
        await this.client.batch(
            [
                `CREATE TABLE IF NOT EXISTS bulks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        embedding F32_BLOB(3072),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
                `CREATE INDEX IF NOT EXISTS bulks_embedding_idx ON bulks (libsql_vector_idx(embedding))`,
            ],
            "write",
        );
        return this.client;
    }
}
export default Core
