import { test, expect, beforeAll, afterAll } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Provider from "../../../Facades/data/Channel/db/provider/index.js";
import AgentFactory from "../../../Facades/data/Channel/db/factory/AgentFactory.js";
import Agent from "../../../Facades/data/Channel/db/tables/Agents.js";
import dbInstance from "../../../Facades/data/Channel/db/index.js";
import Human from "../../../Facades/data/Channel/db/tables/Humans.js";
import Chat from "../../../Facades/data/Channel/db/tables/Chats.js";
import WebHook from "../../../Facades/data/Channel/db/tables/Webhooks.js";

let testAgent;
let testAgentWithoutWebhook;
let testHuman;
let testChat;
let testWebhook;
const CHANNEL = uuidv4();
const CHANNEL_WITHOUT_WEBHOOK = uuidv4();
const resourcesToClean = new Set();

beforeAll(async () => {
    await Provider.build();
    
    // Create test agent with webhook
    const agentInstance = await Agent.getInstance();
    const factory = new AgentFactory(agentInstance);
    testAgent = await factory.simple({
        name: `test-agent-${uuidv4()}`,
        description: "Test Agent",
        config: {
            prompt: "Test Prompt",
        },
        llm_engine: {
            model: "gpt-3.5-turbo",
            provider: "openai",
            max_tokens: 256,
            temperature: 1,
            api_key: "test-key",
        },
        channel: CHANNEL,
    });
    resourcesToClean.add(testAgent.id);

    // Create test agent without webhook
    testAgentWithoutWebhook = await factory.simple({
        name: `test-agent-no-webhook-${uuidv4()}`,
        description: "Test Agent Without Webhook",
        config: {
            prompt: "Test Prompt",
        },
        llm_engine: {
            model: "gpt-3.5-turbo",
            provider: "openai",
            max_tokens: 256,
            temperature: 1,
            api_key: "test-key",
        },
        channel: CHANNEL_WITHOUT_WEBHOOK,
    });
    resourcesToClean.add(testAgentWithoutWebhook.id);

    // Create test webhook
    const webhookInstance = await WebHook.getInstance();
    testWebhook = await webhookInstance.model.create({
        method: 'POST',
        url: 'https://test.com/webhook',
        body: JSON.stringify({ message: "Test webhook" }),
        headers: JSON.stringify({ 'X-Test': 'true' }),
        event_listener: { answer: true },
        _agent: testAgent.id
    });

    // Create test human
    const humanInstance = await Human.getInstance();
    testHuman = await humanInstance.model.create({
        external_id: uuidv4(),
    });

    // Create test chat
    const chatInstance = await Chat.getInstance();
    testChat = await chatInstance.model.create({
        external_id: uuidv4(),
        channel: CHANNEL,
    });
});

afterAll(async () => {
    // Cleanup all test data
    for (const id of resourcesToClean) {
        await (await Agent.getInstance()).model.destroy({ where: { id } });
    }
    if (testHuman) await (await Human.getInstance()).model.destroy({ where: { id: testHuman.id } });
    if (testChat) await (await Chat.getInstance()).model.destroy({ where: { id: testChat.id } });
    if (testWebhook) await (await WebHook.getInstance()).model.destroy({ where: { id: testWebhook.id } });
});

test("DB instance should be valid", async () => {
    expect(dbInstance).toBeDefined();
    expect(dbInstance.Agent).toBeDefined();
    expect(dbInstance.Message).toBeDefined();
    expect(dbInstance.Human).toBeDefined();
    expect(dbInstance.Chat).toBeDefined();
    expect(dbInstance.Tool).toBeDefined();
    expect(dbInstance.Http).toBeDefined();
    expect(dbInstance.WebHook).toBeDefined();
});

test("getAgentByChannel should return agent with webhooks", async () => {
    const agent = await dbInstance.getAgentByChannel(CHANNEL);
    expect(agent).toBeDefined();
    expect(agent.id).toBe(testAgent.id);
    expect(agent.name).toBe(testAgent.name);
    expect(agent.channel).toBe(CHANNEL);
    expect(agent.config).toBeDefined();
    expect(agent.llm_engine).toBeDefined();
    expect(agent.Webhooks).toBeDefined();
    expect(Array.isArray(agent.Webhooks)).toBe(true);
    expect(agent.Webhooks.length).toBe(1);
    expect(agent.Webhooks[0].id).toBe(testWebhook.id);
});

