import { parseArgs } from "util";
const { values } = parseArgs({
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
    options: {
        agents: {
            type: "boolean",
        },
        functions: {
            type: "boolean"
        }
    },
});
export default values;
