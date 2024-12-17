import Provider from "./db/provider";
import { assert, mask, instance, define, string, object } from "superstruct";
import Chat from "../db/tables/Chats";
import Message from "../db/tables/Messages";
import Agent from "../db/tables/Agents";
import Human from "../db/tables/Humans";
class Channel {
    static input_schema = {
        external_human_id: string(),
        external_chat_id: string(),
        origin_chat: string(),
        agent_id: string(),
        message: define("message", (msg) =>
            Message.validate_message_schema(msg),
        ),
    };
    constructor(){

    }
    message(msg) {
        assert(msg, input_schema.message)
        const {texts, files, type} = msg
        // push message from user
    }
    history() {
        // get history chat
    }
    agent() {
        // get config (crud?)
    }

    async #getData(){

    }
    async #init(){
        await Provider.build()
    }
    
}

export default Channel
