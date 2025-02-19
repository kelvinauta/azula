import { parseArgs } from "util";
const { values } = parseArgs({
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
    options: {
        start: {
            type: "boolean",
            short: "s",
        },
    },
});
export default values;
