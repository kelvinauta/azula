import { DataTypes } from "sequelize";
function Models(sequelize) {
    const Agents = sequelize.define("Agents", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    }, {
        paranoid: true,
    });
    const Prompts = sequelize.define("Prompts", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        config: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    }, {
        paranoid: true,
    });
    const Bulks = sequelize.define("Bulks", {
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
    }, {
        paranoid: true,
    });
    const Tools = sequelize.define("Tools", {
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
    }, {
        paranoid: true,
    });
    const Chats = sequelize.define("Chats", {
        origin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_interaction: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        paranoid: true,
    });

    const Humans = sequelize.define("Humans", {
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        info: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        paranoid: true,
    });

    const Messages = sequelize.define("Messages", {
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        files: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        paranoid: true,
    });
    const Threads = sequelize.define("Threads", {
        tokens: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        duration_ms: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        logs: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_agents_used: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_bulks_used: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_tools_used: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_input_messages: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_output_messages: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_history_messages: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_request: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        raw_response: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    });

    const AgentsBulks = sequelize.define("AgentsBulks", {
        _agent: {
            type: DataTypes.UUID,
            references: {
                model: Agents,
                key: "id",
            },
        },
        _bulk: {
            type: DataTypes.UUID,
            references: {
                model: Bulks,
                key: "id",
            },
        },
    });
    const AgentsTools = sequelize.define("AgentsTools", {
        _agent: {
            type: DataTypes.UUID,
            references: {
                model: Agents,
                key: "id",
            },
        },
        _tool: {
            type: DataTypes.UUID,
            references: {
                model: Tools,
                key: "id",
            },
        },
    });
    Agents.belongsToMany(Bulks, {
        through: AgentsBulks,
    });
    Bulks.belongsToMany(Agents, {
        through: AgentsBulks,
    });
    Agents.belongsToMany(Tools, {
        through: AgentsTools,
    });
    Tools.belongsToMany(Agents, {
        through: AgentsTools,
    });
    Agents.hasMany(Messages,{ 
        foreignKey: "_agent",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });
    Humans.hasMany(Messages,{
        foreignKey: "_human",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });
    Chats.hasMany(Messages,{
        foreignKey: {
            name: "_chat",
            allowNull: false,
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
    });
    Messages.belongsTo(Agents,{
        foreignKey: "_agent"
    });
    Messages.belongsTo(Humans,{
        foreignKey: "_human"
    });
    Messages.belongsTo(Chats,{
        foreignKey: "_chat"
    });

    Messages.hasMany(Threads,{
        foreignKey: "_input_message"
    });
    Messages.hasMany(Threads,{
        foreignKey: "_output_message"
    });
    Threads.belongsTo(Messages,{
        foreignKey: "_input_message"
    });
    Threads.belongsTo(Messages,{
        foreignKey: "_output_message"
    });
    return [Agents, Prompts, Bulks, Tools, Chats, Humans, Messages, AgentsBulks, AgentsTools, Threads];
}

export default Models;
