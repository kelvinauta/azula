import Messages from "../../Services/Agent/db/tables/Messages.js";
import Agents from "../../Services/Agent/db/tables/Agents.js";
import Chats from "../../Services/Agent/db/tables/Chats.js";
import Humans from "../../Services/Agent/db/tables/Humans.js";
import Composer from "../../Services/Agent/controllers/composer.js";
import Client from "../../Services/Agent/client.js";
import AgentFactory from "../../Services/Agent/db/factory/AgentFactory.js";
import Provider from "../../Services/Agent/db/provider/index.js";
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
