import ProxyAgent from "../Services/Agent/proxy";

describe("ProxyAgent", () => {
    const proxy = new ProxyAgent();
    const validParams = {
        external_human_id: "jorge",
        external_chat_id: "1234chat",
        agent_id: "ea6c25a1-ab67-4e57-8d49-370c79908d39",
        origin_chat: "whatsapp",
        message: {
            type: "received",
            texts: ["hola"],
            files: [
                {
                    url: "image.jpg",
                },
            ],
        },
    };
    describe("Testing of validate Params", () => {
        it("Error if empty params", () => {
            expect(async () => {
                await proxy.input();
            }).toThrow();
        });
        it("Error if invalid params", () => {
            expect(async () => {
                await proxy.input({
                    ...validParams,
                    external_human_id: null,
                });
            }).toThrow();
        });
        it("Error if invalid message", () => {
            expect(async () => {
                await proxy.input({
                    ...validParams,
                    message: "hola",
                });
            }).toThrow();
        });
        it("Valid Params must no be Error", () => {
            expect(async () => {
                await proxy.input({
                    ...validParams,
                });
            }).not.toThrow();
        });
    });
});
