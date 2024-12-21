import Provider from "./provider";
import _Human from "./tables/Humans";
import _Message from "./tables/Messages";
import _Agent from "./tables/Agents";
import _Chat from "./tables/Chats";
//TODO: Añadir una capa de cache para no consultar varias veces la base de datos para los chat_external_id
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
    async getAgentByChannel(channel) {
        const agent = await this.Agent.model.findOne({
            where: {
                channel,
            },
        });
        return agent.dataValues;
    }
    async getAgentById(agent_id) {
        const agent = await this.Agent.model.findOne({
            where: {
                id: agent_id,
            },
        });
        return agent.dataValues;
    }
    async pushAnswer(answer, chat_id, agent_id, channel) {
        const answer_data = await this.Message.model.create({
            texts: [answer.text],
            _agent: agent_id,
            _chat: chat_id,
        });
        return answer_data.dataValues;
    }
    async pushMessage(message, context) {
        const { channel, chat_external_id, human_external_id, agent_id } =
            context;
        const chat = await this.Chat.touch_one({
            external_id: chat_external_id,
            channel: channel,
        });
        let message_input = {
            texts: message.texts,
            _chat: chat.dataValues.id,
        };
        if (human_external_id) {
            message_input._human = (
                await this.Human.touch_one({
                    external_id: human_external_id,
                })
            ).dataValues.id;
        }
        if (agent_id) {
            message_input._agent = (
                await this.Agent.model.findOne({
                    where: {
                        id: agent_id,
                    },
                })
            ).dataValues.id;
        }
        const new_message = await this.Message.model.create(message_input);
        return new_message.dataValues;
    }
    async getHistoryByExternalId(external_id, channel) {
        const chat = await this.getChatByExternalId(external_id, channel);
        const messages = await this.getMessagesByChat(chat);
        return messages.map(({ dataValues }) => dataValues);
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
    async getChatByExternalId(external_id, channel) {
        return await this.Chat.touch_one({
            external_id,
            channel,
        });
    }
}

export default await _DB.getInstance();
