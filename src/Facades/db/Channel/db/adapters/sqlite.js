import { Sequelize } from "sequelize";
class SQLite {
    static instance = null;
    #NAME = process.env.SQLITE_APP_NAME;
    #PATH = process.env.SQLITE_PATH
    static getInstance() {
        if (SQLite.instance) return SQLite.instance;
        SQLite.instance = new SQLite();
        return SQLite.instance;
    }
    constructor() {
        if (SQLite.instance)
            throw new Error("This is a singleton class use .getInstance()");
        SQLite.instance = this;
        this.is_connected = false;
        this.sequelize = new Sequelize(
            `sqlite:${this.#PATH}/${this.#NAME}`,
            {
                dialect: "sqlite",
                logging: false,
            },
        );
    }
    async connect() {
        try {
            await this.sequelize.authenticate();
            this.is_connected = true;
            return this;
        } catch (error) {
            this.is_connected = false;
            throw error;
        }
    }
    async getTablesSchemas() {
        try {
            const query = `
                SELECT 
                    t.table_name,
                    c.column_name,
                    c.data_type,
                    c.character_maximum_length,
                    c.is_nullable,
                    c.column_default
                FROM 
                    information_schema.tables t
                    JOIN information_schema.columns c ON t.table_name = c.table_name
                WHERE 
                    t.table_schema = 'public'
                ORDER BY 
                    t.table_name,
                    c.ordinal_position;
            `;
            const [results] = await this.sequelize.query(query);
            const schemas = {};
            results.forEach((row) => {
                if (!schemas[row.table_name]) {
                    schemas[row.table_name] = {
                        columns: [],
                    };
                }
                schemas[row.table_name].columns.push({
                    name: row.column_name,
                    type: row.data_type,
                    maxLength: row.character_maximum_length,
                    nullable: row.is_nullable === "YES",
                    default: row.column_default,
                });
            });
            return schemas;
        } catch (error) {
            throw error;
        }
    }
}
export default SQLite;
