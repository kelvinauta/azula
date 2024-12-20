import { expect, test, beforeAll } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import AgentFactory from "../../../Facades/db/Channel/db/factory/AgentFactory";
import Agent from "../../../Facades/db/Channel/db/tables/Agents";
import Provider from "../../../Facades/db/Channel/db/provider";
test("AgentFactory debe crear un agente correctamente", async () => {
  await Provider.build();
  const agentInstance = await Agent.getInstance();
  const factory = new AgentFactory(agentInstance);
  const testData = {
    name: `test-agent-${uuidv4()}`,
    description: "Agente de prueba",
    config: {
      prompt: "Este es un prompt de prueba"
    },
    llm_engine: {
      model: "gpt-3.5-turbo",
      provider: "openai",
      max_tokens: 256,
      temperature: 1,
      api_key: "test-key"
    },
    channel: "test-channel"
  };
  const createdAgent = await factory.simple(testData);
  const foundAgent = await agentInstance.model.findOne({
    where: { name: testData.name }
  });
  expect(foundAgent).toBeTruthy();
  expect(foundAgent.name).toBe(testData.name);
  expect(foundAgent.description).toBe(testData.description);
  await foundAgent.destroy();
});
