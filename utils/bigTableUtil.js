'use strict'
const { Bigtable } = require('@google-cloud/bigtable');
const protobuf = require('protobufjs');
const bzip2 = require('bz2');
const { ungzip } = require('node-gzip');
const { decompress } = require('@xingrz/cppzst');
let cashedBlockNumber;

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
    console.log(`Read Log from BigTable by filter start with ${filterObject[0].fromBlock} end on ${filterObject[0].toBlock }`)
    let bigtable = new Bigtable();
    let instance = bigtable.instance(process.env.GOOGLE_BIGTABLE_INSTANCE_ID);
    let table = instance.table(process.env.GOOGLE_BIGTABLE_LOGS_TABLE_ID);
    let filter = await getLogsFilter(filterObject);
    return table.createReadStream(filter);
}

async function checkRequestTime (blockNumber) {
    Promise.all([refreshCashedBlockNumber()]).then()
    let blockNumberInInt = parseInt(blockNumber, 16)
    let createdTime = (cashedBlockNumber * 0.4) - (blockNumberInInt * 0.4);
    let d = Math.floor(createdTime / (3600*24));
    return process.env.DEFAULT_WEB_HOST ? true : d > process.env.PERIOD;
}

async function refreshCashedBlockNumber() {
    let host = process.env.PROXY_WEB_HOST ? process.env.PROXY_WEB_HOST : process.env.DEFAULT_WEB_HOST = "https://evmexplorer.velas.com/rpc"

    let body = {
        id: "1",
        method: "eth_blockNumber",
        jsonrpc: "2.0"
    }
    require('axios').post(host, body).then(data => {
        cashedBlockNumber = parseInt(data.data.result, 16);
    })
    body = null; host = null;
}

async function getLogsFilter(filterObject) {
    let start = filterObject[0].fromBlock;
    let end = filterObject[0].toBlock;
    return { start, end }
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
    if(!result) return buffer
    else return result;
}

module.exports = { readBlockFromBigTable, readReceiptFromBigTable, readLogFromBigTable, checkRequestTime, refreshCashedBlockNumber, readLog }