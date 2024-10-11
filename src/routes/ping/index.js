import ROUTE from '../../models/classes/route'
import { RedisHelper } from '../../helpers'

class PING extends ROUTE {
    constructor(props){
        super(props)
    }
    run(){
        super.run((route)=>{
            route.get("/", async (c)=>{
                    await RedisHelper.set("Test Key", "Test Value")
                    const testResponse = await RedisHelper.get("Test Key")
                    console.log(testResponse)
                    return c.text("PONG")
                })
        })
    }
}
export default PING