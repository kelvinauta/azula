import _Table from "./_Table";
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
        origin: {
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
        origin: optional(string()),
        last_interaction: optional(date()),
    };
    static schema_strict = {
        id: define("id", (value) => isUuid.v4(value)),
        external_id: string(),
        origin: string(),
        last_interaction: optional(date()),
    }
    constructor(...all) {
        super(...all);
    }
    async getHistoryChat(chat_row) {
        if (!chat_row) throw new Error("chat_row args is required")
        assert(chat_row, object(Chat.schema_strict))
        const messages = await Messages.getInstance()
        const all_messages = await messages.getMessagesWhereChat(chat_row)
        return all_messages

    }
}

export default Chat;
