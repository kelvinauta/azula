import _Table from "./_Table.js";
import { DataTypes } from "sequelize";
import { z } from "zod";

class Agent extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: "default_name",
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        config: {
            type: DataTypes.JSON,
            defaultValue: { prompt: "" },
            allowNull: false,
        },
        channel: {
            type: DataTypes.STRING,
            defaultValue: "default",
            allowNull: false,
            unique: true
        },
        llm_engine: {
            type: DataTypes.JSON,
            defaultValue: {
                model: "gpt-4o",
                provider: "openai",
                max_tokens: 256,
                temperature: 1,
                api_key: process.env.OPENAI_API_KEY, /*  TODO: la API key por defecto debe tener un limite de uso */
            },
            allowNull: false,
        },
    };
    
    static schema = z.object({
        id: z.string().uuid().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        config:z.object({
            prompt: z.string(),
        }),
        llm_engine: z.object({
            model: z.string(),
            provider: z.enum(["openai", "anthropic"]),
            max_tokens: z.number().default(256),
            temperature: z.number().default(1),
            api_key: z.string()
        }),
        channel: z.string()
    })
    static options = {
        paranoid: true,
    };
    constructor(...all) {
        super(...all);
    }
    async getAgent(id) {
        const agent = await this.model.findOne({ where: { id } });
        if (!agent) throw new Error("Agent not found");
        const validatedAgent = Agent.schema.parse(agent.dataValues);
        return validatedAgent;
    }
}
export default Agent;
