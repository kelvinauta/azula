import _Table from "../../Services/Agent/db/tables/_Table.js";

class TestTable extends _Table {}
const table = await TestTable.getInstance();
await table.many_to_many({});