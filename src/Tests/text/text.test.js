import { expect, test, mock } from "bun:test";
import Text from "../../Facades/text";
const { processor } = Text;
test("processor - función simple sin argumentos", async () => {
    const text = "La hora es {{/time}}";
    const functions = {
        time: async () => "12:00",
    };
    const result = await processor({ text, functions, args: {} });
    expect(result).toBe("La hora es 12:00");
});
test("processor - múltiples funciones simples", async () => {
    const text = "{{/greeting}} {{/name}}! Son las {{/time}}";
    const functions = {
        greeting: async () => "Hola",
        name: async () => "Juan",
        time: async () => "15:30",
    };
    const result = await processor({ text, functions, args: {} });
    expect(result).toBe("Hola Juan! Son las 15:30");
});
test("processor - función con args", async () => {
    const text = "Datos: {{/showArgs}}";
    const functions = {
        showArgs: async (args) => JSON.stringify(args),
    };
    const args = { user: "admin", id: 123 };
    const result = await processor({ text, functions, args });
    expect(result).toBe('Datos: {"user":"admin","id":123}');
});
test("processor - función con argumentos personalizados", async () => {
    const text = "Nombre: {{/formatName(Juan Carlos, Pérez García)}}";
    const functions = {
        formatName: async (args, customArgs) => {
            const [nombre, apellido] = customArgs;
            return `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;
        },
    };
    const result = await processor({ text, functions, args: {} });
    expect(result).toBe("Nombre: JUAN CARLOS PÉREZ GARCÍA");
});
test("processor - mezcla de funciones simples y con argumentos", async () => {
    const text =
        "{{/greeting}} {{/formatName(Ana, López)}}! La fecha es {{/date}}";
    const functions = {
        greeting: async () => "Hola",
        formatName: async (args, customArgs) => {
            const [nombre, apellido] = customArgs;
            return `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;
        },
        date: async () => "2024-01-01",
    };
    const result = await processor({ text, functions, args: {} });
    expect(result).toBe("Hola ANA LÓPEZ! La fecha es 2024-01-01");
});
test("processor - función inexistente mantiene el texto original", async () => {
    const text = "Test {{/noexiste}} continúa";
    const functions = {};
    const result = await processor({ text, functions, args: {} });
    expect(result).toBe("Test {{/noexiste}} continúa");
});
test("processor - ejecución paralela", async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const text = "{{/slow1}} {{/slow2}}";
    const functions = {
        slow1: mock(async () => {
            await delay(100);
            return "A";
        }),
        slow2: mock(async () => {
            await delay(100);
            return "B";
        }),
    };
    const startTime = Date.now();
    const result = await processor({ text, functions, args: {} });
    const endTime = Date.now();
    expect(result).toBe("A B");
    expect(endTime - startTime).toBeLessThan(150); // Debería tomar ~100ms, no 200ms
    expect(functions.slow1).toHaveBeenCalledTimes(1);
    expect(functions.slow2).toHaveBeenCalledTimes(1);
});
test("processor - argumentos personalizados con espacios", async () => {
    const text = "{{/join(hola mundo, otro texto con espacios)}}";
    const functions = {
        join: async (args, customArgs) => customArgs.join(" - "),
    };
    const result = await processor({ text, functions, args: {} });
    expect(result).toBe("hola mundo - otro texto con espacios");
});
