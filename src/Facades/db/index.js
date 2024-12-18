import Provider from "./Channel/db/provider"
import Message from "./Channel/db/tables/Messages"
class Data {
    constructor({ context, message }){
        this.context = context
        this.message = message
    }
    async init() {
        await Provider.build()        
    }
    getMessage(message) {
        return message
    }
    getAgent() {
    }
    getHistory() {
    }
}
export default Data;
