import SQLite from "../adapters/sqlite";
import Postgres from "../adapters/postgres";
import _Table from "../tables/_Table";
import Agent from "../tables/Agents";
import Chat from "../tables/Chats";
import Human from "../tables/Humans";
import Message from "../tables/Messages";
import Tools from "../tables/Tools";
import Http from "../tables/Http";
import { assert, define } from "superstruct";
class Provider {
    static instance = null;
    static #instance_with_build = false;
    static #db_ok = false;
    static #sync_ok = false;
    static db_adapter = process.env.DB_ADAPTER || "sqlite";
    static tables_schema = define("tables_schema", (tables) => {
        if (typeof tables !== "object") return false;
        if (!Object.values(tables).every((table) => table instanceof _Table)) return false;
        return true;
    });
    static async build() {
        if (Provider.instance && Provider.#instance_with_build) return Provider.instance;
        Provider.#instance_with_build = true;
        const provider = new Provider();
        await provider.#_build();
        Provider.instance = provider;
        console.log(`build Provider DB succes with db_adapter: ${Provider.db_adapter}`);
        return provider;
    }
    constructor() {
        if (!Provider.#instance_with_build)
            throw new Error("first constructor is disabled, use build() instead");
        if (Provider.instance) return Provider.instance;
        if (Provider.db_adapter == "sqlite") this.db = SQLite.getInstance();
        if (Provider.db_adapter == "postgres") this.db = Postgres.getInstance();
        this.tables = {};
    }
    static all_is_ok() {
        return Provider.#db_ok && Provider.#sync_ok;
    }
    async #_build() {
        await this.db.connect();
        Provider.#db_ok = true;
        const agents = await Agent.getInstance();
        const chats = await Chat.getInstance();
        const humans = await Human.getInstance();
        const messages = await Message.getInstance();
        const tools = await Tools.getInstance();
        const http = await Http.getInstance();
        const relations_many_to_many = [];
        messages.ref(agents);
        messages.ref(humans);
        messages.ref(chats);
        tools.ref(agents);
        tools.ref(http);
        await agents.sync();
        await chats.sync();
        await humans.sync();
        await http.sync();
        await tools.sync();
        await messages.sync();
        for (const relation of relations_many_to_many) {
            await relation.sync();
            this.tables[relation.get_name()] = relation;
        }
        this.tables[agents.get_name()] = agents;
        this.tables[chats.get_name()] = chats;
        this.tables[humans.get_name()] = humans;
        this.tables[messages.get_name()] = messages;
        this.tables[tools.get_name()] = tools;
        this.tables[http.get_name()] = http;
        Provider.#sync_ok = true;
    }
    getTables() {
        if (!this.tables) throw new Error("Tables not built");
        assert(this.tables, Provider.tables_schema);
        return this.tables;
    }
}
export default Provider;
