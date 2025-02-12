constder>f DB_CONFIG = {
    schema_template:{
        // Crear tablas si no existen
        create_tables_if_not_exists: true,
        
        // Crear columnas si no existen en el template
        create_columns_if_not_exists_in_template: true,
        
        // Eliminar referencias en cascada o cambiar a null
        references_delete_cascade: true,
        
        // No eliminar columnas que no estén en el template
        delete_columns_if_not_exists_in_template: false,

        // Si es true: las columnas deben ser las mismas en la tabla y en el template, 
        // Si es false: sólo se comprobará que las columnas existan
        validate_strict_columns: false,

        // Si es true: las tablas deben ser las mismas en la tabla y en el template, 
        // Si es false: sólo se comprobará que las tablas existan
        validate_strict_tables: false,
    }
}

export default DB_CONFIG
