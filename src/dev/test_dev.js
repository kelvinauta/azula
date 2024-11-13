import Channel from "../Services/Agent/controllers/channel";
import { faker } from '@faker-js/faker';

const generateFakeData = (count) => {
    const fakeData = [];
    for(let i = 0; i < count; i++) {
        fakeData.push({
            human: {
                external_id: "+526141234567"
            },
            chat: {
                external_id: "whatsapp_123",
            },
            message: {
                texts: [faker.lorem.sentence()]
            }
        });
    }
    return fakeData;
};

const test_dev = async () => {
    const channel = new Channel();
    const fakeDataCount = 15;
    const fakeRecords = generateFakeData(fakeDataCount);
    
    for(const fakeData of fakeRecords) {
        const result = await channel.sender_human(fakeData);
        // console.log('Created fake record:', result);
    }
}

export default test_dev
