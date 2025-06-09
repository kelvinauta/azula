import _Table from "./_Table.js";
import { DataTypes } from "sequelize";
import { z } from "zod";

class Tools extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        mode: {
            type: DataTypes.ENUM("source", "http"),
            allowNull: false,
            defaultValue: "http",
        },
        source: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dependencies: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        parameters: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    };

    static schema = z.object({
        id: z.string().uuid().optional(),
        name: z.string(),
        description: z.string().optional(),
        source: z.string(),
        dependencies: z.array(z.string()).optional(),
        parameters: z.object({}).optional(),
    });

    constructor(...all) {
        super(...all);
    }
}

export default Tools;
