import Agent from "../Services/Agent/db/tables/Agents.js";
import Provider from "../Services/Agent/db/provider";

describe('Agent Init Errors', () => {
    it('should throw error if use new Agent()', () => {
        expect(() => {
            new Agent();
        }).toThrow();
    });
    it('should throw error if params is not an object', async () => {
        await expect(Agent.getInstance("string")).rejects.toThrow();
    });
    it('should throw error if params.name is not a string', async () => {
        await expect(Agent.getInstance({ name: 123 })).rejects.toThrow();
    });
});



describe('Agent Init Success', () => {
    it('should not error if use Agent.getInstance()', async () => {
        await expect(Agent.getInstance()).resolves.toBeInstanceOf(Agent);
    });
    it('should return the same instance', async () => {
        const agent1 = await Agent.getInstance();
        const agent2 = await Agent.getInstance();
        expect(agent1).toBe(agent2);
    });
});

describe('Agent Methods', () => {
    it('find agent by id', async () => {
        const agent = await Agent.getInstance();
        const agent_id = "ca4e246a-a18d-42ed-b277-7b2e8cdeda0a";
        await expect(agent.getAgent(agent_id)).resolves.toBeInstanceOf(Agent.instance.model);
    });
});
