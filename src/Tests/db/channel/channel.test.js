import Channel from "../../../Facades/db/Chats/controllers/channel";
import Provider from "../../../Facades/db/Chats/db/provider";
import { faker } from "@faker-js/faker";
import { assert } from "superstruct";
import AgentFactory from "../../../Facades/db/Chats/db/factory/AgentFactory";
import Agent from "../../../Facades/db/Chats/db/tables/Agents";
describe("Channel", () => {
    let channel;
    let validData;

    beforeEach(async () => {
        await Provider.build();
        channel = new Channel();
        const agent = await Agent.getInstance();
        const factory = new AgentFactory(agent);
        const createdAgent = await factory.simple({
            name: faker.string.alphanumeric(10),
            config: {
                prompt: faker.lorem.sentence(),
                model: "gpt-3.5-turbo",
            },
        });
        validData = {
            human: {
                external_id: faker.phone.number("+5261########"),
                type: "external",
                info: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                },
            },
            agent: {
                id: createdAgent.id,
            },
            chat: {
                external_id: `whatsapp_${faker.string.alphanumeric(10)}`,
                origin: "whatsapp",
            },
            message: {
                texts: [faker.lorem.sentence()],
                type: "received",
            },
        };
    });
    describe("constructor", () => {
        it("should create a Channel instance", () => {
            expect(channel).toBeInstanceOf(Channel);
            expect(channel.init_tables).toBeFalsy();
        });
    });

    describe("sender_human input validation", () => {
        it("should fail if human is missing", async () => {
            const { human, ...dataWithoutHuman } = validData;
            await expect(
                channel.sender_human(dataWithoutHuman),
            ).rejects.toThrow();
        });

        it("should fail if chat is missing", async () => {
            const { chat, ...dataWithoutChat } = validData;
            await expect(
                channel.sender_human(dataWithoutChat),
            ).rejects.toThrow();
        });

        it("should fail if message is missing", async () => {
            const { message, ...dataWithoutMessage } = validData;
            await expect(
                channel.sender_human(dataWithoutMessage),
            ).rejects.toThrow();
        });
    });

    describe("sender_human property validation", () => {
        describe("human validation", () => {
            it("should fail with invalid human external_id", async () => {
                const invalidData = { ...validData };
                invalidData.human.external_id = null;
                await expect(
                    channel.sender_human(invalidData),
                ).rejects.toThrow();
            });
        });

        describe("chat validation", () => {
            it("should fail with invalid chat external_id", async () => {
                const invalidData = { ...validData };
                invalidData.chat.external_id = null;
                await expect(
                    channel.sender_human(invalidData),
                ).rejects.toThrow();
            });
        });

        describe("message validation", () => {
            it("should fail with invalid message texts", async () => {
                const invalidData = { ...validData };
                invalidData.message.texts = "not_an_array";
                await expect(
                    channel.sender_human(invalidData),
                ).rejects.toThrow();
            });
        });
    });

    describe("sender_human return value validation", () => {
        let result;

        beforeEach(async () => {
            result = await channel.sender_human(validData);
        });

        it("should return valid sender (Human.row) instance", () => {
            expect(result.sender).toBeDefined();
            expect(result.sender.external_id).toBe(validData.human.external_id);
            expect(result.sender.type).toBe(validData.human.type);
        });
        it("should return valid receiver (Agent.row) instance", () => {
            expect(result.receiver).toBeDefined();
            expect(result.receiver.external_id).toBe(validData.agent.external_id);
            expect(result.receiver.type).toBe(validData.agent.type);
        });
        it("should return valid chat instance", () => {
            expect(result.chat_row).toBeDefined();
            expect(result.chat_row.external_id).toBe(validData.chat.external_id);
            expect(result.chat_row.origin).toBe(validData.chat.origin);
        });

        it("should return valid message instance", () => {
            expect(result.message_row).toBeDefined();
            expect(result.message_row.texts).toEqual(validData.message.texts);
            expect(result.message_row.type).toBe(validData.message.type);
        });

        it("should comply with Channel schema", () => {
            expect(() => assert(result, Channel.schema)).not.toThrow();
        });
    });
});
