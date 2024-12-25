import { test, beforeAll, expect } from "bun:test";
import { v4 as uuidv4 } from "uuid";
import Builder from "../../Facades/builder";
import Provider from "../../Facades/db/Channel/db/provider";
import AgentFactory from "../../Facades/db/Channel/db/factory/AgentFactory";
import Agent from "../../Facades/db/Channel/db/tables/Agents";
import Human from "../../Facades/db/Channel/db/tables/Humans";
import Chat from "../../Facades/db/Channel/db/tables/Chats";
import Message from "../../Facades/db/Channel/db/tables/Messages";
let testAgent;
let testHuman;
let testChat;
let builderInstance;
let testData;
beforeAll(async () => {
    await Provider.build();
    const agentInstance = await Agent.getInstance();
    const factory = new AgentFactory(agentInstance);
    testAgent = await factory.simple({
        name: `test-agent-${uuidv4()}`,
        description: "Agente de prueba",
        config: {
            prompt: "Prompt de prueba",
        },
        llm_engine: {
            model: "gpt-3.5-turbo",
            provider: "openai",
            max_tokens: 256,
            temperature: 1,
            api_key: process.env.OPENAI_API_KEY
        },
        channel: uuidv4(),
    });
    const humanInstance = await Human.getInstance();
    testHuman = await humanInstance.model.create({
        external_id: uuidv4(),
    });
    const chatInstance = await Chat.getInstance();
    testChat = await chatInstance.model.create({
        external_id: uuidv4(),
        channel: testAgent.channel,
    });
    const messageInstance = await Message.getInstance();
    await messageInstance.model.create({
        texts: ["Hola, ¿cómo estás?"],
        _human: testHuman.id,
        _chat: testChat.id,
    });
    await messageInstance.model.create({
        texts: ["¡Hola! Estoy bien, ¿en qué puedo ayudarte?"],
        _agent: testAgent.id,
        _chat: testChat.id,
    });
    testData = {
        context: {
            chat: testChat.external_id,
            human: testHuman.external_id,
            channel: testAgent.channel,
            metadata: {
                name: "Usuario Test",
                phone: "123456789",
                profile_url: "https://test.com/profile",
            },
        },
        message: {
            texts: ["Necesito ayuda con un problema"],
        },
    };
    builderInstance = new Builder(testData);
});
test("Builder.run() debe procesar el mensaje y crear un nuevo registro", async () => {
    const answer = await builderInstance.run();
    await builderInstance.saveAnswer(answer)
    const messageInstance = await Message.getInstance();
    const lastMessage = await messageInstance.model.findOne({
        where: {
            _chat: testChat.id,
            _human: testHuman.id,
        },
        order: [['createdAt', 'DESC']],
    });
    expect(lastMessage).toBeDefined();
    expect(lastMessage.texts).toEqual(testData.message.texts);
});


test("Builder.saveAnswer() debe guardar la respuesta del agente en la base de datos", async () => {
    const answer = await builderInstance.run();
    await builderInstance.saveAnswer(answer);
    
    const messageInstance = await Message.getInstance();
    const lastAgentMessage = ( await messageInstance.model.findOne({
        where: {
            _chat: testChat.id,
            _agent: testAgent.id,
        },
        order: [['createdAt', 'DESC']],
    }) ).dataValues

    expect(lastAgentMessage).toBeDefined();
    expect(lastAgentMessage._agent).toEqual(testAgent.id);
    expect(lastAgentMessage._chat).toEqual(testChat.id);
    expect(typeof lastAgentMessage.texts[0]).toBe('string');
});
