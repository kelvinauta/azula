import Postgres from "../postgres";
import { DataTypes, Model } from "sequelize";
import superstruct from "superstruct";
import isUuid from "is-uuid";
class _Table {
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
    static relations = [];
    static schema = {
        id: superstruct.define("id", (value) => isUuid(value)),
    };
    static async sync_relations() {
        if (!_Table.relations) return true;
        for (const relation of _Table.relations) {
            _Table.#validate_relation(relation);
            await relation.sync({ force: true });
        }
        return true;
    }

    static #validate_relation(relation) {
        if (!_Table.relations) return true;
        if (!Object.prototype.isPrototypeOf.call(Model, relation))
            throw new Error("Relation must be a Model class");
        return true;
    }

    constructor(db, params) {
        // validate
        // console.log(db);
        if (!db) throw new Error("Db is required");
        if (!(db instanceof Postgres))
            throw new Error("Db must be an instance of Postgres");
        if (!db.constructor.is_connected)
            throw new Error("Db is not connected");
        if (params && typeof params === "object") {
            const params_schema = superstruct.object({
                name: superstruct.string(),
                attributes: superstruct.object(),
                options: superstruct.object(),
            });
            superstruct.assert(params, params_schema);
        }

        // logic
        this.db = db;
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

    sync() {
        return this.model.sync({ force: true });
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
    many_to_many(ref_table) {
        // Read many to many sequelize docs

        this.#validate_table(ref_table);
        const params = this.#build_many2many_params(this, ref_table);
        const relation_table = new _Table(this.db, params);
        this.model.belongsToMany(ref_table.model, {
            through: relation_table.model,
        });
        ref_table.model.belongsToMany(this.model, {
            through: relation_table,
        });
        _Table.relations.push(relation_table);
        return relation_table;
    }

    async touch_one(where_params) {
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
}

export default _Table;
