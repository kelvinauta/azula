import _Table from "./_Table.js";
import { DataTypes } from "sequelize";

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
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
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

export default Agent;
