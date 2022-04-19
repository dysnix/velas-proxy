const bigTable = require('../utils/bigTableUtil')
const { proxyWebsocket, proxyWebsocketNoHandle, handleWsProxy } = require('../utils/proxy')
const proxyUtil = require("../utils/proxy");

async function eth_getBlockByHash (message, request, socket, head, proxy) {
    let connection = request.accept()
    await proxyWebsocket(request, socket, head, proxy);
    let data = {};
    if (await bigTable.checkRequestTime(message.id)) {
        data = await bigTable.readBlock(message.params, process.env.GOOGLE_BIGTABLE_BLOCK_BY_HASH_TABLE_ID);
    }
    await handleWsProxy(proxy, connection, data)
}

async function eth_getBlockByName (message, request, socket, head, proxy) {
    let connection = request.accept()
    await proxyWebsocket(request, socket, head, proxy);
    let data = {};
    if (await bigTable.checkRequestTime(message.id)) {
        data = await bigTable.readBlock(message.params, process.env.GOOGLE_BIGTABLE_BLOCK_TABLE_ID);
    }
    await handleWsProxy(proxy, connection, data)
}

async function eth_getBlockTransactionCountByHash (message, request, socket, head, proxy) {
    await proxyWebsocketNoHandle(request, socket, head, proxy);
}

async function eth_getBlockTransactionCountByNumber (message, request, socket, head, proxy) {
    await proxyWebsocketNoHandle(request, socket, head, proxy);
}

async function eth_getLogs (message, request, socket, head, proxy) {
    let connection = request.accept()
    await proxyUtil.proxyWebsocket(request, socket, head, proxy);
    let data = {};
    if (await bigTable.checkRequestTime(message.id)) {
        data = await bigTable.readLog(message.params);
    }
    await handleWsProxy(proxy, connection, data)
}

async function eth_getTxReceipt (message, request, socket, head, proxy) {
    let connection = request.accept()
    await proxyWebsocket(request, socket, head, proxy);
    let data = {};
    if (await bigTable.checkRequestTime(message.id)) {
        data = await bigTable.readReceipt(message.params);
    }
    await handleWsProxy(proxy, connection, data)
}

module.exports = {eth_getBlockByName, eth_getBlockByHash, eth_getBlockTransactionCountByHash, eth_getBlockTransactionCountByNumber, eth_getLogs, eth_getTxReceipt}