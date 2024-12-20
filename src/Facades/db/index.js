import DB from "./Channel/db"
class Data {
    constructor({ context, message }){
        this.context = context
        this.message = message
    }
    async init() {

    }
    getMessage(message) {
        return message
    }
    getAgent() {
    }
    async getHistory() {
        const chat_external_id = this.context.chat
        const messages = await DB.getHistoryByExternalId(chat_external_id)
        const history = messages.map((msg)=>{
            const msg_data = msg
            const agent = msg_data.agent && "assistant"
            const human = msg_data.human && "user"
            return msg_data.texts.map((txt)=>({
                role: agent || human,
                content: txt
            }))
        }).flat()
        return history
    }
}
export default Data;
