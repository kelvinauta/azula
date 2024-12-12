import Core from "./core";
import Insert from "./insert";
import Delete from "./delete";
import Query from "./query";
import Update from "./update";

async function Bulk() {
    const core = new Core();
    await core.init()
    return {
        core,
        client: core.client,
        insert: new Insert(core.client),
        delete: new Delete(core.client), 
        query: new Query(core.client), 
        update: new Update(core.client), 
    };
}

export default Bulk
