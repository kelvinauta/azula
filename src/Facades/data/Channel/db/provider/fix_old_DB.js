export async function fix_messages_without_role(db) {
  console.log("Verificando campo 'role' en tabla Messages...");
  
  try {
    let tableExists = false;
    let hasRoleColumn = false;
    
    if (db.options.dialect === 'sqlite') {
      // Verificar si la tabla existe
      const tables = await db.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Messages'",
        { type: db.QueryTypes.SELECT }
      );
      tableExists = tables.length > 0;
      
      if (tableExists) {
        // Verificar si la columna role existe
        const columns = await db.query(
          "PRAGMA table_info(Messages)",
          { type: db.QueryTypes.SELECT }
        );
        hasRoleColumn = columns.some(col => col.name === 'role');
      }
    } else if (db.options.dialect === 'postgres') {
      // Verificar si la tabla existe
      const tables = await db.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Messages'",
        { type: db.QueryTypes.SELECT }
      );
      tableExists = tables.length > 0;
      
      if (tableExists) {
        // Verificar si la columna role existe
        const columns = await db.query(
          "SELECT column_name FROM information_schema.columns WHERE table_name = 'Messages' AND column_name = 'role'",
          { type: db.QueryTypes.SELECT }
        );
        hasRoleColumn = columns.length > 0;
      }
    }
    
    // Si la tabla no existe o ya tiene la columna, terminar
    if (!tableExists) {
      console.log("La tabla 'Messages' no existe todavía");
      return;
    }
    
    if (hasRoleColumn) {
      console.log("La columna 'role' ya existe en la tabla Messages");
      return;
    }
    
    console.log("Añadiendo columna 'role' a la tabla Messages...");
    
    // Añadir la columna según el dialecto
    if (db.options.dialect === 'sqlite') {
      await db.query("ALTER TABLE Messages ADD COLUMN role TEXT CHECK(role IN ('user', 'assistant', 'developer', 'system'))");
    } else if (db.options.dialect === 'postgres') {
      // En Postgres, crear un tipo ENUM primero si no existe
      await db.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_messages_role') THEN
            CREATE TYPE enum_messages_role AS ENUM ('user', 'assistant', 'developer', 'system');
          END IF;
        END$$;
      `);
      await db.query("ALTER TABLE \"Messages\" ADD COLUMN role enum_messages_role");
    }
    
    console.log("Actualizando valores de 'role' según AgentId y HumanId...");
    
    // Actualizar registros existentes
    const quotedTable = db.options.dialect === 'postgres' ? '"Messages"' : 'Messages';
    
    // Si tiene AgentId, asignar role = 'assistant'
    await db.query(`
      UPDATE ${quotedTable} 
      SET role = 'assistant' 
      WHERE "AgentId" IS NOT NULL
    `);
    
    // Si tiene HumanId, asignar role = 'user'
    await db.query(`
      UPDATE ${quotedTable} 
      SET role = 'user' 
      WHERE "HumanId" IS NOT NULL
    `);
    
    console.log("Corrección de 'role' en tabla Messages completada con éxito");
    
  } catch (error) {
    console.error("Error al corregir campo 'role' en tabla Messages:", error);
    throw error;
  }
}
