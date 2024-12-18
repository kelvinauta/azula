import _Table from "./_Table"
import { DataTypes } from "sequelize"
import { object, string,  define, optional} from "superstruct"
import isUuid from "is-uuid"
class Human extends _Table {
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
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        }
    }
    static schema = {
        id: optional(define("id", (value) => isUuid.v4(value))),
        external_id: optional(string()),
        type: optional(string()),
        info: optional(object()),
    }
    constructor(...all) {
        super(...all);
    }
}
export default Human   
