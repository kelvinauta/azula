import { Sequelize } from "sequelize";
class Postgres {
    static instance = null;
    static getInstance() {
        if (Postgres.instance) return Postgres.instance;
        Postgres.instance = new Postgres();
        return Postgres.instance;
    }
    constructor() {
        if (Postgres.instance)
            throw new Error("This is a singleton class use .getInstance()");
        Postgres.instance = this;
        this.is_connected = false;
        this.options = {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            dialect: "postgres",
            logging: false,
        };
        const ssl_require = process.env.POSTGRES_SSL_REQUIRE === "true";
        if (ssl_require) {
            this.options.dialectOptions = {
                dialectOptions: {
                    ssl: true,
                },
            };
        }
        this.sequelize = new Sequelize(
            process.env.POSTGRES_DB,
            process.env.POSTGRES_USER,
            process.env.POSTGRES_PASSWORD,
            {
                ...this.options,
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
export default Postgres;
