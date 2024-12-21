import DB from "./Channel/db";

class Data {
    // NOTE: Objeto desechable de un unico uso
    constructor({ context, message }) {
        this.context = context;
        this.message = message;
        this.data = {
            agent_id: null,
            human_id: null,
            chat_id: null,
        };
    }
    async pushAnswer(answer){
        const answer_data = await DB.pushAnswer(answer, this.data.chat_id, this.data.agent_id)
        return answer_data
    }
    async getMessage() {
        const message_data = await DB.pushMessage(
            this.message,
            this.context.channel,
            this.context.chat,
            this.context.human,
        );
        this.data.chat_id = message_data._chat;
        this.data.human_id - message_data._human;
        return message_data;
    }
    async getAgent() {
        const agent = await DB.getAgent(this.context.channel);
        this.data.agent_id = agent.id;
        return agent;
    }
    async getHistory() {
        const chat_external_id = this.context.chat;
        const messages = await DB.getHistoryByExternalId(chat_external_id);
        const history = messages
            .map((msg) => {
                const msg_data = msg;
                const agent = msg_data._agent && "assistant";
                const human = msg_data._human && "user";
                return msg_data.texts.map((txt) => ({
                    role: agent || human,
                    content: txt,
                }));
            })
            .flat();
        return history;
    }
}
export default Data;
