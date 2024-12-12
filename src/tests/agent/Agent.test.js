import Agent from "../../Services/Agent/db/tables/Agents.js";
import AgentFactory from "../../Services/Agent/db/factory/AgentFactory.js";
import Provider from "../../Services/Agent/db/provider/index.js";
import { v4 as uuidv4 } from "uuid";
describe("AgentTable", async () => {
    describe("Agent Init Success", () => {
        it("should not error if use Agent.getInstance()", async () => {
            await expect(Agent.getInstance()).resolves.toBeInstanceOf(Agent);
        });
        it("should return the same instance", async () => {
            const agent1 = await Agent.getInstance();
            const agent2 = await Agent.getInstance();
            expect(agent1).toBe(agent2);
        });
    });
    describe("Agent Methods", () => {
        it("find agent by id and verify data", async () => {
            const agent = await Agent.getInstance();
            await Provider.build();
            const factory = new AgentFactory(agent);
            const testData = {
                name: `test-agent-${uuidv4()}`,
                description: "test description",
                config: {
                    prompt: "test prompt",
                    model: "test-model",
                },
            };

            const createdAgent = await factory.simple(testData);
            const foundAgent = await agent.getAgent(createdAgent.id);

            expect(foundAgent.id).toBe(createdAgent.id);
            expect(foundAgent.name).toBe(testData.name);
            expect(foundAgent.description).toBe(testData.description);
            expect(foundAgent.config).toEqual(testData.config);
        });
    });
});
