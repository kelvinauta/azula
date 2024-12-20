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
    async getHistory(human_external_id) {
        const messages = await DB.getMessagesByExternalId(human_external_id)

    }
}
export default Data;
