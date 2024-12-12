import { assert, object, string, define, type } from "superstruct";
import Message from "./db/tables/Messages";
import Channel from "./controllers/channel";
import Provider from "./db/provider";
import Composer from "./controllers/composer";
class Client {
    static input_schema = {
        external_human_id: string(),
        external_chat_id: string(),
        origin_chat: string(),
        agent_id: string(),
        message: define("message", (msg) =>
            Message.validate_message_schema(msg),
        ),
    };
    constructor() {
        this.channel = new Channel();
    }
    async get_answer(received) {
        assert(received, object(Client.input_schema));
        await Provider.build();
        const composer = new Composer()
        const receiver_human = await this.channel.sender_human({
            human: {
                external_id: received.external_human_id,
                type: "external", // TODO: Harcodeado, a futuro deberia poder se un humano interno como externo
            },
            chat: {
                external_id: received.external_chat_id,
                origin: received.origin_chat,
            },
            message: received.message,
            agent: {
                id: received.agent_id,
            },
        });
        const {history_chat} = composer.getData(receiver_human)

    }
}
export default Client;
