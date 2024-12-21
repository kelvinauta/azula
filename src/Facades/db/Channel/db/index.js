import Provider from "./provider";
import _Human from "./tables/Humans";
import _Message from "./tables/Messages";
import _Agent from "./tables/Agents";
import _Chat from "./tables/Chats";

class _DB {
    static async getInstance() {
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
        this.Chat = Tables.Chat;
    }
    async getAgent(channel) {
        const agent = await this.Agent.model.findOne({
            where: {
                channel,
            },
        });
        return agent.dataValues;
    }
    async pushAnswer(answer, chat_id, agent_id) {
        const answer_data = await this.Message.model.create({
            texts: [answer.text],
            _agent: agent_id,
            _chat: chat_id,
        });
        return answer_data.dataValues;
    }
    async pushMessage(message, channel, chat_external_id, human_external_id) {
        const chat = await this.Chat.touch_one({
            external_id: chat_external_id,
            channel,
        });
        const human = await this.Human.touch_one({
            external_id: human_external_id,
        });
        const new_message = await this.Message.model.create({
            texts: message.texts,
            _human: human.dataValues.id,
            _chat: chat.dataValues.id,
        });
        return new_message.dataValues;
    }
    async getHistoryByExternalId(external_id) {
        const chat = await this.getChatByExternalId(external_id);
        const messages = await this.getMessagesByChat(chat);
        return messages;
    }
    async getMessagesByChat(chat) {
        const chat_id = chat.dataValues.id;
        return await this.Message.model.findAll({
            where: {
                _chat: chat_id,
            },
            order: [["createdAt", "ASC"]],
        });
    }
    async getChatByExternalId(external_id) {
        return await this.Chat.touch_one({
            external_id,
        });
    }
}

export default await _DB.getInstance();
