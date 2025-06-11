async function request_webhook(method, payload, agentIdQuery) {
    const HOST = "localhost:3000";
    const ENDPOINT = "v1/webhooks";
    let url = `${HOST}/${ENDPOINT}`;
    if (agentIdQuery) url += `?agent_id=${agentIdQuery}`;
    return await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
    });
}

describe("Endpoint Webhooks", () => {
    const agent_id = "40cb5722-b85d-490c-9f5d-03a5d7ba2d66"; //TODO: static test
    const payload = {
        method: "POST",
        body: JSON.stringify({ event: "test_event" }),
        headers: JSON.stringify({ "Content-Type": "application/json" }),
        url: "https://example.com/webhook",
        event_listener: { answer: false },
        agent_id,
    };
    test("POST /v1/webhooks", async () => {
        const response = await request_webhook("POST", payload);
        const output = await response.json();
        expect(response.ok).toBe(true);
        expect(output).toHaveProperty("id");
        expect(output["_agent"]).toBe(agent_id);
    });
});
