importder>f Provider from "./provider";
import _Human from "./tables/Humans";
import _Message from "./tables/Messages";
import _Agent from "./tables/Agents";
import _Chat from "./tables/Chats";
/* TODO: Añadir un Proxy de cache para no consultar varias veces la base de datos para los chat_external_id*/
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
        return agent?.dataValues;
    }
    async getAgentDefault() {
        const agent = await this.Agent.touch_one({
            channel: "default",
        });
        return agent?.dataValues;
    }
    async getAgentById(agent_id) {
        const agent = await this.Agent.model.findOne({
            where: {
                id: agent_id,
            },
        });
        return agent?.dataValues;
    }
    async pushAnswer(answer, chat_id, agent_id, channel) {
        let message_answer = {
            _agent: agent_id,
            _chat: chat_id,
            texts: [],
        };
        if (answer.output.toolResults?.length) {
            message_answer.texts = [JSON.stringify(answer.output.toolResults)];
        }
        if (answer.output.text) {
            message_answer.texts = [
                answer.output.text,
                ...message_answer.texts,
            ];
        }
        const answer_data = await this.Message.model.create(message_answer);
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
        } else if (agent_id) {
            message_input._agent = (
                await this.Agent.model.findOne({
                    where: {
                        id: agent_id,
                    },
                })
            ).dataValues.id;
        }
        if (!message_input._chat) throw new Error("Chat is required");
        if (!message_input._human && !message_input._agent)
            throw new Error("human or agent assign in message is required");
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
    async addAgent({ name, prompt }) {
        const agent = await this.Agent.touch_one({
            name,
            config: {
                prompt,
            },
        });
        return agent?.dataValues;
    }
}

export default await _DB.getInstance();
