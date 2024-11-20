import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import Logger from "tuki_logger";

class Agent {
    static #logger = new Logger({ title: "Agent" });
    static async set_data(postgres, count = 5) {
        Agent.#logger.status("Creando agentes");
        const agents = [];
        for (let i = 0; i < count; i++) {
            agents.push({
                id: uuidv4(),
                name: faker.company.name(),
                description: faker.company.catchPhrase(),
                config: {
                    model: faker.helpers.arrayElement([
                        "gpt-4",
                        "gpt-3.5-turbo",
                        "claude-2",
                    ]),
                    temperature: faker.number.float({ min: 0, max: 1 }),
                    settings: {
                        max_tokens: faker.number.int({ min: 100, max: 2000 }),
                        context_length: faker.number.int({
                            min: 1000,
                            max: 8000,
                        }),
                    },
                },
            });
        }
        const result = await postgres.models.Agents.bulkCreate(agents);

        Agent.#logger.end(`${result.length} agentes creados`, "success");
        return result;
    }
}

class Prompt {
    static #logger = new Logger({ title: "Prompt" });
    static async set_data(postgres, count = 10) {
        Prompt.#logger.status("Creando prompts");
        const prompts = [];
        for (let i = 0; i < count; i++) {
            prompts.push({
                id: uuidv4(),
                title: faker.lorem.sentence(),
                prompt: faker.lorem.paragraphs(),
                config: {
                    type: faker.helpers.arrayElement([
                        "system",
                        "user",
                        "assistant",
                    ]),
                    parameters: {
                        required: faker.datatype.boolean(),
                        variables: faker.number.int({ min: 1, max: 5 }),
                    },
                },
            });
        }
        const result = await postgres.models.Prompts.bulkCreate(prompts);
        Prompt.#logger.end(`${result.length} prompts creados`, "success");
        return result;
    }
}

class Bulk {
    static #logger = new Logger({ title: "Bulk" });
    static async set_data(postgres, count = 8) {
        Bulk.#logger.status("Creando bulks");
        
        const bulks = [];
        for (let i = 0; i < count; i++) {
            bulks.push({
                id: uuidv4(),
                external_id: uuidv4(),
                config: {
                    source: faker.system.fileName(),
                    type: faker.helpers.arrayElement(["pdf", "txt", "doc"]),
                    size: faker.number.int({ min: 1000, max: 10000000 }),
                },:
            });
        }
        const result = await postgres.models.Bulks.bulkCreate(bulks);
        Bulk.#logger.end(`${result.length} bulks creados`, "success");
        return result;
    }
}

class Tool {
    static #logger = new Logger({ title: "Tool" });
    static async set_data(postgres, count = 6) {
        Tool.#logger.status("Creando tools");
        const tools = [];
        for (let i = 0; i < count; i++) {
            tools.push({
                id: uuidv4(),
                external_id: uuidv4(),
                config: {
                    name: faker.helpers.arrayElement([
                        "calculator",
                        "translator",
                        "search",
                        "weather",
                    ]),
                    version: faker.system.semver(),
                    api_key: faker.string.uuid(),
                },
            });
        }
        const result = await postgres.models.Tools.bulkCreate(tools);
        Tool.#logger.end(`${result.length} tools creados`, "success");
        return result;
    }
}

class Chat {
    static #logger = new Logger({ title: "Chat" });
    static async set_data(postgres, count = 15) {
        Chat.#logger.status("Creando chats");
        const chats = [];
        for (let i = 0; i < count; i++) {
            chats.push({
                id: uuidv4(),
                origin: faker.helpers.arrayElement(["web", "whatsapp", "api"]),
                last_interaction: faker.date.recent(),
            });
        }
        const result = await postgres.models.Chats.bulkCreate(chats);
        Chat.#logger.end(`${result.length} chats creados`, "success");
        return result;
    }
}

class Human {
    static #logger = new Logger({ title: "Human" });
    static async set_data(postgres, count = 10) {
        Human.#logger.status("Creando humans");
        const humans = [];
        for (let i = 0; i < count; i++) {
            humans.push({
                id: uuidv4(),
                type: faker.helpers.arrayElement([
                    "external_user",
                    "internal_user",
                ]),
                info: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    location: faker.location.country(),
                },
            });
        }
        const result = await postgres.models.Humans.bulkCreate(humans);
        Human.#logger.end(`${result.length} humans creados`, "success");
        return result;
    }
}

class Message {
    static #logger = new Logger({ title: "Message" });
    static async set_data(postgres, count = 20) {
        Message.#logger.status("Creando messages");
        const messages = [];
        const chats = await postgres.models.Chats.findAll();
        const humans = await postgres.models.Humans.findAll();
        const agents = await postgres.models.Agents.findAll();

        for (let i = 0; i < count; i++) {
            messages.push({
                id: uuidv4(),
                type: faker.helpers.arrayElement(["text", "image", "file"]),
                text: [faker.lorem.paragraph()],
                files: faker.datatype.boolean()
                    ? { url: faker.internet.url() }
                    : null,
                _chat: faker.helpers.arrayElement(chats).id,
                _human: faker.helpers.arrayElement(humans).id,
                _agent: faker.helpers.arrayElement(agents).id,
            });
        }
        const result = await postgres.models.Messages.bulkCreate(messages);
        Message.#logger.end(`${result.length} messages creados`, "success");
        return result;
    }
}

class Thread {
    static #logger = new Logger({ title: "Thread" });
    static async set_data(postgres, count = 12) {
        Thread.#logger.status("Creando threads");
        const threads = [];
        const messages = await postgres.models.Messages.findAll();

        for (let i = 0; i < count; i++) {
            const inputMessage = faker.helpers.arrayElement(messages);
            const outputMessage = faker.helpers.arrayElement(messages);

            threads.push({
                id: uuidv4(),
                tokens: faker.number.int({ min: 100, max: 4000 }),
                duration_ms: faker.number.int({ min: 500, max: 15000 }),
                logs: {
                    start_time: faker.date.recent(),
                    end_time: faker.date.recent(),
                    status: faker.helpers.arrayElement([
                        "success",
                        "error",
                        "timeout",
                    ]),
                },
                _input_message: inputMessage.id,
                _output_message: outputMessage.id,
                raw_agents_used: [{ id: uuidv4(), name: faker.company.name() }],
                raw_request: { prompt: faker.lorem.paragraph() },
                raw_response: { completion: faker.lorem.paragraphs() },
            });
        }
        const result = await postgres.models.Threads.bulkCreate(threads);
        Thread.#logger.end(`${result.length} threads creados`, "success");
        return result;
    }
}

class DbDev {
    static #logger = new Logger({ title: "DbDev" });
    static async populate(postgres) {
        DbDev.#logger.status("Iniciando población de base de datos");
        try {
            await postgres.sync({ alter: true });

            // Crear datos en orden para mantener las relaciones
            await Agent.set_data(postgres);
            await Prompt.set_data(postgres);
            await Bulk.set_data(postgres);
            await Tool.set_data(postgres);
            await Chat.set_data(postgres);
            await Human.set_data(postgres);
            await Message.set_data(postgres);
            await Thread.set_data(postgres);

            DbDev.#logger.end("Base de datos poblada exitosamente", "success");
            return true;
        } catch (error) {
            DbDev.#logger.error(error);
            DbDev.#logger.end("Error al poblar la base de datos", "error");
            return false;
        }
    }
}

export default DbDev;
