import Agent from "../tables/Agents";
import Provider from "../provider";
import { assert, object, string } from "superstruct";
class AgentFactory {
    constructor(agent_table_intance){
        this.agent_table_intance = agent_table_intance;
        this.#validate();
    }
    #validate(){
        if(!this.agent_table_intance) throw new Error("agent_table_intance table is required");
        if(!(this.agent_table_intance instanceof Agent)) throw new Error("agent_table_intance table is invalid");
        if(!Provider.instance) throw new Error("Provider is required");
        if(!Provider.all_is_ok()) throw new Error("Provider is not ready");
    }

    async simple(agent_data){
        this.#validate();
        assert(agent_data, object(this.agent_table_intance.constructor.schema));
        const agent = await this.agent_table_intance.model.create(agent_data);
        return agent.dataValues
    }
}
export default AgentFactory;
