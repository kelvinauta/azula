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

export default async function init_db() {
    const db = Postgres.getInstance();
    await db.connect();

    // In order of priority/relations
    const agents = new Agent(db);
    const prompts = new Prompt(db);
    const bulks = new Bulk(db);
    const tools = new Tool(db);
    const chats = new Chat(db);
    const humans = new Human(db);
    const messages = new Message(db);
    const threads = new Thread(db);
    const relations_many_to_many = [
        agents.many_to_many(bulks),
        agents.many_to_many(tools),
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
    }
}
