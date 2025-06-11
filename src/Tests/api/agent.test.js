import { v4 as uuidv4 } from "uuid";
async function request_agents(method, payload) {
    const HOST = "localhost:3000";
    const ENDPOINT = "v1/agents";
    const URL = `${HOST}/${ENDPOINT}`;
    return await fetch(URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
    });
}

describe("Endpoint Agents", () => {
    const payload = {
        name: "test_agent" + uuidv4(),
        prompt: "This is a test agent",
        channel: "default",
        llm_engine: {
            model: "gpt-4.1-nano",
            provider: "openai",
            api_key: process.env.OPENAI_API_KEY || "NOAPIKEY",
        },
    };

    test("POST /v1/agents", async () => {
        const response = await request_agents("POST", payload);
        const output = await response.json();
        expect(response.ok).toBe(true);
        expect(output).toHaveProperty("id");
        expect(output.name).toBe(payload.name);
    });

    test("GET /v1/agents", async () => {
        const response = await request_agents("GET");
        const output = await response.json();
        console.dir(output, { depth: null });
        expect(response.ok).toBe(true);
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBeGreaterThanOrEqual(1);
    });
});
