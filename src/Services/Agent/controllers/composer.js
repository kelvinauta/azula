import Channel from './channel.js'
import Human from "../db/tables/Humans";
import Chat from "../db/tables/Chats.js"
import Agent from "../db/tables/Agents.js"
import Messages from "../db/tables/Messages.js"
import { assert, mask, instance, define, object } from "superstruct";
class Composer {
    constructor() {

    }
    async validate(msg_received) {
        assert(msg_received, Channel.schema)
        if (!(msg_received.sender instanceof (await Human.getInstance()).model)) throw new Error('msg_received mus be of the a Human')
    }
    async getData({
        sender,
        receiver,
        chat_row,
        message_row,

    }) {
        const history_chat = await (await Messages.getInstance()).getMessagesWhereChat(chat_row)
        return {
            message_row,
            chat_row,
            agent_row: receiver,
            human_row: sender
        }
    }
    async build(receiver_human) {
        this.#validate(receiver_human);
        const data = await this.getData(receiver_human) // NOTE: Un mejor nombre para "data"
        
    }
    request() {

    }
    #validate() {

    }
}

export default Composer
