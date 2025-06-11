import get_template from "./get_template";
import Data from "../Facades/data";
import Cli from "../Cli";
const data = new Data();
async function Start() {
    try {
        if (!Cli.agents) return;
        let agents;
        try {
            agents = (await get_template()).agents;
        } catch (error) {
            console.error(error.message);
            return;
        }
        let promises = [];
        agents.forEach(async ({ name, prompt }) => {
            await data.addAgent({ name, channel: name, prompt });
            console.log(`Add Agent from template: ${name}`)
        });

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
export default Start;
