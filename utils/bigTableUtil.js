const { Bigtable } = require('@google-cloud/bigtable');
const protobuf = require('protobufjs');
const bzip2 = require('bz2');
const { ungzip } = require('node-gzip');
const { decompress } = require('@xingrz/cppzst');

async function readBlockFromBigTable (filter, tableId) {
    console.log(`Read EvmFullBlock from BigTable for block ${filter}`)
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(tableId);
    let [row] = await table.row(filter).get();
    let value = row.data.x.bin ? readRow(row.data.x.bin) : readRow(row.data.x.proto)
    let isProto = row.data.x.bin === undefined;
    if(isProto) return await readProtoBlock(value);
    else return await readBincodeBlock(value);
}

async function readReceiptFromBigTable (id) {
    console.log(`Read TransactionReceipt from BigTable for hash ${id}`)
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_TX_TABLE_ID);
    let [row] = await table.row(id).get();
    let value = readRow(row.data.x.proto)
    return await readTxBlock(value);
}

async function readLogFromBigTable (filterObject) {
    console.log(`Read Log from BigTable for hash ${id}`)
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_LOGS_TABLE_ID);
    let filter = await getLogsFilter(filterObject);
    let [row] = await table.getRows({
        limit: 1,
        filter
    });
    let value = readLog(row.data.x.proto)
    return await readTxBlock(value);
}

async function checkRequestTime (blockNumber) {
    let blockNumberInInt = parseInt(blockNumber, 16)
    let createdTime = blockNumberInInt * 0.4;
    let d = Math.floor(createdTime / (3600*24));
    return d < process.env.PERIOD;
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

function readRow(rowArray) {
    let index = 0;
    let value = "";
    while (index < rowArray.length) {
        value+=rowArray[index].value.toString('utf8')
        index++
    }
    return value
}

async function readProtoBlock(value) {
    let buffer = Buffer.from(value, 'hex');
    let decompressed = await decompressData(buffer);
    let root = await protobuf.loadSync('proto/block.proto');
    let Block = root.lookupType('solana.storage.EvmCompatibility.EvmFullBlock');
    let block = Block.decode(decompressed);
    return Block.toObject(block);
}

async function readBincodeBlock(value) {
    let buffer = Buffer.from(value, 'hex');
    let decompressed = await decompressData(buffer);
    let root = await protobuf.loadSync('proto/block.proto');
    let Block = root.lookupType('solana.storage.EvmCompatibility.EvmFullBlock');
    let block = Block.decode(decompressed);
    return Block.toObject(block);
}

async function readTxBlock(value) {
    let buffer = Buffer.from(value, 'hex');
    let decompressed = await decompressData(buffer);
    let root = await protobuf.loadSync('proto/block.proto');
    let Receipt = root.lookupType('solana.storage.EvmCompatibility.TransactionReceipt');
    let receipt = Receipt.decode(decompressed);
    return Receipt.toObject(receipt);
}

async function readLog(value) {
    let buffer = Buffer.from(value, 'hex');
    let decompressed = await decompressData(buffer);
    let root = await protobuf.loadSync('proto/block.proto');
    let Receipt = root.lookupType('solana.storage.EvmCompatibility.Log');
    let receipt = Receipt.decode(decompressed);
    return Receipt.toObject(receipt);
}

async function decompressData(buffer) {
    let result = undefined;
    try { result = await decompress(buffer); } catch (e) { console.log('Failed decompression with zst. Trying gzip...'); }
    if(!result) try { result = await ungzip(buffer); } catch (e) { console.log('Failed decompression with gzip. Trying bz2...'); }
    if(!result) try { result = bzip2.decompress(buffer); } catch (e) { console.log('Failed decompression with bz2. Uncompressed value'); }
    if(!result) result = buffer;
    return result;
}

module.exports = { readBlockFromBigTable, readReceiptFromBigTable, readLogFromBigTable, checkRequestTime }