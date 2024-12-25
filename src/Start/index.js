import template from "./get_template";
import Data from "../Facades/db";
import Bulk from "../Facades/db/Rag";
const data = new Data()
async function db_empty() {
    return Boolean(await data.isEmptyData());
}
async function Start() {
    try {
        const is_db_empty = await db_empty();
        if (!is_db_empty) return;
        const { docs, agents } = await template();
        const bulk = Bulk();
        let promises = [];
        promises.push(bulk.insert.many(docs));
        agents.forEach(({ name, prompt }) =>
            promises.push(data.addAgent({ name, prompt })),
        );
        const result = await Promise.all(promises);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
export default Start;
