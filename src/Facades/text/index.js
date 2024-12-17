async function processor(text, functions, args) {
    // 1. Encontrar todos los tokens {{...}}
    const tokenRegex = /{{([^}]+)}}/g;
    const matches = [...text.matchAll(tokenRegex)];
    if (!matches.length) return text;
    // 2. Procesar cada token
    const functionResults = await Promise.all(
        matches.map(async ([fullMatch, content]) => {
            // Solo procesar si empieza con /
            if (!content.startsWith("/")) return fullMatch;
            // Extraer nombre de función y argumentos
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
    // 3. Reemplazar los resultados
    let result = text;
    matches.forEach(([fullMatch], index) => {
        result = result.replace(fullMatch, functionResults[index]);
    });
    return result;
}
const Text = { processor };
export default Text;
