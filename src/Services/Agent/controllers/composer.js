import Channel from './channel.js'
import Human from "../db/tables/Humans";
import Chat from "../db/tables/Chats.js"
import Agent from "../db/tables/Agents.js"
import { assert, mask, instance, define, object } from "superstruct";
class Composer{
    constructor(){

    }
    async validate(msg_received){
        assert(msg_received, Channel.schema)
        if(!(msg_received.sender instanceof (await Human.getInstance()).model)) throw new Error('msg_received mus be of the a Human')
    }
    async getData({
      sender,
      receiver,
      chat,
      message,
      
    }){
      const history_chat = await (await Chat.getInstance()).getHistoryChat(chat)
      const context_chat  = await (await Chat.getInstance()).getContextChat(chat)
      const config_agent = await (await Agent.getInstance()).getConfig(receiver.row)
      const human_info = await (await Human.getInstance()).getInfoHuman(sender.row)
      return {
        message,
        history_chat,
        context_chat,
        config_agent,
        human_info
      } 
    }
    async build(receiver_human){
      this.#validate(receiver_human);
      const data = await getData() 
    }
    request(){

    }
    #validate(){

    }
}

export default Composer
