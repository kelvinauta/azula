import Provider from "../db/provider";
import { assert, mask, instance, define, object } from "superstruct";
import { Op } from "sequelize";
import Chat from "../db/tables/Chats";
import Message from "../db/tables/Messages";
import Agent from "../db/tables/Agents";
import Human from "../db/tables/Humans";
class Channel {
    static schema = object({
        sender: define(
            "sender",
            (sender) => sender instanceof Agent.instance.model || sender instanceof Human.instance.model
        ),
        chat: define("chat", (chat) => chat instanceof Chat.instance.model),
        message: define("message", (message) => message instanceof Message.instance.model),
    });
    constructor() {
        
    }
    async sender({ sender, chat, message, sender_type }) {
        if(!Provider.all_is_ok()) throw new Error("Provider not initialized");
        assert(chat, object(Chat.schema));
        assert(message, object(Message.schema));

        const mask_chat = mask(chat, object(Chat.schema));
        const mask_message = mask(message, object(Message.schema));

        if(!mask_chat.external_id && !mask_chat.id) throw new Error("Invalid chat");
        
        const chat_row = await Chat.instance.touch_one(mask_chat);
        const message_row = await Message.instance.touch_one({
            ...mask_message,
            [Chat.instance.foreign_key_name]: chat_row.id,
            [`${sender.table.foreign_key_name}`]: sender.row.id,
        });

        return {
            sender: sender.row,
            chat: chat_row,
            message: message_row,
        };
    }

    async sender_human({ human, chat, message }) {
        if(!Provider.all_is_ok()) throw new Error("Provider not initialized");
        assert(human, object(Human.schema));
        const mask_human = mask(human, object(Human.schema));
        if(!mask_human.external_id && !mask_human.id) throw new Error("Invalid human"); 
        const human_row = await Human.instance.touch_one(mask_human);
        return this.sender({
            sender: {
                table: Human.instance,
                row: human_row,
            },
            chat,
            message,
            sender_type: Human.instance.foreign_key_name
        });
    }

    async sender_agent({ agent, chat, message }) {
        if(!Provider.all_is_ok()) throw new Error("Provider not initialized");
        assert(agent, object({ id: Agent.schema.id }));
        const agent_row = await Agent.instance.getAgent(agent.id);
        if(!agent_row) throw new Error("Invalid agent");
        return this.sender({
            sender: {
                table: Agent.instance,
                row: agent_row,
            },
            chat,
            message, 
            sender_type: Agent.instance.foreign_key_name
        });
    }
}

export default Channel;
