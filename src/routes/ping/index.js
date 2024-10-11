import ROUTE from '../../models/classes/route'
class PING extends ROUTE {
    constructor(props){
        super(props)
    }
    run(){
        super.run((route)=>{
            route.get("/", (c)=>{
                    return c.text("PONG")
                })
        })
    }
}
export default PING