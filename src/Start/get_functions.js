importder>f fs from "fs-extra";
const FUNCTIONS_PATH = "../../templates/my_template/functions/index.js";
async function get_functions() {
    try {
        if (await fs.pathExists(FUNCTIONS_PATH)) return false;
        const functions = await import(`${FUNCTIONS_PATH}`);
        const { ai, messages, prompt } = functions.default;
        return {
            ai,
            messages,
            prompt,
        };
    } catch (error) {
        console.error(error);
        return false;
    }
}
export default get_functions;
