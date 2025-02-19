async function processor({ text, functions, args }) {
    if(!functions) return text
    const tokenRegex = /{{([^}]+)}}/g;
    const matches = [...text.matchAll(tokenRegex)];
    if (!matches.length) return text;
    const functionResults = await Promise.all(
        matches.map(async ([fullMatch, content]) => {
            if (!content.startsWith("/")) return fullMatch;
            const functionParts = content
                .slice(1)
                .match(/([^(]+)(?:\((.*)\))?/);
            if (!functionParts) return fullMatch;
            const [_, funcName, argsStr] = functionParts;
            const fn = functions[funcName];
            if (!fn) return fullMatch;
            try {
                const customArgs = argsStr
                    ? argsStr.split(",").map((arg) => arg.trim())
                    : [];
                return await fn(args, customArgs);
            } catch (error) {
                console.error(`Error en función ${funcName}:`, error);
                return fullMatch;
            }
        }),
    );
    let result = text;
    matches.forEach(([fullMatch], index) => {
        result = result.replace(fullMatch, functionResults[index]);
    });
    return result;
}
const Text = { processor };
export default Text;
