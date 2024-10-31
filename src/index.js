import { Hono } from 'hono'
import { logger } from 'hono/logger'
import LOGGER from "tuki_logger"

// ROUTES
import PING from './routes/ping'
import WORKSPACE from './routes/workspace'
import USER from './routes/user'
import CHAT from './routes/chat'
import MESSAGE from './routes/message'
import ASSISTANT from './routes/assistant'

class ROUTER {
  constructor(){
    this.routes ={}
    this.app = new Hono()

    this.routes_classes = {
      ping: PING,
      workspace: WORKSPACE,
      user: USER,
      chat: CHAT,
      message: MESSAGE,
      assistant: ASSISTANT
    }
    this.logger = new LOGGER({
      title: "Main Router Logger",
      save: true
    })
  }
  _init_routes(){
    this.logger.info("Initializing Routers")
    for (const key in this.routes_classes){
      this.routes[key] = new this.routes_classes[key]()
      this.routes[key].set_app(this.app)
      this.routes[key].set_title(key)   
    }
  }
  _run_routes(){
    this.logger.info("Running Routers")
    for (const key in this.routes){
      this.routes[key].run()
      this.logger.info(`Run ${key} Router`)
    }
  }
  run(){
    this._init_routes()
    this._run_routes()
    console.log("Server is running on port 3000")
  }
  
}

const router = new ROUTER()
router.run()
const app = router.app

export default app
