import _Table from "./_Table.js";
import { DataTypes } from "sequelize";
import {
    object,
    string,
    define,
    optional,
    enums,
    number,
    defaulted,
} from "superstruct";
import isUuid from "is-uuid";

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
        },
        llm_engine: {
            type: DataTypes.JSON,
            defaultValue: {
                model: "gpt-4o",
                provider: "openai",
                max_tokens: 256,
                temperature: 1,
                api_key: process.env.OPENAI_API_KEY, // TODO: la API key por defecto debe tener un limite de uso
            },
            allowNull: false,
        },
    };
    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        name: string(),
        description: optional(string()),
        config: object({
            prompt: string(),
        }),
        llm_engine: object({
            model: string(),
            provider: enums(["openai", "anthropic"]),
            max_tokens: defaulted(number(), 256),
            temperature: defaulted(number(), 1),
            api_key: string(),
        }),
        channel: string(),
    };
    static options = {
        paranoid: true,
    };
    constructor(...all) {
        super(...all);
    }
    async getAgent(id) {
        const agent = await this.model.findOne({ where: { id } });
        if (!agent) throw new Error("Agent not found");
        return agent;
    }
}
export default Agent;
