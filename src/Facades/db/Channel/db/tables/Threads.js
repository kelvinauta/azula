import _Table from "./_Table"
import {DataTypes} from "sequelize"
class Thread extends _Table {
    static attributes = {
        tokens: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        duration_ms: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        logs: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_agents_used: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_bulks_used: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_tools_used: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_input_messages: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_output_messages: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_history_messages: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_request: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_response: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }
    constructor(...all) {
        super(...all);
    }
}

export default Thread