import _Table from "./_Table";
import { DataTypes } from "sequelize";
import { z } from "zod";
class Message extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        texts: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        llm_messages: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        files: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    };

    validateMessage(msg) {
        try {
            messageSchema.parse(msg);

            if (!msg || (!msg.texts && !msg.files)) {
                throw new Error("Message must have either texts or files");
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    static schema = z.object({
        id: z.string().uuid().optional(),
        texts: z.array(z.string()).optional(),
        files: z.array(z.string()).optional(),
    });

    constructor(...all) {
        super(...all);
    }
}

export default Message;
