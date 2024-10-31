import ROUTE from '../../services/composers/route'
import OpenAI from '../../services/aopenai'
class CHAT extends ROUTE {
    constructor(props){
        super(props)
        this.llm_engine = new OpenAI()
    }
    run(){
        super.run((route)=>{
            route.get("/", async (c)=>{
                const info = this.llm_engine.check()
                return c.json(info)
            })
        })
    }
}

export default CHAT