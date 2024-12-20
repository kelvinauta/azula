import Provider from "./provider";
import _Human from "./tables/Humans";
import _Message from "./tables/Messages";
import _Agent from "./tables/Agents";
import _Chat from "./tables/Chats"

class _DB {
    async getInstance() {
        await Provider.build();
        const [Human, Message, Agent, Chat] = await Promise.all([
            _Human.getInstance(),
            _Message.getInstance(),
            _Agent.getInstance(),
            _Chat.getInstance()
        ]);
        const Tables = { Human, Message, Agent, Chat };

        return new _DB(Tables);
    }
    constructor(Tables) {
        this.Agent = Tables.Agent;
        this.Message = Tables.Message;
        this.Human = Tables.Human;
    }
    async pushMessage(message){

    }
    async getHistoryByExternalId(external_id){
        const chat = await this.getChatByExternalId(external_id)
        const messages = await this.getMessagesByChat(chat)
        return messages
    }
    async getMessagesByChat(chat) {
        const chat_id = chat.id
        return await this.Tables.Message.model.findAll({
            where:{
                chat: chat_id,
            },
            order: [
                ["created_at", "ASC"]
            ]
        })
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
