import Postgres from "../postgres";
import _Table from "../tables/_Table";
import Agent from "../tables/Agents";
import Bulk from "../tables/Bulks";
import Chat from "../tables/Chats";
import Human from "../tables/Humans";
import Message from "../tables/Messages";
import Prompt from "../tables/Prompts";
import Tool from "../tables/Tools";
import Thread from "../tables/Threads";
import {assert, object, define, is} from "superstruct";
 class Provider { // singleton
    static instance = null;
    static #instance_with_build = false;
    static #db_ok = false;
    static #sync_ok = false;
    static tables_schema = define("tables_schema", (tables)=>{
        if(typeof tables !== "object") return false;
        if(!Object.values(tables).every((table)=> table instanceof _Table)) return false;
        return true;
    });

    static async build(){
        if(Provider.instance && Provider.#instance_with_build) return Provider.instance;

        //validate
        Provider.#instance_with_build = true;
        const provider = new Provider();
        await provider.#_build();
        Provider.instance = provider;
        return provider;
    }
    constructor() {
        if(!Provider.#instance_with_build) throw new Error("first constructor is disabled, use build() instead");
        if(Provider.instance) return Provider.instance;
        this.db = Postgres.getInstance();
        this.tables = {};
    }
    static all_is_ok(){
        return Provider.#db_ok && Provider.#sync_ok;
    }
    async #_build(){
        await this.db.connect();
        Provider.#db_ok = true;
        const agents = await Agent.getInstance();
        const prompts = await Prompt.getInstance();
        const bulks = await Bulk.getInstance();
        const tools = await Tool.getInstance();
        const chats = await Chat.getInstance();
        const humans = await Human.getInstance();
        const messages = await Message.getInstance();
        const threads = await Thread.getInstance();
        const relations_many_to_many = [
            await agents.many_to_many(bulks),
            await agents.many_to_many(tools),
        ];
        messages.ref(agents);
        messages.ref(humans);
        messages.ref(chats);
        threads.ref(messages, "_input_message");
        threads.ref(messages, "_output_message");
        await agents.sync();
        await bulks.sync();
        await prompts.sync();
        await tools.sync();
        await chats.sync();
        await humans.sync();
        await messages.sync();
        await threads.sync();
    
        for (const relation of relations_many_to_many) {
            await relation.sync();
            this.tables[relation.get_name()] = relation;
        }
        this.tables[agents.get_name()] = agents;
        this.tables[prompts.get_name()] = prompts;
        this.tables[bulks.get_name()] = bulks;
        this.tables[tools.get_name()] = tools;
        this.tables[chats.get_name()] = chats;
        this.tables[humans.get_name()] = humans;
        this.tables[messages.get_name()] = messages;
        this.tables[threads.get_name()] = threads;
        Provider.#sync_ok = true;
    }

    getTables(){
        if(!this.tables) throw new Error("Tables not built");
        assert(this.tables, Provider.tables_schema);
        return this.tables;
    }
    

}

export default Provider;