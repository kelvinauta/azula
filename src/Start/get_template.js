import fs from "fs-extra";
import path from "path";
import { z } from "zod";
import Cli from "../Cli";

const TEMPLATE_DIR =
    process.env.TEMPLATE_DIR || path.join(__dirname, "../../templates/start_template");
async function get_agents() {
    const agentsPath = path.join(TEMPLATE_DIR, "agents");
    const files = await fs.readdir(agentsPath);
    return await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(agentsPath, file);
            const prompt = await fs.readFile(filePath, "utf-8");
            const name = path.parse(file).name;
            return { name, prompt };
        })
    );
}
async function get_functions() {
    const functions = await import(`${TEMPLATE_DIR}/functions/`);
    let { ai, messages, prompt } = functions.default;
    ai = ai.map((tool) => {
        return {
            ...tool,
            parameters: tool.parameters(z),
        };
    });
    return {
        ai,
        messages,
        prompt,
    };
}

function validate_template_dir(templateDir) {
    const REQUIRED_PATHS = [
        "functions/index.js",
        "functions/ai/index.js",
        "functions/messages/index.js",
        "functions/prompt/index.js",
        "agents/default.md",
    ];

    const root = path.resolve(__dirname, templateDir);
    for (const rel of REQUIRED_PATHS) {
        const fullPath = path.join(root, rel);
        if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
            let msg = ``;
            msg += `TEMPLATE_DIR ${templateDir} error in structure\n`;
            msg += `Missing Template file: "${rel}" in "${root}"\n`;
            msg += `To Fixed copy dir in templates/start_template in your location and set correct env var TEMPLATE_DIR\n`;
            msg += `Command suggest to execute:\n`;
            msg += `mkdir -p ${TEMPLATE_DIR} && cp -r ${process.cwd()}/templates/start_template/* ${TEMPLATE_DIR}`;
            throw new Error(msg);
        }
    }
}

if (Cli.agents) console.log(`You used --agents using this TEMPLATE_DIR: ${TEMPLATE_DIR}`);
if (Cli.functions) console.log(`You used --functions using this TEMPLATE_DIR: ${TEMPLATE_DIR}`);
export default async function() {
    validate_template_dir(TEMPLATE_DIR);
    const [agents, functions] = await Promise.all([get_agents(), get_functions()]);
    return { agents, functions, TEMPLATE_DIR };
}