test("getAgentByChannel should return agent with empty webhooks array when no webhooks exist", async () => {
    const agent = await dbInstance.getAgentByChannel(CHANNEL_WITHOUT_WEBHOOK);
    expect(agent).toBeDefined();
    expect(agent.id).toBe(testAgentWithoutWebhook.id);
    expect(agent.name).toBe(testAgentWithoutWebhook.name);
    expect(agent.channel).toBe(CHANNEL_WITHOUT_WEBHOOK);
    expect(agent.config).toBeDefined();
    expect(agent.llm_engine).toBeDefined();
    expect(agent.Webhooks).toBeDefined();
    expect(Array.isArray(agent.Webhooks)).toBe(true);
    expect(agent.Webhooks.length).toBe(0);
});

test("getAgentDefault should return default agent", async () => {
    const defaultAgent = await dbInstance.getAgentDefault();
    expect(defaultAgent).toBeDefined();
    expect(defaultAgent.channel).toBe("default");
    expect(defaultAgent.config).toBeDefined();
    expect(defaultAgent.llm_engine).toBeDefined();
});

test("getAgentById should return correct agent", async () => {
    const agent = await dbInstance.getAgentById(testAgent.id);
    expect(agent).toBeDefined();
    expect(agent.id).toBe(testAgent.id);
    expect(agent.name).toBe(testAgent.name);
    expect(agent.config).toBeDefined();
    expect(agent.llm_engine).toBeDefined();
});

test("pushAnswer should create a message with answer data", async () => {
    const answer = {
        output: {
            text: "Test answer",
            llm_messages: [{ role: "assistant", content: "Test message" }]
        }
    };

    const result = await dbInstance.pushAnswer(answer, testChat.id, testAgent.id, CHANNEL);
    expect(result).toBeDefined();
    expect(result.texts).toContain("Test answer");
    expect(result.llm_messages).toHaveLength(1);
    expect(result._agent).toBe(testAgent.id);
    expect(result._chat).toBe(testChat.id);
});

test("pushMessage should create a message with human data", async () => {
    const message = {
        texts: ["Hello, world!"]
    };
    const context = {
        channel: CHANNEL,
        chat_external_id: testChat.external_id,
        human_external_id: testHuman.external_id
    };

    const result = await dbInstance.pushMessage(message, context);
    expect(result).toBeDefined();
    expect(result.texts).toContain("Hello, world!");
    expect(result._chat).toBe(testChat.id);
    expect(result._human).toBe(testHuman.id);
});

test("pushMessage should create a message with agent data", async () => {
    const message = {
        texts: ["Agent response"]
    };
    const context = {
        channel: CHANNEL,
        chat_external_id: testChat.external_id,
        agent_id: testAgent.id
    };

    const result = await dbInstance.pushMessage(message, context);
    expect(result).toBeDefined();
    expect(result.texts).toContain("Agent response");
    expect(result._chat).toBe(testChat.id);
    expect(result._agent).toBe(testAgent.id);
});

test("getHistoryByExternalId should return chat history", async () => {
    // First, create some messages
    await dbInstance.pushMessage(
        { texts: ["User message 1"] },
        { channel: CHANNEL, chat_external_id: testChat.external_id, human_external_id: testHuman.external_id }
    );
    await dbInstance.pushMessage(
        { texts: ["Agent message 1"] },
        { channel: CHANNEL, chat_external_id: testChat.external_id, agent_id: testAgent.id }
    );

    const history = await dbInstance.getHistoryByExternalId(testChat.external_id, CHANNEL);
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(2);
    
    // Verify messages are in correct order
    const lastTwoMessages = history.slice(-2);
    expect(lastTwoMessages[0].texts).toContain("User message 1");
    expect(lastTwoMessages[1].texts).toContain("Agent message 1");
});

