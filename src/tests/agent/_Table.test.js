import _Table from "../Services/Agent/db/tables/_Table";
import Postgres from "../Services/Agent/db/postgres";
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DataTypes } from "sequelize";
// Clase de prueba que hereda de _Table
class TestTable extends _Table {
    static attributes = {
        ..._Table.attributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };
}

// Segunda clase de prueba para relaciones
class TestTable2 extends _Table {
    static attributes = {
        ..._Table.attributes,
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };
}

describe('Pruebas para _Table y TestTable', () => {
    // Solo probaremos TestTable ya que _Table no puede ser instanciada
    const classesToTest = [TestTable];
    
    beforeEach(() => {
        // Resetear instancias antes de cada prueba
        _Table.instance = null;
        _Table.is_synced = false;
        _Table.db = null;
        TestTable.instance = null;
        TestTable.is_synced = false;
        TestTable.db = null;
        TestTable2.instance = null;
        TestTable2.is_synced = false;
        TestTable2.db = null;
    });

    it('_Table no debería poder ser instanciada directamente', async () => {
        await expect(_Table.getInstance()).rejects.toThrow("Table cannot be instantiated");
    });

    classesToTest.forEach(TableClass => {
        describe(`Pruebas para ${TableClass.name}`, () => {

            it('sync debería dar error si la base de datos no está iniciada', async () => {
                const instance = await TableClass.getInstance();
                instance.constructor.db = null;
                await expect(instance.sync()).rejects.toThrow();
            });

            it('debería dar error al crear instancia usando constructor directamente', () => {
                expect(() => {
                    new TableClass();
                }).toThrow("Db is required");
            });

            it('debería crear instancia correctamente usando getInstance', async () => {
                const instance = await TableClass.getInstance();
                expect(instance).toBeInstanceOf(TableClass);
            });

            it('db debería ser instancia de Postgres después de getInstance', async () => {
                const instance = await TableClass.getInstance();
                expect(instance.db).toBeInstanceOf(Postgres);
                expect(Postgres.instance.is_connected).toBe(true);
            });

            it('sync debería setear is_synced como true', async () => {
                const instance = await TableClass.getInstance();
                await instance.sync();
                expect(TableClass.is_synced).toBe(true);
            });

            it('getInstance debería devolver la misma instancia en llamadas múltiples', async () => {
                const instance1 = await TableClass.getInstance();
                instance1.custom_property = "custom_value";
                const instance2 = await TableClass.getInstance();
                expect(instance1.custom_property).toBe(instance2.custom_property);
            });
        });
    });

    describe('Pruebas de relaciones', () => {
        let table1, table2;

        beforeEach(async () => {
            table1 = await TestTable.getInstance();
            table2 = await TestTable2.getInstance();
            await table1.sync();
            await table2.sync();
        });

        describe('ref (relación uno a muchos)', () => {
            it('debería crear relación uno a muchos correctamente', () => {
                expect(() => {
                    table1.ref(table2);
                }).not.toThrow();
            });

            it('debería dar error si ref_table no es instancia de _Table', () => {
                expect(() => {
                    table1.ref({});
                }).toThrow("ref_table must be an instance of _Table");
            });

            it('debería dar error si foreign_key_name no es string', () => {
                expect(() => {
                    table1.ref(table2, 123);
                }).toThrow("foreign_key_name must be a string");
            });
        });

        describe('many_to_many (relación muchos a muchos)', () => {
            it('debería crear relación muchos a muchos correctamente', async () => {
                const relationTable = await table1.many_to_many(table2);
                expect(relationTable).toBeInstanceOf(_Table);
            });

            it('debería dar error si ref_table no es instancia de _Table', async () => {
                await expect(table1.many_to_many({})).rejects.toThrow("Table must be an instance of _Table");
            });

            it('no debería permitir relación muchos a muchos con la misma tabla', async () => {
                await expect(table1.many_to_many(table1)).rejects.toThrow("Table must be different from the current table");
            });
            it('al crear varias ref_tables deeberian ser diferentes', async () => {
                const relationTable = await table1.many_to_many(table2);
                relationTable.test_property = "test_value";
                const relationTable2 = await table1.many_to_many(table2);
                expect(relationTable.test_property).not.toBe(relationTable2.test_property);
            }); 
        });
    });
});
