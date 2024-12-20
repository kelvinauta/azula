import Provider from "./provider";
import _Human from "./tables/Humans";
import _Message from "./tables/Messages";
import _Agent from "./tables/Agents";
import _Chat from "./tables/Chats";

class _DB {
    async getInstance() {
        await Provider.build();
        const [Human, Message, Agent, Chat] = await Promise.all([
            _Human.getInstance(),
            _Message.getInstance(),
            _Agent.getInstance(),
            _Chat.getInstance(),
        ]);
        const Tables = { Human, Message, Agent, Chat };

        return new _DB(Tables);
    }
    constructor(Tables) {
        this.Agent = Tables.Agent;
        this.Message = Tables.Message;
        this.Human = Tables.Human;
    }
    async getAgent(channel) {
        return await this.Tables.Agent.model.findOne({
            where: {
                channel,
            },
        });
    }
    async pushMessage(message, chat_external_id, human_external_id) {
        const chat = await this.Tables.Chat.touch_one({
            external_id: chat_external_id,
        });
        const human = await this.Tables.Human.touch_one({
            external_id: human_external_id,
        });
        const message = await this.Tables.Message.model.create({
            texts: message.texts,
            human,
            chat,
        });
        return message;
    }
    async getHistoryByExternalId(external_id) {
        const chat = await this.getChatByExternalId(external_id);
        const messages = await this.getMessagesByChat(chat);
        return messages;
    }
    async getMessagesByChat(chat) {
        const chat_id = chat.id;
        return await this.Tables.Message.model.findAll({
            where: {
                chat: chat_id,
            },
            order: [["created_at", "ASC"]],
        });
    }
    async getChatByExternalId(external_id) {
        return await this.Tables.Chat.model.findOne({
            where: {
                external_id,
            },
        });
    }
}

const DB = await _DB.getInstance();
return DB;
