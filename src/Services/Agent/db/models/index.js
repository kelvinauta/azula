import { DataTypes } from "sequelize"
function Models(sequelize) {
    const Agent = sequelize.define("Agent", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false
        },
        components: {
            type: DataTypes.JSON,
            allowNull: false
        }
    })
    const Prompt = sequelize.define("Prompt", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false
        }
    })
    const Bulk = sequelize.define("Bulk", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        external_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false
        }
    })
    const Tool = sequelize.define("Tool", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        external_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false
        }
    })
    return [Agent, Prompt, Bulk, Tool]
}

export default Models;