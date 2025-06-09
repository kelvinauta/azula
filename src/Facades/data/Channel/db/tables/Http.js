
import _Table from "./_Table.js"
import { DataTypes } from "sequelize"
import { z } from "zod";

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

    static schema = z.object({
        id:z.string().uuid().optional(),
        method: z.string(),
        url: z.string(),
        data_mode: z.string().optional(),
        body_static: z.object({}).optional(),
        params_static: z.object({}).optional(),
        headers_static: z.object({}).optional(),
        timeout: z.string().optional(),
    })

    constructor(...all) {
        super(...all);
    }
}

export default Http;
