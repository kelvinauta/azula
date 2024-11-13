import _Table from "./_Table"
import {DataTypes} from "sequelize"
import { object, string, array, define, optional } from "superstruct"
import isUuid from "is-uuid"
class Message extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        texts: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        files: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }
    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        type: optional(string()),
        texts: optional(array(string())),
        files: optional(array(object())),
    }
    
    constructor(...all) {
        super(...all);
    }
}

export default Message