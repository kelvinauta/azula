import DB from "./Channel/db";

class Data {
    /*  NOTE: Objeto desechable de un unico uso */
    constructor() {
        this.context;
        this.message;
        this.data = {
            agent_id: null,
            human_id: null,
            chat_id: null,
        };
    }
    setMessage(message) {
        this.message = message;
    }
    setContext(context) {
        this.context = context;
    }
    async pushAnswer(answer) {
        const answer_data = await DB.pushAnswer(
            answer,
            this.data.chat_id,
            this.data.agent_id,
            this.context.channel,
        );
        return answer_data;
    }
    async getMessage() {
        const message_data = await DB.pushMessage(this.message, {
            channel: this.context.channel,
            chat_external_id: this.context.chat,
            human_external_id: this.context.human,
            agent_id: this.context.agent,
        });
        this.data.chat_id = message_data._chat;
        this.data.human_id = message_data._human;
        return message_data;
    }
    async getAgent() {
        let agent = this.context.agent
            ? await DB.getAgentById(this.context.agent)
            : await DB.getAgentByChannel(this.context.channel);
        if (!agent) agent = await DB.getAgentDefault();
        this.data.agent_id = agent.id;
        return agent;
    }
    async getHistory() {
        const chat_external_id = this.context.chat;
        const messages = await DB.getHistoryByExternalId(
            chat_external_id,
            this.context.channel,
        );
        let history = [];
        messages.forEach((msg) => {
            const msg_data = msg;
            const agent = msg_data._agent && "assistant";
            const human = msg_data._human && "user";
            if (!agent && !human) {
                console.warn(
                    `In message ${msg_data.id} agent and human is null`,
                );
                return;
            }
            const push_history = msg_data.texts
                .map((txt) => ({
                    role: agent || human,
                    content: txt,
                }))
                .flat();
            history = [...history, ...push_history];
        });
        return history;
    }
    async addAgent({ name, prompt }) {
        /* TODO: Quiza operaciones como addAgent deberia ser manejado por otra clase */
        return DB.addAgent({ name, prompt });
    }
}
export default Data;
