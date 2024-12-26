import fs from "fs-extra";
import path from "path";
const TEMPLATE_PATH = "../../templates/my_template";
async function get_docs() {
    const docsPath = path.join(__dirname, `${TEMPLATE_PATH}/docs`);
    const files = await fs.readdir(docsPath);
    return await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(docsPath, file);
            const content = await fs.readFile(filePath, "utf-8");
            const title = path.parse(file).name;
            return { title, content, category: "default" };
        }),
    );
}
async function get_agents() {
    const agentsPath = path.join(__dirname, `${TEMPLATE_PATH}/agents`);
    const files = await fs.readdir(agentsPath);
    return await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(agentsPath, file);
            const prompt = await fs.readFile(filePath, "utf-8");
            const name = path.parse(file).name;
            return { name, prompt };
        }),
    );
}
async function get_functions() {
    const functions = await import(`${TEMPLATE_PATH}/functions/`);
    const { ai, messages, prompt } = functions.default;
    return {
        ai,
        messages,
        prompt,
    };
}
export default async function () {
    const [docs, agents, functions] = await Promise.all([
        get_docs(),
        get_agents(),
        get_functions(),
    ]);
    return { docs, agents, functions };
}
