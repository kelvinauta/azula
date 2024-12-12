import AgentFactory from "../../../Facades/db/Chats/db/factory/AgentFactory";
import Agent from "../../../Facades/db/Chats/db/tables/Agents";
import Provider from "../../../Facades/db/Chats/db/provider";
import Postgres from "../../../Facades/db/Chats/db/postgres";
import { faker } from '@faker-js/faker';

describe('AgentFactory', () => {
    let validAgentData;
    let postgres;
    let agentFactory;

    beforeEach(() => {
        validAgentData = {
            name: faker.company.name(),
            description: faker.lorem.sentence(),
            config: {
                prompt: faker.lorem.paragraph(),
                model: 'gpt-4'
            }
        };
        postgres = Postgres.getInstance();
    });

    describe('Constructor validation', () => {
        it('should throw error if agent_table_intance is null', () => {
            expect(() => {
                new AgentFactory(null);
            }).toThrow();
        });

        it('should throw error if agent_table_intance is not an Agent instance', () => {
            class FakeTable {}
            const fakeTable = new FakeTable();
            
            expect(() => {
                new AgentFactory(fakeTable);
            }).toThrow();
        });
    });

    describe('Provider validation', () => {
        beforeEach(async () => {
            await Agent.getInstance()
            // original_agent = Agent;
            await Provider.build()
            // original_provider = Provider;

        });

        it('should throw error if Provider is not built', async () => {
            agentFactory = new AgentFactory(Agent.instance);
            const original_provider = Provider;
            Provider.instance = null;
            await expect(agentFactory.simple(validAgentData)).rejects.toThrow("Provider is required");
            Provider.instance = original_provider.instance;
        });

    });

    describe('Agent data validation', () => {
        beforeEach(async () => {
            await Provider.build();
            agentFactory = new AgentFactory(Agent.instance);
        });

        it('should throw error if name is missing', async () => {
            const { name, ...invalidData } = validAgentData;
            await expect(agentFactory.simple(invalidData)).rejects.toThrow();
        });

        it('should throw error if config is invalid', async () => {
            const invalidData = {
                ...validAgentData,
                config: { wrong_field: 'value' }
            };
            await expect(agentFactory.simple(invalidData)).rejects.toThrow();
        });

        it('should throw error if config is missing required fields', async () => {
            const invalidData = {
                ...validAgentData,
                config: { prompt: 'only prompt' }
            };
            await expect(agentFactory.simple(invalidData)).rejects.toThrow();
        });
    });

    describe('Agent creation', () => {
        beforeEach(async () => {
            await Provider.build();
            agentFactory = new AgentFactory(Agent.instance);
        });

        it('should return an instance of Agent.instance.model', async () => {
            const result = await agentFactory.simple(validAgentData);
            await expect(result).toBeInstanceOf(Agent.instance.model);
        });

        it('should create agent in database', async () => {
            const result = await agentFactory.simple(validAgentData);
            
            // Verificar en la base de datos
            const foundAgent = await Agent.instance.model.findOne({
                where: { id: result.id }
            });

            expect(foundAgent).toBeTruthy();
            expect(foundAgent.name).toBe(validAgentData.name);
            expect(foundAgent.description).toBe(validAgentData.description);
            expect(foundAgent.config).toEqual(validAgentData.config);
        });
    });
});


