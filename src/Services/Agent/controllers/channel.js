import Provider from "../db/provider";
import { assert, mask, instance, define, object } from "superstruct";
import { Op } from "sequelize";
import Chats from "../db/tables/Chats";
import Messages from "../db/tables/Messages";
import Agents from "../db/tables/Agents";
class Channel {
    static schema = object({
        sender: define(
            "sender",
            (value) => instance(value, Agents) || instance(value, Humans)
        ),
        chat: instance(Chats),
        message: instance(Messages),
    });
    constructor() {
        this.tables = null;
    }
    async #get_tables() {
        if (this.tables) return this;
        const provider = await Provider.getInstance();
        this.tables = provider.getTables();
        return this;
    }
    async sender_human({ human, chat, message }) {
        await this.#get_tables();
        const { Human, Chat, Message } = this.tables;
        assert(human, Human.constructor.schema.some_id);
        assert(chat, Chat.constructor.schema.some_id);
        assert(message, Message.constructor.schema.some_input);
        const mask_human = mask(human, Human.constructor.schema.some_id);
        const mask_chat = mask(chat, Chat.constructor.schema.some_id);
        const mask_message = mask(
            message,
            Message.constructor.schema.some_input
        );

        const human_row = await Human.touch_one({
            ...mask_human,
            type: "external",
        });
        const chat_row = await Chat.touch_one({
            ...mask_chat,
            origin: "whatsapp",
        });
        const message_row = await Message.touch_one({
            ...mask_message,
            type: "external",
            [Chat.foreign_key_name]: chat_row.id,
            [Human.foreign_key_name]: human_row.id,
        });
        return {
            sender: human_row,
            chat: chat_row,
            message: message_row,
        };
    }
}

export default Channel;
