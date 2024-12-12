import ClientAgent from "../../Services/Agent/client";
import AgentFactory from "../../Services/Agent/db/factory/AgentFactory";
import Provider from "../../Services/Agent/db/provider";
import Agent from "../../Services/Agent/db/tables/Agents";
import { v4 as uuidv4 } from "uuid";
describe("ClientAgent", () => {
    let clientAgent;
    let validParams;
    let testagent;

    beforeEach(async () => {
        await Provider.build();
        clientAgent = new ClientAgent();
        const agent = await Agent.getInstance();
        const factory = new AgentFactory(agent);
        testagent = await factory.simple({
            name: `test-agent-${uuidv4()}`,
            config: {
                prompt: "you are a helpful assistant",
                model: "gpt-3.5-turbo",
            },
        });

        validParams = {
            external_human_id: "jorge",
            external_chat_id: "1234chat",
            agent_id: testagent.id,
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
    });

    describe("Testing of validate Params", () => {
        it("Error if empty params", () => {
            expect(async () => {
                await clientAgent.input();
            }).toThrow();
        });
        it("Error if invalid params", () => {
            expect(async () => {
                await clientAgent.input({
                    ...validParams,
                    external_human_id: null,
                });
            }).toThrow();
        });
        it("Error if invalid message", () => {
            expect(async () => {
                await clientAgent.input({
                    ...validParams,
                    message: "hola",
                });
            }).toThrow();
        });
        it("Valid Params must no be Error", () => {
            expect(async () => {
                await clientAgent.input({
                    ...validParams,
                });
            }).not.toThrow();
        });
    });
});
