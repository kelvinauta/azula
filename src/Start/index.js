import template from "./get_template";
import Data from "../Facades/data";
import Bulk from "../Facades/data/Rag";
import Cli from "../Cli"
const data = new Data()
async function Start() {
    try {
        if(!Cli.start) return
        const { docs, agents } = await template();
        const bulk = Bulk();
        let promises = [];
        promises.push(bulk.insert.many(docs));
        agents.forEach(({ name, prompt }) =>
            promises.push(data.addAgent({ name, prompt })),
        );
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
export default Start;
