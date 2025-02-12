importder>f _Table from "./_Table";
import Messages from "./Messages"
import { DataTypes } from "sequelize";
import { string, define, is, date, object, optional, assert } from "superstruct";
import isUuid from "is-uuid";
class Chat extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        external_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        channel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_interaction: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    };
    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        external_id: optional(string()),
        channel: optional(string()),
        last_interaction: optional(date()),
    };
    static schema_strict = {
        id: define("id", (value) => isUuid.v4(value)),
        external_id: string(),
        channel: string(),
        last_interaction: optional(date()),
    }
    constructor(...all) {
        super(...all);
    }
    
}
export default Chat;
