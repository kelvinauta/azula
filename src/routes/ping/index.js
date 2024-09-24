const {Hono} = require('hono')
import { logger } from 'hono/logger'
import LOGGER from "tuki_logger"
const pingLogger = (message, ...rest) => {
    const ping_logger = new LOGGER({
      title: "Ping Router Logger",
      save: true,
      print_end: false,
      prefix: "Ping Router: "
    })
    const log = ping_logger
    log.info(message, ...rest)  
}

const ping = new Hono()
ping.use("*", logger(pingLogger))
ping.get('/', (c) => {
  return c.text('Pong')
})
ping.post('/', (c) => {
  return c.text('Pong')
})

export default ping