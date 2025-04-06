
import _Table from "./_Table.js"
import { DataTypes } from "sequelize"
import { object, string, array, define, optional, assert } from "superstruct"
import isUuid from "is-uuid"

class Http extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        method: {
            type: DataTypes.ENUM("GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"),
            allowNull: false,
            defaultValue: "POST"
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data_mode: {
            type: DataTypes.ENUM("body", "params"),
            allowNull: false,
            defaultValue: "body"
        },
        body_static: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        params_static: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        headers_static: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        timeout: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    };

    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        method: string(),
        url: string(),
        data_mode: optional(string()),
        body_static: optional(object()),
        params_static: optional(object()),
        headers_static: optional(object()),
        timeout: optional(string()),
    };

    constructor(...all) {
        super(...all);
    }
}

export default Http;
