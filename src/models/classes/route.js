const {Hono} = require('hono')
import { logger } from 'hono/logger'
import LOGGER from "tuki_logger"

class ROUTE {
    constructor(app, title){
        this.title = title
        this.app = app
        this.path = null
        this.logger = null
        this.route = null
    }
    build(){
        this._config_route()
        this._create_route()
        if(this._validate_route() && this.route) this.logger.success(`${this.title} Route Build`)
        return this
    }
    publish(){
        if (!this._validate_route()) throw new Error("Error: Route configuration is not valid");
        if (!this.route) throw new Error("Error: Route is not defined");
        this.app.route(this.path, this.route)
        this.logger.success(`${this.title} Route Published`)
        return this
    }
    run(callback){
        if (!callback) this.logger.warn(`Route ${this.title} has no callback`);          
        this.build()
       
        if(callback) callback(this.route)
            else this.route.get("/", (c)=>{
                return c.text(this.title)
            });
        
        this.publish()
        return this
    }

    set_app(app){
        this.app = app
        return this
    }
    set_title(title){
        this.title = title
        this.logger = new LOGGER({
            title: `Route ${this.title} Logger`,
            save: true,
            print_end: false
        })
        return this
    }
    set_logger(logger){
        this.logger = logger
        return this
    }
    set_path(path){
        this.path = path
        return this
    }
  
    _config_route(){
        this.set_path(path)
        return this
    }

    _validate_route(){
        if (!this.title){
            this.logger.error("Error: Route title is not defined")
            return false
        }
        if (!this.path){
            this.logger.error("Error: Route path is not defined")
            return false
        }
        if (!this.app){
            this.logger.error("Error: Route app is not defined")
            return false
        }
        if (!this.logger){
            this.logger.error("Error: Route logger is not defined")
            return false
        }
        return true
    }
    _config_route(){
        if (!this.title) throw new Error("Error: Route title is needed to configure route");
        this.set_path(`/${this.title}`)
        if(this._validate_route()) this.logger.success(`Route ${this.title} Configured`)
        return this
    }
    _create_route(){
        if (!this._validate_route()) throw new Error(`Error: Route ${this.title} is not valid`);
        const route = new Hono()
        route.use("*", logger((message, ...rest)=>{
            this.logger.info(message, ...rest)
        }))
        this.route = route
        return this
    }
}

export default ROUTE