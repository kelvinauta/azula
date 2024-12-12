import _Table from "./_Table"
import {DataTypes} from "sequelize"
class Tool extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        external_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    }
    constructor(...all) {
        super(...all);
    }
}

export default Tool