import Messages from "../Services/Agent/db/tables/Messages.js"
import Agents from "../Services/Agent/db/tables/Agents.js"
import Chats from "../Services/Agent/db/tables/Chats.js"
import Humans from "../Services/Agent/db/tables/Humans.js"
import Composer from "../Services/Agent/controllers/composer.js"
import ProxyAgent from "../Services/Agent/proxy.js"
describe("Composert Test", async () => {
    const composer = new Composer()
    const proxyAgent = new ProxyAgent()

    const messages = await Messages.getInstance()
    const agents = await Agents.getInstance()
    const chats = await Chats.getInstance()
    const humans = await Humans.getInstance()
    const recieved_data = await proxyAgent.input({
        external_human_id: "test_human",
        external_chat_id: "1234chat",
        origin_chat: "whatsapp",
        agent_id: "ea6c25a1-ab67-4e57-8d49-370c79908d39",
        message: {
            type: "received",
            texts: [
                "Hola que tal"
            ]
        }

    })
    describe(".getData", async () => {

        test("Must return valid Data", async () => {
            const data = await composer.getData(recieved_data)
            expect(data.message_row).toBeInstanceOf(messages.model)
            expect(data.agent_row).toBeInstanceOf(agents.model)
            expect(data.chat_row).toBeInstanceOf(chats.model)
            expect(data.human_row).toBeInstanceOf(humans.model)
        })
    })

})
