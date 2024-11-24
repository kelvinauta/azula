import { assert, object, string, define, type } from "superstruct";
import Message from "./db/tables/Messages";
import Channel from "./controllers/channel";
import Provider from "./db/provider";
class ProxyAgent {
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
    run() {}
    async input(received) {
        assert(received, object(ProxyAgent.input_schema));
        await Provider.build();
        return await this.channel.sender_human({
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
    }
    output() {}
    #validate() {}
}
export default ProxyAgent;
