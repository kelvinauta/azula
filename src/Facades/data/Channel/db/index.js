import Provider from "./provider/index.js";
import _Human from "./tables/Humans.js";
import _Message from "./tables/Messages.js";
import _Agent from "./tables/Agents.js";
import _Chat from "./tables/Chats.js";
import _Tool from "./tables/Tools.js";
import _Http from "./tables/Http.js";
/* TODO: Añadir un Proxy de cache para no consultar varias veces la base de datos para los chat_external_id*/
class _DB {
    static async getInstance() {
        await Provider.build();
        const [Human, Message, Agent, Chat, Tool, Http] = await Promise.all([
            _Human.getInstance(),
            _Message.getInstance(),
            _Agent.getInstance(),
            _Chat.getInstance(),
            _Tool.getInstance(),
            _Http.getInstance(),
        ]);
        const Tables = { Human, Message, Agent, Chat, Tool, Http };

        return new _DB(Tables);
    }
    constructor(Tables) {
        this.Agent = Tables.Agent;
        this.Message = Tables.Message;
        this.Human = Tables.Human;
        this.Chat = Tables.Chat;
        this.Tool = Tables.Tool;
        this.Http = Tables.Http;
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
            llm_messages: [],
        };
        if (answer.output.llm_messages) {
            message_answer.llm_messages = answer.output.llm_messages;
        }
        if (answer.output.text) {
            message_answer.texts = [answer.output.text, ...message_answer.texts];
        }
        const answer_data = await this.Message.model.create(message_answer);
        return answer_data.dataValues;
    }
    async pushMessage(message, context) {
        const { channel, chat_external_id, human_external_id, agent_id } = context;
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
    async getAllAgents() {
        let agents = await this.Agent.model.findAll();
        agents = agents.map(({ dataValues }) => {
            delete dataValues.llm_engine.api_key;
            return dataValues;
        });
        return agents;
    }
    async addAgent({ name, prompt, channel, llm_engine }) {
        let agent_data = {
            name,
            config: {
                prompt,
            },
        };
        if (channel) agent_data.channel = channel;
        if (llm_engine) agent_data.llm_engine = llm_engine;
        const agent = await this.Agent.touch_one(agent_data);
        return agent?.dataValues;
    }
    async addTool(tool_data, http_data) {
        const keys_tool = [
            "name",
            "description",
            "parameters",
            "dependencies",
            "source",
            "mode",
            "agent_id",
        ];
        const keys_http = [
            "method",
            "url",
            "data_mode",
            "body_static",
            "params_static",
            "headers_static",
            "timeout",
        ];
        await this.Agent.touch_one({
            id: agent_id,
        });
        let newTool = {};
        let newHttp;
        if (http_data) {
            http_data = {};
            for (const key of keys_http) {
                if (http_data[key]) newHttp[key] = http_data[key];
            }
            const http = await this.Http.model.create(newHttp)
            newTool._http = http.dataValues.id
        }
        for (const key of keys_tool) {
            if (tool_data[key]) newTool[key] = tool_data[key];
        }
        const tool = await this.Tool.model.create(newTool);
        return tool?.dataValues;
    }
}

export default await _DB.getInstance();
