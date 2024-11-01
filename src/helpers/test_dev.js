import DB from "../db/db";

const test_dev = async () => {
    const db = new DB()
    // const schema = await db.read_schema()
    
    await db.init_schema()
    // await db.validate_schema()
}

export default test_dev