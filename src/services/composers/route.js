const {Hono} = require('hono')
import { logger } from 'hono/logger'
import LOGGER from "tuki_logger"
import Rules from "tuki_rules"

class ROUTE {
    constructor(app, title) {
        this.title = title
        this.app = app
        this.path = null
        this.logger = null
        this.route = null
        this.rules = new Rules("ROUTE").build()
    }

    build() {
        
        this._config_route()
        this._create_route()

        const rules = this.rules(".build")
        this._validate_route(".build")
        rules(
            ['Route is not defined', !this.route]
        )
        this.logger.success(`${this.title} Route Build`)
        return this
    }

    publish() {
        const rules = this.rules(".publish")
        this._validate_route(".publish")
        rules(
            ['Route is not defined', !this.route]
        )
        this.app.route(this.path, this.route)
        this.logger.success(`${this.title} Route Published`)
        return this
    }

    run(callback) {
        const rules = this.rules(".run")
        rules(
            ['Callback must be a function', typeof callback !== 'function' && callback !== undefined]
        )
        this.build()
       
        if(callback) {
            callback(this.route)
        } else {
            this.route.get("/", (c) => {
                return c.text(this.title)
            })
        }
        
        this.publish()
        return this
    }

    set_app(app) {
        const rules = this.rules(".set_app")
        rules(
            ['App must be defined', !app]
        )
        this.app = app
        return this
    }

    set_title(title) {
        const rules = this.rules(".set_title")
        rules(
            ['Title must be a non-empty string', typeof title !== 'string' || title.trim() === '']
        )
        this.title = title
        this.logger = new LOGGER({
            title: `Route ${this.title} Logger`,
            save: true
        })
        return this
    }

    set_logger(logger) {
        const rules =   this.rules(".set_logger")
        rules(
            ['Logger must be defined', !logger]
        )
        this.logger = logger
        return this
    }

    set_path(path) {
        const rules = this.rules(".set_path")
        rules(
            ['Path must be a non-empty string', typeof path !== 'string' || path.trim() === '']
        )
        this.path = path
        return this
    }
  
    _config_route() {
        this.set_path(`/${this.title}`)
        return this
    }

    _validate_route(context) {
        const rules = this.rules(context ||".validate_route")
        rules(
            ['Title must be a non-empty string', typeof this.title !== 'string' || this.title.trim() === ''],
            ['Path must be a non-empty string', typeof this.path !== 'string' || this.path.trim() === ''],
            ['App must be defined', !this.app],
            ['Logger must be defined', !this.logger]
        )
        
    }

    _create_route() {

        this._validate_route(".create_route")
        const route = new Hono()
        route.use("*", logger((message, ...rest) => {
            this.logger.info(message, ...rest)
        }))
        this.route = route
        return this
    }
}

export default ROUTE