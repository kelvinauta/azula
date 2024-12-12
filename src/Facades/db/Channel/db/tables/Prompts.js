import _Table from "./_Table.js";
import { DataTypes } from "sequelize";

class Prompt extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    };
    static options = {
        paranoid: true,
    };
    constructor(...all) {
        super(...all);
    }
}

export default Prompt;