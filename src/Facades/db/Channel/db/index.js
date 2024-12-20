import Provider from "./provider";
import _Human from "./tables/Humans";
import _Message from "./tables/Messages";
import _Agent from "./tables/Agents";

class _DB{
    async getInstance(){
        await Provider.build()
        const [Human, Message, Agent]= await Promise.all([
            _Human.getInstance(),
            _Message.getInstance(),
            _Agent.getInstance(),
        ])
        const Tables = {Human, Message, Agent}

        return new _DB(Tables)

    }
    constructor(Tables){
        this.Agent=Tables.Agent
        this.Message=Tables.Message
        this.Human=Tables.Human
    }
    async getHumanByExternalId(human_external_id) {
        const human = await this.Human.touch_one({
            where: {
                external_id: human_external_id,
            },
        });
        return human
    }
    async getMessagesByHuman(human){
        const id = human.id
        const messages = await this.Message.model.findAll({
            where: {
                id: id
            }
        })
        return messages
    }
    async getMessagesByExternalId(human_external_id){
        const human = await this.getHumanByExternalId(human_external_id)
        const messages = await this.getMessagesByHuman(human)
        return messages
    }
}

const DB = await _DB.getInstance()
return DB
