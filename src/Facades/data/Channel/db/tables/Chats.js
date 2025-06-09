import _Table from "./_Table";
import Messages from "./Messages";
import { DataTypes } from "sequelize";
import { z } from "zod";
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

    static schema = z.object({
        id: z.string().uuid().optional(),
        external_id: z.string().optional(),
        channel: z.string().optional(),
        last_interaction: z.date().optional(),
    });
    static schema_strict = {
        id: z.string().uuid().optional(),
        external_id: z.string(),
        channel: z.string(),
        last_interaction: z.date().optional(),
    };
    constructor(...all) {
        super(...all);
    }
}
export default Chat;
