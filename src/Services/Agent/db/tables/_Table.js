import Postgres from "../postgres";
import { DataTypes, Model } from "sequelize";
import {assert, enums, define, object, string, number, array} from "superstruct";
import isUuid from "is-uuid";
class _Table {
    static instance = null;
    static is_synced = false;
    static db = null;

    

    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
    };
    static options = {
        paranoid: true,
    };
    static schema = {
        id: define("id", (value) => isUuid(value)),
    };

    static async getInstance(params){
        if(this.name === _Table.name) throw new Error("Table cannot be instantiated");  
        if(this.instance) return this.instance;
        await this.db_connected();
        const instance = new this(params);
        this.instance = instance;
        return instance;
    }
    static async db_connected(){
        
        let db;
        if(_Table.db && _Table.db instanceof Postgres) db = _Table.db;
        else{
            db = Postgres.getInstance();
            await db.connect();
            _Table.db = db;
        }
        this.db = db;
    }
    constructor(params) {
        if (!this.constructor.db ) throw new Error("Db is required");
        this.#validate_db();
        if(this.constructor.instance) return this.constructor.instance;
        if (params) {
            if(typeof params !== "object") throw new Error("Params must be an object");
            const params_schema = object({
                name: string(),
                attributes: object(),
                options: object(),
            });
            assert(params, params_schema);
        }

        // logic
        this.db = this.constructor.db;
        this.params = params || {
            name: this.constructor.name,
            attributes: this.constructor.attributes,
            options: this.constructor.options,
        };

        this.sequelize = this.db.sequelize;
        this.foreign_key_name = `_${this.params.name.toLowerCase()}`;

        this.model = this.sequelize.define(
            this.params.name,
            this.params.attributes,
            this.params.options
        );
    }
    get_name(){
        return this.params.name;
    }

    async sync() {
        this.#validate_db();
        this.constructor.is_synced = true;
        return await this.model.sync({ alter: true });
    }
    ref(ref_table, foreign_key_name) {
        // validate
        if (foreign_key_name && typeof foreign_key_name !== "string")
            throw new Error("foreign_key_name must be a string");
        if (!ref_table) throw new Error("ref_table is required");
        if (!(ref_table instanceof _Table))
            throw new Error("ref_table must be an instance of _Table");
        if (!Object.prototype.isPrototypeOf.call(Model, ref_table.model))
            throw new Error("ref_table.model must be a Model class");
        // * logic
        // Read many to one sequelize docs
        // has many or has one is the same bassically
        foreign_key_name = foreign_key_name || ref_table.foreign_key_name;
        this.#validate_table(ref_table);
        this.model.belongsTo(ref_table.model, {
            foreignKey: foreign_key_name,
        });
        ref_table.model.hasMany(this.model, {
            foreignKey: foreign_key_name,
        });
    }
    async many_to_many(ref_table) {
        // validate
        this.#validate_table(ref_table);
        if(this.model.tableName === ref_table.model.tableName) throw new Error("Table must be different from the current table");
        // logic
        const params = this.#build_many2many_params(this, ref_table);
        class RelationTable extends _Table {}
        const relation_table = await RelationTable.getInstance(params);
        this.model.belongsToMany(ref_table.model, {
            through: relation_table.model,
        });
        ref_table.model.belongsToMany(this.model, {
            through: relation_table.model,
        });
        return relation_table;
    }

    async touch_one(where_params) { // TODO: deberiamos usar findOrCreate de squealiza
        if (!where_params) throw new Error("Where params are required");
        if (typeof where_params !== "object")
            throw new Error("Where params must be an object");

        let row = await this.model.findOne({ where: where_params });
        if (!row) row = await this.model.create(where_params);
        return row;
    }
    // * Private methods
    #build_many2many_params(tableA, tableB) {
        if (!tableA || !tableB)
            throw new Error("TableA and TableB are required");
        this.#validate_table(tableA);
        this.#validate_table(tableB);
        return {
            name: `${tableA.constructor.name}${tableB.constructor.name}`,
            attributes: {
                [`${tableA.foreign_key_name}`]: {
                    type: DataTypes.UUID,
                    references: {
                        model: tableA.model,
                        key: "id",
                    },
                },
                [`${tableB.foreign_key_name}`]: {
                    type: DataTypes.UUID,
                    references: {
                        model: tableB.model,
                        key: "id",
                    },
                },
            },
            options: {},
        };
    }
    #validate_table(table) {
        if (table === this) return true;
        if (!table) throw new Error("Table is required");
        if (!(table instanceof _Table))
            throw new Error("Table must be an instance of _Table");
        if (!table.model) throw new Error("Table must be defined");
        if (table.constructor.name === this.constructor.name)
            throw new Error("Table must be different from the current table");
        return true;
    }
    #validate_db(){
        if (!this.constructor.db ) throw new Error("Db is required");
        if(!this.constructor.db instanceof Postgres) throw new Error("Db is not connected");
        if (!this.constructor.db.is_connected)
            throw new Error("Db.is_connected is false");
    }
}

export default _Table;