test("getAllAgents should return all agents without api keys", async () => {
    const agents = await dbInstance.getAllAgents();
    expect(Array.isArray(agents)).toBe(true);
    expect(agents.length).toBeGreaterThan(0);
    
    const testAgentInList = agents.find(a => a.id === testAgent.id);
    expect(testAgentInList).toBeDefined();
    expect(testAgentInList.llm_engine.api_key).toBeUndefined();
});

test("addAgent should create a new agent", async () => {
    const newAgentData = {
        name: `new-test-agent-${uuidv4()}`,
        prompt: "New test prompt",
        channel: uuidv4(),
        llm_engine: {
            model: "gpt-4",
            provider: "openai",
            max_tokens: 500,
            temperature: 0.7,
            api_key: "new-test-key"
        }
    };

    const newAgent = await dbInstance.addAgent(newAgentData);
    expect(newAgent).toBeDefined();
    expect(newAgent.name).toBe(newAgentData.name);
    expect(newAgent.config.prompt).toBe(newAgentData.prompt);
    expect(newAgent.channel).toBe(newAgentData.channel);
    expect(newAgent.llm_engine).toEqual(newAgentData.llm_engine);

    // Add to cleanup list instead of immediate cleanup
    resourcesToClean.add(newAgent.id);
});

test("addTool should create a new tool", async () => {
    const toolData = {
        name: "test-tool",
        description: "A test tool",
        parameters: { type: "object", properties: {} },
        mode: "sync",
        agent_id: testAgent.id
    };

    const httpData = {
        method: "GET",
        url: "https://api.test.com",
        timeout: 5000
    };

    const newTool = await dbInstance.addTool(toolData, httpData);
    expect(newTool).toBeDefined();
    expect(newTool.name).toBe(toolData.name);
    expect(newTool.description).toBe(toolData.description);
    expect(newTool._agent).toBe(testAgent.id);
    expect(newTool._http).toBeDefined();
});

test("addWebhook should create a new webhook", async () => {
    const webhookData = {
        agent_id: testAgent.id,
        method: "POST",
        url: "https://webhook.test.com",
        body: JSON.stringify({ test: true }),
        headers: JSON.stringify({ "X-Test": "true" }),
        event_listener: { answer: true }
    };

    const newWebhook = await dbInstance.addWebhook(webhookData);
    expect(newWebhook).toBeDefined();
    expect(newWebhook.method).toBe(webhookData.method);
    expect(newWebhook.url).toBe(webhookData.url);
    expect(newWebhook._agent).toBe(testAgent.id);

    // Cleanup
    await (await WebHook.getInstance()).model.destroy({ where: { id: newWebhook.id } });
});

test("getToolsFromAgent should return agent's tools", async () => {
    // First create a tool
    const toolData = {
        name: "test-tool-2",
        description: "Another test tool",
        parameters: { type: "object", properties: {} },
        mode: "sync",
        agent_id: testAgent.id
    };

    await dbInstance.addTool(toolData, null);

    const tools = await dbInstance.getToolsFromAgent(testAgent.id);
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    
    const testTool = tools.find(t => t.name === toolData.name);
    expect(testTool).toBeDefined();
    expect(testTool.description).toBe(toolData.description);
});

test("getWebHookFromAgent should return empty array for agent without webhooks", async () => {
    const webhooks = await dbInstance.getWebHookFromAgent(testAgentWithoutWebhook.id);
    expect(Array.isArray(webhooks)).toBe(true);
    expect(webhooks.length).toBe(0);
});

test("getWebHookFromAgent should return agent's webhooks when they exist", async () => {
    const webhooks = await dbInstance.getWebHookFromAgent(testAgent.id);
    expect(Array.isArray(webhooks)).toBe(true);
    expect(webhooks.length).toBeGreaterThan(0);
    
    const testWebhookInList = webhooks.find(w => w.id === testWebhook.id);
    expect(testWebhookInList).toBeDefined();
    expect(testWebhookInList.url).toBe(testWebhook.url);
    expect(testWebhookInList.method).toBe(testWebhook.method);
}); 