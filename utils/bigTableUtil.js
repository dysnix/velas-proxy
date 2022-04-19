const {Bigtable} = require('@google-cloud/bigtable');

async function readBlock (filter, tableId) {
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(tableId);
    let result = await table.row(filter).get();
    return result}

async function readReceipt (id) {
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_TX_TABLE_ID);
    let result = await table.row(id).get();
    return result
}

async function readLog (filterObject) {
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_LOGS_TABLE_ID);
    let filter = await getLogsFilter(filterObject);
    let result = await table.getRows({
        limit: 1,
        filter
    });
    return result
}

async function checkRequestTime (id) {
    let createdTime = 0.4 * id;
    let d = Math.floor(createdTime / (3600*24));
    return d > process.env.PERIOD;
}

async function getLogsFilter(filterObject) {
    let filter = {
        column: {
            family: filterObject.address,
        }
    }
    if(filterObject.blockhash) {
        filter.column = filterObject.blockhash;
    } else {
        filter.column.start = filterObject.fromBlock;
        filter.column.end.value = filterObject.toBlock;
    }
    if(filterObject.topics) {
        for(let topic of filterObject.topics) {
            if(!Array.isArray(topic)) {
                filter.interleave = [
                    {
                        value: topic,
                    },
                    {column: 'topic'},
                ]
            }
        }
    }

    return filter
}

module.exports = { readBlock, readReceipt, readLog, checkRequestTime }