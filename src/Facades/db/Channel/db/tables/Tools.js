import _Table from "./_Table.js"
import { DataTypes } from "sequelize"
import { object, string, array, define, optional, assert } from "superstruct"
import isUuid from "is-uuid"

class Tools extends _Table {
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
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        source: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        dependencies: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        parameters: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    };

    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        name: string(),
        description: optional(string()),
        source: string(),
        dependencies: optional(array(string())),
        parameters: optional(object()),
    };

    constructor(...all) {
        super(...all);
    }
}

export default Tools;
