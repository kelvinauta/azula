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
    const agent_id = "e80de033-da1c-41d4-9ae0-68524c0e1b4e"; //TODO: static test
        const payload = {
            method: "POST",
            url: "https://www.uchat.com.au/api/subscriber/send-text",
            headers: JSON.stringify({
                accept: "application/json",
                Authorization: `Bearer ${process.env.TEST_UCHAT_KEY}`,
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({
                user_ns: "{{human}}",
                content: "{{answer}}",
            }),
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
