import Messages from "../../../Facades/db/Chats/db/tables/Messages.js";
import Agents from "../../../Facades/db/Chats/db/tables/Agents.js";
import Chats from "../../../Facades/db/Chats/db/tables/Chats.js";
import Humans from "../../../Facades/db/Chats/db/tables/Humans.js";
import Composer from "../../../Facades/db/Chats/controllers/composer.js";
import Client from "../../../Facades/db/Chats/client.js";
import AgentFactory from "../../../Facades/db/Chats/db/factory/AgentFactory.js";
import Provider from "../../../Facades/db/Chats/db/provider/index.js";
import { v4 as uuidv4 } from "uuid";

describe("Composer Test", () => {
    let composer;
    let clientAgent;
    let messages;
    let agents;
    let chats;
    let humans;
    let testAgent;
    let recieved_data;

    beforeEach(async () => {
        composer = new Composer();
        clientAgent = new Client();

        messages = await Messages.getInstance();
        agents = await Agents.getInstance();
        chats = await Chats.getInstance();
        humans = await Humans.getInstance();
        await Provider.build();
        const factory = new AgentFactory(agents);
        testAgent = await factory.simple({
            name: `test-agent-${uuidv4()}`,
            description: "test description",
            config: {
                prompt: "test prompt",
                model: "test-model",
            },
        });

        recieved_data = await clientAgent.get_answer({
            external_human_id: "test_human",
            external_chat_id: "1234chat",
            origin_chat: "whatsapp",
            agent_id: testAgent.id,
            message: {
                type: "received",
                texts: ["Hola que tal"],
            },
        });
    });

    describe(".getData", () => {
        test("Must return valid Data", async () => {
            const data = await composer.getData(recieved_data);
            expect(data.message_row).toBeInstanceOf(messages.model);
            expect(data.agent_row).toBeInstanceOf(agents.model);
            expect(data.chat_row).toBeInstanceOf(chats.model);
            expect(data.human_row).toBeInstanceOf(humans.model);
        });
    });
});
