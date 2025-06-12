async function request_azula(payload) {
    const HOST = "localhost:3000";
    const ENDPOINT = "v1/chat";
    const URL = `${HOST}/${ENDPOINT}`;
    return await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}
describe("Endpoint Chat", () => {
    const payload = {
        context: {
            human: "f62083u300269395",
            channel: "default",
        },
        message: {
            texts: ["This message is a test, just say: test done"],
        },
    };

    test("wait to response of Agent and Agent response", async () => {
        const response = await request_azula(payload);
        const output = await response.json();
        console.dir(output, { depth: null });
        expect(response.ok).toBe(true);
        expect(output.text).toEqual(expect.any(String));
        expect(output.text).toMatch(/test done/i);
    });
    test("no waiting for response of agent, server respond with 200 instant", async () => {
        const startTime = Date.now();
        const response = await request_azula({
            ...payload,
            config: { wait: false },
            message: {
                texts: ["Escribe un ensayo de 2 páginas sobre Google"],
            },
        });
        const output = await response.text();
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(500); // WARN: respuesta en menos de 500ms
        expect(response.status).toBe(200);
        expect(output).toBeDefined();
    });
});
