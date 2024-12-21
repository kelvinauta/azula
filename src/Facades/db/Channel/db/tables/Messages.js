import _Table from "./_Table";
import { DataTypes } from "sequelize";
import {
    object,
    string,
    array,
    define,
    optional,
    assert,
} from "superstruct";
import isUuid from "is-uuid";
class Message extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        texts: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        files: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    };
    static validate_message_schema(msg) {
        try {
            assert(msg, object(Message.schema));

            function validate_texts(msg_texts) {
                if (!msg_texts) return false;
                if (!Array.isArray(msg_texts)) return false;
                if (msg_texts.length === 0) return false;
                if (msg_texts.some((txt) => typeof txt !== "string"))
                    return false;
                return true;
            }
            function validate_files(msg_files) {
                if (!msg_files) return false;
                if (!Array.isArray(msg_files)) return false;
                if (msg_files.length === 0) return false;
                if (msg_files.some((file) => typeof file !== "object"))
                    return false;
                return true;
            }
            if (!(validate_texts(msg.texts) || validate_files(msg.files)))
                throw new Error("Message Received no valid");
            return true;
        } catch (e) {
            return false;
        }
    }
    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        texts: optional(array(string())),
        files: optional(array(object())),
    };

    constructor(...all) {
        super(...all);
    }
}

export default Message;
