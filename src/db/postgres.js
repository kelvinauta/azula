import _postgres from 'postgres'
import Rules from "tuki_rules"
import Logger from "tuki_logger"

class Postgres {
    constructor() {
        
        // private
        this.logger = new Logger({title: "Postgres"})
        this.rules = new Rules("Postgres")
        this.sql = _postgres({
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            debug: (...data) => this._debug(...data)
        })
    }

    async get_sql() {
        return this.sql
    }

    // private methods
    _debug(...data){
        // this.logger.info(...data)
    }

}

export default Postgres
