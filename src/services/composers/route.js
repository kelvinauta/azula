const {Hono} = require('hono')
import { logger } from 'hono/logger'
import LOGGER from "tuki_logger"
import Rules from "../../helpers/Rules.js"

class ROUTE {
    constructor(app, title) {
        this.title = title
        this.app = app
        this.path = null
        this.logger = null
        this.route = null
        this.rules = new Rules({
            strict: true,
            prefix: 'ROUTE:',
            concatPrefix: true
        }).build()
    }

    build() {
        this._config_route()
        this._create_route()
        this.rules(
            ['Route is not valid', !this._validate_route()],
            ['Route is not defined', !this.route]
        )
        this.logger.success(`${this.title} Route Build`)
        return this
    }

    publish() {
        this.rules(
            ['Route configuration is not valid', !this._validate_route()],
            ['Route is not defined', !this.route]
        )
        this.app.route(this.path, this.route)
        this.logger.success(`${this.title} Route Published`)
        return this
    }

    run(callback) {
        this.rules(['Callback must be a function', typeof callback !== 'function' && callback !== undefined])
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
        this.rules(['App must be defined', !app])
        this.app = app
        return this
    }

    set_title(title) {
        this.rules([
            'Title must be a non-empty string', typeof title !== 'string' || title.trim() === ''
        ])
        this.title = title
        this.logger = new LOGGER({
            title: `Route ${this.title} Logger`,
            save: true
        })
        return this
    }

    set_logger(logger) {
        this.rules(['Logger must be defined', !logger])
        this.logger = logger
        return this
    }

    set_path(path) {
        this.rules([
            'Path must be a non-empty string', typeof path !== 'string' || path.trim() === ''
        ])
        this.path = path
        return this
    }
  
    _config_route() {
        this.set_path(`/${this.title}`)
        return this
    }

    _validate_route() {
        const validation = this.rules(
            ['Title must be a non-empty string', typeof this.title !== 'string' || this.title.trim() === ''],
            ['Path must be a non-empty string', typeof this.path !== 'string' || this.path.trim() === ''],
            ['App must be defined', !this.app],
            ['Logger must be defined', !this.logger]
        )
        return validation.is
    }

    _create_route() {
        this.rules([
            'Route is not valid', !this._validate_route()
        ])
        const route = new Hono()
        route.use("*", logger((message, ...rest) => {
            this.logger.info(message, ...rest)
        }))
        this.route = route
        return this
    }
}

export default ROUTE