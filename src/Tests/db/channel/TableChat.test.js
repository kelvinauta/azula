import Chats from "../../../Facades/db/Chats/db/tables/Chats";
import Messages from "../../../Facades/db/Chats/db/tables/Messages";
import Channel from "../../../Facades/db/Chats/controllers/channel";
import Provider from "../../../Facades/db/Chats/db/provider";
import { v4 as uuidv4 } from "uuid"
describe("Chats Table Test", () => {
    describe(".getHistoryChat", async () => {
        await Provider.build();
        const chat = await Chats.getInstance();
        const messages = await Messages.getInstance()
        test(".getHistoryChat must a error if invlid data", async () => {
            expect(async () => {
                await chat.getHistoryChat();
            }).toThrow();
            expect(async () => {
                await chat.getHistoryChat({});
            }).toThrow();
            expect(async () => {
                await chat.getHistoryChat({
                    messages: [
                        "invalid",
                        "data"
                    ]
                });
            }).toThrow();
        });
        test(".getHistory not Error if Data is correct", async () => {
            expect(async () => {
                await chat.getHistoryChat({
                    id: "59741650-392c-4863-a5f4-7c20ea333f9d",
                    external_id: "whatsapp_7777777",
                    origin: "whatsapp"
                })
            }).not.toThrow()

        })

        test(".getHistoryChat every message must be a instance of Messsage", async () => {
            const all_messages = await chat.getHistoryChat({
                id: "59741650-392c-4863-a5f4-7c20ea333f9d",
                external_id: "whatsapp_7777777",
                origin: "whatsapp"
            })
            for (const msg of all_messages) {
                expect(msg).toBeInstanceOf(messages.model)
            }

        })

    });
});
