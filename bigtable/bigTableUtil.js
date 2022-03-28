const {Bigtable} = require('@google-cloud/bigtable');

async function saveBlock (object) {
    let bigtable = new Bigtable({projectId: 'velasnetwork'});
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_BLOCK_TABLE_ID);
    await table.insert(object);
}

async function saveLog (object) {
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_LOGS_TABLE_ID);
    await table.insert(object);
}

async function saveReceipt (object) {
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_TX_TABLE_ID);
    await table.insert(object);
}

async function readLog () {
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_LOGS_TABLE_ID);
    let filter = [
        {
            column: {
                cellLimit: 1
            },
        },
    ]
    let [allRows] = await table.getRows({filter});
    return allRows;
}

async function checkRequestTime (id) {
    let createdTime = new Date(1970, 0, 1).getSeconds() + (0.4 * id);
    let d = new Date(Date.now() - 12096e5)
    let twoWeeksAgo = await d/1000|0;
    return twoWeeksAgo < createdTime;
}

module.exports = { saveBlock, saveLog, saveReceipt, readLog, checkRequestTime }