import Logger from "tuki_logger"
import Postgres from "../Services/Agent/db/postgres"

const test_dev = async () => {
    const logger = new Logger({title: "Test Dev"})
    const db = new Postgres()
    await db.connect()
    const schemas = await db.getTablesSchemas()
    logger.json(schemas)
    // await db.initModels()
}

export default test_dev 