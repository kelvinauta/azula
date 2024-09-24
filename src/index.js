import { Hono } from 'hono'
import { logger } from 'hono/logger'
import LOGGER from "tuki_logger"

// ROUTES
import ping from './routes/ping'

const customLogger = (message, ...rest) => {
  const logger_master = new LOGGER({
    title: "Master Logger",
    save: true,
    print_end: false,
  })
  const log = logger_master
  log.info(message, ...rest)  
}

const app = new Hono()

app.use("*", logger(customLogger))
app.route('/ping', ping)

export default app
