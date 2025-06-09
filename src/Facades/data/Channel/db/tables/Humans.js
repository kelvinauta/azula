import _Table from "./_Table";
import { DataTypes } from "sequelize";
import { z } from "zod";
class Human extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        external_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    };
    static schema = z.object({
        id: z.string().uuid().optional(),
        external_id: z.string().optional(),
        type: z.string().optional(),
        info: z.object({}).optional(),
    });
    constructor(...all) {
        super(...all);
    }
}
export default Human;
