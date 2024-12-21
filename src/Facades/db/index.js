import DB from "./Channel/db";
class Data {
    constructor({ context, message }) {
        this.context = context;
        this.message = message;
    }
    async getMessage() {
        const message_data = await DB.pushMessage(
            this.message,
            this.context.channel,
            this.context.chat,
            this.context.human,
        );
        return message_data;
    }
    async getAgent() {
        return await DB.getAgent(this.context.channel)
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
