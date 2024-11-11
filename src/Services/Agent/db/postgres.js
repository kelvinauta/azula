import { Sequelize } from 'sequelize';
import Logger from "tuki_logger"

// * Lib sequelize
class Postgres {
    static #instance = null;
    static is_connected = false;
    #logger;

    // * Get instance
    static getInstance() {
        if(Postgres.#instance) return Postgres.#instance;
        Postgres.#instance = new Postgres();
        return Postgres.#instance;
    }

    constructor() {
        if (Postgres.#instance) throw new Error("This is a singleton class use .getInstance()")
        Postgres.#instance = this;
        this.sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            dialect: "postgres",
            logging: false,
        })

        
        this.#logger = new Logger({title: "Postgres"});
    }
    // * Public methods
    async connect() {
        try {
            this.#logger.status("Connecting to Postgres")
            await this.sequelize.authenticate();
            Postgres.is_connected = true;
            this.#logger.success("Postgres connected")
            return this;
        } catch (error) {
            this.#logger.error(error)
            Postgres.is_connected = false;
            throw error
        }
    }
    
    async getTablesSchemas() {
        this.#logger.status("Getting tables schemas")
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
            
            // Organizar los resultados por tabla
            const schemas = {};
            results.forEach(row => {
                if (!schemas[row.table_name]) {
                    schemas[row.table_name] = {
                        columns: []
                    };
                }
                
                schemas[row.table_name].columns.push({
                    name: row.column_name,
                    type: row.data_type,
                    maxLength: row.character_maximum_length,
                    nullable: row.is_nullable === 'YES',
                    default: row.column_default
                });
            });
            
            return schemas;
        } catch (error) {
            this.#logger.error('Error obteniendo esquemas de tablas:', error);
            throw error;
        }
    }

}

export default Postgres


// * Lib postgres.js
// class Postgres {
//     constructor() {
        
//         // private
//         this.logger = new Logger({title: "Postgres"})
//         this.rules = new Rules("Postgres")
//         this.sql = _postgres({
//             host: process.env.POSTGRES_HOST,
//             port: process.env.POSTGRES_PORT,
//             database: process.env.POSTGRES_DB,
//             user: process.env.POSTGRES_USER,
//             password: process.env.POSTGRES_PASSWORD,
//             debug: (...data) => this._debug(...data)
//         })
//     }

//     async get_sql() {
//         return this.sql
//     }

//     // private methods
//     _debug(...data){
//         // this.logger.info(...data)
//     }

// }

