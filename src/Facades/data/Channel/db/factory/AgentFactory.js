import Agent from "../tables/Agents";
import Provider from "../provider";

class AgentFactory {
    constructor(agent_table_instance) {
        this.agent_table_instance = agent_table_instance;
        this.#validate();
    }

    #validate() {
        if (!this.agent_table_instance) {
            throw new Error("agent_table_instance table is required");
        }
        if (!(this.agent_table_instance instanceof Agent)) {
            throw new Error("agent_table_instance table is invalid");
        }
        if (!Provider.instance) {
            throw new Error("Provider is required");
        }
        if (!Provider.all_is_ok()) {
            throw new Error("Provider is not ready");
        }
    }

    async simple(agent_data) {
        this.#validate();

        const schema = this.agent_table_instance.constructor.schema;
        if (!schema) {
            throw new Error("Schema is not defined for the agent_table_instance");
        }

        // Ejecuta la validación con Zod
        schema.parse(agent_data);

        // Crea el agente en la base de datos
        const agent = await this.agent_table_instance.model.create(agent_data);
        return agent.dataValues;
    }
}

export default AgentFactory;