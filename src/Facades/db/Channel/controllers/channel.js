import Provider from "../db/provider";
import { assert, mask, instance, define, object } from "superstruct";
import { Op } from "sequelize";
import Chat from "../db/tables/Chats";
import Message from "../db/tables/Messages";
import Agent from "../db/tables/Agents";
import Human from "../db/tables/Humans";
import Composer from './composer.js';
class Channel {
    static schema = object({ // TODO: los input y output schemas compartidos deberian estar en un archivo aparte
        sender: define(
            "sender",
            (sender) =>
                sender instanceof Agent.instance.model ||
                sender instanceof Human.instance.model,
        ),
        receiver: define(
            "receiver",
            (sender) =>
                sender instanceof Agent.instance.model ||
                sender instanceof Human.instance.model,
        ),
        chat_row: define("chat", (chat) => chat instanceof Chat.instance.model),
        message_row: define(
            "message",
            (message) => message instanceof Message.instance.model,
        ),
    });
    constructor(proxy) {
        this.proxy = proxy; // TODO: Validate instance of proxy
    }
    async sender({ sender, receiver, chat, message, sender_type }) {
        if (!Provider.all_is_ok()) throw new Error("Provider not initialized");
        assert(chat, object(Chat.schema));
        assert(message, object(Message.schema));

        const mask_chat = mask(chat, object(Chat.schema));
        const mask_message = mask(message, object(Message.schema));

        if (!mask_chat.external_id && !mask_chat.id)
            throw new Error("Invalid chat");

        const chat_row = await Chat.instance.touch_one(mask_chat);
        const message_row = await Message.instance.touch_one({
            ...mask_message,
            [Chat.instance.foreign_key_name]: chat_row.id,
            [`${sender.table.foreign_key_name}`]: sender.row.id,
        });

        return {
            sender: sender.row, // TODO: Refactorizar, es confuso que exista sender y sender.row
            receiver: receiver.row,
            chat_row,
            message_row,
        };
    }

    async sender_human({ human, agent, chat, message }) {
        if (!Provider.all_is_ok()) throw new Error("Provider not initialized");
        assert(human, object(Human.schema));
        assert(agent.id, Agent.schema.id);
        const mask_human = mask(human, object(Human.schema));
        if (!mask_human.external_id && !mask_human.id)
            throw new Error("Invalid human"); // TODO: Validate Human debería ser como Validate Message
        const agent_row = await (await Agent.getInstance()).getAgent(agent.id);

        const human_row = await Human.instance.touch_one(mask_human);
        const receiver_human = await this.sender({
            sender: {
                table: Human.instance,
                row: human_row,
            },
            receiver: {
                table: Agent.instance,
                row: agent_row,
            },
            chat,
            message,
            sender_type: Human.instance.foreign_key_name,
        });
        return receiver_human
    }
    //TODO: sender_agent aún no está implementado
}

export default Channel;
