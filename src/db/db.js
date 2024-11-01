import Rules from "tuki_rules"
import Logger from "tuki_logger"

import Postgres from "./postgres"
import DB_CONFIG from "../configs/db_config"
import schema from "./schema"

// Clase base abstracta
class _DB {
    init_schema(){
        throw new Error("Method 'init_schema()' must be implemented.")
    }
    
    validate_schema(){
        throw new Error("Method 'validate_schema()' must be implemented.") 
    }
}

// Clase principal de base de datos
class DB extends _DB {
    constructor() {
        super()
        this.postgres = new Postgres()
        this.rules = new Rules("DB").build()
        this.logger = new Logger({title: "DB"})
    }

    // Métodos públicos
    async read_schema(){
        // validate
        const rules = this.rules(".read_schema")
        const sql = await this.postgres.get_sql()
        rules(
            ["SQL debe estar inicializado", !sql]
        )

        // logic
        const logger = this.logger
        logger.info("Leyendo esquema actual de la base de datos")

        // Obtener todas las tablas
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `

        // Para cada tabla, obtener sus columnas
        for (const table of tables) {
            const tableName = table.table_name
            logger.info(`\nTabla: ${tableName}`)

            const columns = await sql`
                SELECT c.column_name, c.data_type, 
                       c.is_nullable, c.column_default,
                       CASE 
                           WHEN pk.column_name IS NOT NULL THEN true
                           ELSE false
                       END as is_primary_key
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT ku.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage ku
                        ON tc.constraint_name = ku.constraint_name
                    WHERE tc.constraint_type = 'PRIMARY KEY'
                        AND tc.table_name = ${tableName}
                ) pk ON c.column_name = pk.column_name
                WHERE c.table_name = ${tableName}
                ORDER BY c.ordinal_position
            `

            // Imprimir información de cada columna
            columns.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
                const pk = col.is_primary_key ? '(PK)' : ''
                logger.info(`${tableName}: ${col.column_name} ${col.data_type} ${nullable} ${pk}`)
            })
        }

        logger.success("Esquema leído correctamente")
    }
    async init_schema() {

        // validate
        const rules = this.rules(".init_schema")
        const sql = await this.postgres.get_sql()
        rules(
            ["SQL debe estar inicializado", !sql]
        )
        // this._validate_template()
        // return;
        // logic
        const logger = this.logger
        logger.info("Iniciando inicialización del esquema")
        logger.info("Creando tablas")
        await this._create_tables(sql)
        
        logger.info("Creando columnas")
        await this._create_columns(sql)

        logger.success("Esquema inicializado correctamente")
    }

    async validate_schema() {
        const rules = this.rules(".validate_schema")
        const logger = this.logger

        logger.info("Iniciando validación del esquema")

        // validate
        const sql = await this.postgres.get_sql()
        rules(
            ["SQL debe estar inicializado", !sql]
        )

        logger.info("Obteniendo columnas existentes")
        const table_columns = await this._get_existing_table_columns(sql)
        rules(
            ["table_columns debe ser un objeto", typeof table_columns !== 'object'],
            ["table_columns no puede ser null", !table_columns]
        )
        
        // logic
        logger.info("Validando esquema")
        const errors = [
            ...this._validate_tables(table_columns),
            ...this._validate_columns(table_columns),
            ...this._validate_extra_tables(table_columns)
        ]

        if (errors.length > 0) {
            logger.error("Validación del esquema fallida")
            throw new Error('Schema validation failed:\n' + errors.join('\n'))
        }

        logger.success("Esquema validado correctamente")
    }
 
    _validate_template(){ // TODO: NO WORK
        const rules = this.rules("._validate_template")
        const logger = this.logger
        
        // validate
        rules(
            ["DB_CONFIG.schema_template debe ser un objeto", typeof DB_CONFIG.schema_template !== 'object'],
            ["DB_CONFIG.schema_template no puede ser null", !DB_CONFIG.schema_template],
            ["DB_CONFIG.schema_template debe tener al menos una tabla", Object.keys(DB_CONFIG.schema_template).length === 0]
        )

        // logic
        logger.info("Validando plantilla de esquema")
        
        // validate references
        let references = []

        function loop_references(callback){
            for (const table_def of schema) {
                for (const column of table_def.columns) {
                    if (column.references){
                        rules(
                            [`La referencia de la columna ${column.name} de la tabla ${table_def.name} debe tener un table`, !column.references.table],
                            [`La referencia de la columna ${column.name} de la tabla ${table_def.name} debe tener un column`, !column.references.column]
                        )
                        callback(column, table_def)
                    }
                }
            }
        }

        loop_references((column, table_def) => {
            const reference_name = `${column.references.table}.${column.references.column}`
            references.push({
                reference_name,
                table: column.references.table,
                column: column.references.column,
                exists: false
            })
        })

        loop_references((column, table_def) => {
            const reference = references.find(ref =>{
                const table_exists = ref.table === table_def.name;
                console.log(ref)
                const column_exists = ref.column === column.name;
                return table_exists && column_exists
            })
            if (reference) reference.exists = true
           
        })

        references.forEach((ref) => {
            if (!ref.exists) throw new Error(`Referencia "${ref.reference_name}" no existe`)
        })
    }

    // Métodos privados para init_schema
    async _create_tables(sql) {
        const rules = this.rules("._create_tables")
        const logger = this.logger

        // validate
        rules(
            ["SQL debe estar inicializado", !sql],
            ["schema debe ser un objeto", typeof schema !== 'object'],
            ["schema no puede ser null", !schema]
        )

        if (!DB_CONFIG.schema_template.create_tables_if_not_exists) return

        // logic
        for (const table_def of schema) {
            logger.info(`Creando tabla ${table_def.name}`)
            rules(
                [`La definición de la tabla ${table_def.name} debe tener columnas`, !table_def.columns],
                [`Las columnas de ${table_def.name} deben ser un array`, !Array.isArray(table_def.columns)]
            )

            await sql`
                CREATE TABLE IF NOT EXISTS ${sql(table_def.name)} (
                    ${sql.unsafe(this._generate_columns_definition(table_def.columns))}
                )
            `
        }
    }

    async _create_columns(sql) {
        const rules = this.rules("._create_columns")
        const logger = this.logger

        // validate
        rules(
            ["SQL debe estar inicializado", !sql],
            ["schema debe ser un objeto", typeof schema !== 'object'],
            ["schema no puede ser null", !schema]
        )

        if (!DB_CONFIG.schema_template.create_columns_if_not_exists_in_template) return

        // logic
        for (const table_def of schema) {
            logger.info(`Creando columnas para tabla ${table_def.name}`)
            rules(
                [`La definición de la tabla ${table_def.name} debe tener columnas`, !table_def.columns],
                [`Las columnas de ${table_def.name} deben ser un array`, !Array.isArray(table_def.columns)]
            )

            for (const column of table_def.columns) {
                rules(
                    [`La columna debe tener un nombre`, !column.name],
                    [`La columna debe tener un tipo`, !column.type]
                )

                logger.info(`Creando columna ${column.name}`)
                await sql`
                    ALTER TABLE ${sql(table_def.name)}
                    ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
                    ${sql.unsafe(this._generate_column_constraints(column))}
                `
            }
        }
    }

    // Métodos privados para validate_schema
    async _get_existing_table_columns(sql) {
        const rules = this.rules("._get_existing_table_columns")
        const logger = this.logger

        // validate
        rules(
            ["SQL debe estar inicializado", !sql]
        )

        // logic
        logger.info("Consultando columnas existentes en la base de datos")
        const existing_tables = await sql`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'public'
        `

        rules(
            ["existing_tables debe ser un array", !Array.isArray(existing_tables)]
        )

        return existing_tables.reduce((acc, col) => {
            if (!acc[col.table_name]) acc[col.table_name] = []
            acc[col.table_name].push(col)
            return acc
        }, {})
    }

    _validate_tables(table_columns) {
        const rules = this.rules("._validate_tables")
        const logger = this.logger

        // validate
        rules(
            ["table_columns debe ser un objeto", typeof table_columns !== 'object'],
            ["table_columns no puede ser null", !table_columns],
            ["schema debe ser un objeto", typeof schema !== 'object'],
            ["schema no puede ser null", !schema]
        )

        // logic
        logger.info("Validando existencia de tablas")
        const errors = []
        
        for (const table_def of schema) {
            if (!table_columns[table_def.name]) {
                errors.push(`Table "${table_def.name}" does not exist`)
            }
        }

        return errors
    }

    _validate_columns(table_columns) {
        const rules = this.rules("._validate_columns")
        const logger = this.logger

        // validate
        rules(
            ["table_columns debe ser un objeto", typeof table_columns !== 'object'],
            ["table_columns no puede ser null", !table_columns],
            ["schema debe ser un objeto", typeof schema !== 'object'],
            ["schema no puede ser null", !schema]
        )

        if (!DB_CONFIG.schema_template.validate_strict_columns) return []
        
        // logic
        logger.info("Validando columnas")
        const errors = []

        for (const table_def of schema) {
            if (!table_columns[table_def.name]) continue

            const schema_columns = new Set(table_def.columns.map(c => c.name))
            const db_columns = new Set(table_columns[table_def.name].map(c => c.column_name))

            errors.push(...this._find_missing_columns(schema_columns, db_columns, table_def.name))
            errors.push(...this._find_extra_columns(schema_columns, db_columns, table_def.name))
        }

        return errors
    }

    _find_missing_columns(schema_columns, db_columns, table_name) {
        const rules = this.rules("._find_missing_columns")

        // validate
        rules(
            ["schema_columns debe ser un Set", !(schema_columns instanceof Set)],
            ["db_columns debe ser un Set", !(db_columns instanceof Set)],
            ["table_name debe ser un string", typeof table_name !== 'string']
        )

        // logic
        return [...schema_columns]
            .filter(col => !db_columns.has(col))
            .map(col => `Column "${col}" missing in table "${table_name}"`)
    }

    _find_extra_columns(schema_columns, db_columns, table_name) {
        const rules = this.rules("._find_extra_columns")

        // validate
        rules(
            ["schema_columns debe ser un Set", !(schema_columns instanceof Set)],
            ["db_columns debe ser un Set", !(db_columns instanceof Set)],
            ["table_name debe ser un string", typeof table_name !== 'string']
        )

        if (!DB_CONFIG.schema_template.validate_strict_columns) return []

        // logic
        return [...db_columns]
            .filter(col => !schema_columns.has(col))
            .map(col => `Extra column "${col}" in table "${table_name}"`)
    }

    _validate_extra_tables(table_columns) {
        const rules = this.rules("._validate_extra_tables")

        // validate
        rules(
            ["table_columns debe ser un objeto", typeof table_columns !== 'object'],
            ["table_columns no puede ser null", !table_columns],
            ["schema debe ser un objeto", typeof schema !== 'object'],
            ["schema no puede ser null", !schema]
        )

        if (!DB_CONFIG.schema_template.validate_strict_tables) return []

        // logic
        const schema_tables = new Set(schema.map(table => table.name))
        return Object.keys(table_columns)
            .filter(table => !schema_tables.has(table))
            .map(table => `Extra table "${table}" in database`)
    }

    // Métodos helpers
    _generate_columns_definition(columns) {
        return columns
            .map(column => this._format_column_definition(column))
            .join(',\n        ')
    }

    _format_column_definition(column) {
        const constraints = this._generate_column_constraints(column)
        return `${column.name} ${column.type}${constraints ? ' ' + constraints : ''}`
    }

    _generate_column_constraints(column) {
        const constraints = []
        
        if (column.primary_key) constraints.push('PRIMARY KEY')
        if (column.not_null) constraints.push('NOT NULL')
        if (column.unique) constraints.push('UNIQUE')
        if (column.references) {
            const on_delete = DB_CONFIG.schema_template.references_delete_cascade ? 'CASCADE' : 'SET NULL'
            constraints.push(`REFERENCES ${column.references.table}(${column.references.column}) ON DELETE ${on_delete}`)
        }

        return constraints.join(' ')
    }
}

export default DB