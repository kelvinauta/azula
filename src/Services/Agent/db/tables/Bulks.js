import _Table from "./_Table.js";
import { DataTypes } from "sequelize";

class Bulk extends _Table {
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
    };
    static options = {
        paranoid: true,
    };
    constructor(...all) {
        super(...all);
    }
}

export default Bulk;